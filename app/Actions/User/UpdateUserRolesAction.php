<?php

namespace App\Actions\User;

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission as PermissionModel;
use Spatie\Permission\Models\Role as RoleModel;

/**
 * Replaces a user's role assignments and any permissions granted directly to
 * them, as distinct from the ones their roles confer.
 *
 * The "at least one super admin must remain" rule is enforced here rather than
 * only in the UI, because this is the one place a role can be removed.
 */
class UpdateUserRolesAction
{
    /**
     * @param  list<string>  $roles
     * @param  list<string>  $permissions  Granted directly to the user.
     */
    public function execute(
        User $target,
        array $roles,
        User $actor,
        ?array $permissions = null,
    ): User {
        Gate::forUser($actor)->authorize('assignRole', $target);

        $validated = validator(
            ['roles' => $roles, 'permissions' => $permissions],
            [
                'roles' => ['sometimes', 'array'],
                'roles.*' => ['string', Rule::in(Role::values())],
                'permissions' => ['sometimes', 'nullable', 'array'],
                'permissions.*' => ['string', Rule::in(Permission::values())],
            ]
        )->validate();

        $roles = $validated['roles'] ?? [];

        $isDemoting = $target->isSuperAdmin()
            && ! in_array(Role::SuperAdmin->value, $roles, true);

        // Checked inline rather than through the Gate on purpose: the Gate's
        // before-hook grants a super admin every ability, which would let the
        // very last super admin remove their own role and lock everyone out.
        if ($isDemoting && $target->isOnlySuperAdmin()) {
            throw new AuthorizationException(
                'The last super admin cannot be demoted. Promote another user first.'
            );
        }

        DB::transaction(function () use ($target, $roles, $permissions) {
            $target->syncRoles($roles);

            // Only touched when the caller sent the key, so a role-only request
            // cannot silently wipe direct permissions.
            if ($permissions !== null) {
                $target->syncPermissions($permissions);
            }
        });

        $target->unsetRelation('roles')->unsetRelation('permissions');

        return $target->fresh(['roles', 'permissions']);
    }

    /**
     * Available roles for the UI, with the permission count each confers.
     *
     * @return list<array{name: string, label: string, description: string, permission_count: int}>
     */
    public function options(): array
    {
        $options = [];

        foreach (Role::cases() as $role) {
            $options[] = [
                'name' => $role->value,
                'label' => Str::headline($role->value),
                'description' => $this->describe($role),
                'permission_count' => RoleModel::findByName($role->value)
                    ->permissions()
                    ->count(),
            ];
        }

        return $options;
    }

    protected function describe(Role $role): string
    {
        return match ($role) {
            Role::SuperAdmin => 'Unrestricted access to every module, including granting roles.',
            Role::HrOfficer => 'Manages employees, balances and leave approvals. Cannot grant roles.',
        };
    }

    /**
     * Permissions the actor is allowed to hand out, grouped for display.
     *
     * The baseline set is excluded: those are granted to every authenticated
     * user by the Gate::before hook, so offering them as checkboxes would
     * suggest they can be revoked, which they cannot.
     *
     * @return array<string, list<string>>
     */
    public function assignablePermissions(User $actor): array
    {
        if (! $actor->can(Permission::AssignRoles)) {
            return [];
        }

        $baseline = array_column(Permission::baseline(), 'value');

        return collect(Permission::cases())
            ->reject(fn (Permission $permission) => in_array($permission->value, $baseline, true))
            ->groupBy(fn (Permission $permission) => $permission->group())
            ->map(fn ($group) => $group
                ->map(fn (Permission $permission) => $permission->value)
                ->values()
                ->all()
            )
            ->all();
    }

    /**
     * The current access state of a user, for populating the editor.
     *
     * @return array{roles: list<string>, permissions: list<string>, effective: list<string>}
     */
    public function accessFor(User $target): array
    {
        return [
            'roles' => $target->getRoleNames()->values()->all(),
            // Direct grants only. What the roles confer is listed separately by
            // the UI so the two sources are never confused for one another.
            'permissions' => $target->getDirectPermissions()
                ->pluck('name')
                ->values()
                ->all(),
            'effective' => $target->effectivePermissions(),
        ];
    }

    /**
     * Permission counts for the admin overview.
     *
     * @return array{roles: int, permissions: int}
     */
    public function catalogueCounts(): array
    {
        return [
            'roles' => RoleModel::query()->count(),
            'permissions' => PermissionModel::query()->count(),
        ];
    }
}
