<?php

namespace App\Actions\User;

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role as RoleModel;

/**
 * Replaces a user's role assignments.
 *
 * The "at least one super admin must remain" rule is enforced here rather than
 * only in the UI, because this is the one place a role can be removed.
 */
class UpdateUserRolesAction
{
    /**
     * @param  list<string>  $roles
     */
    public function execute(User $target, array $roles, User $actor): User
    {
        Gate::forUser($actor)->authorize('assignRole', $target);

        $validated = validator(
            ['roles' => $roles],
            [
                'roles' => ['sometimes', 'array'],
                'roles.*' => ['string', Rule::in(Role::values())],
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

        DB::transaction(function () use ($target, $roles) {
            $target->syncRoles($roles);
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
                'label' => str($role->value)->headline()->toString(),
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
     * Permissions the actor is allowed to hand out.
     *
     * @return list<string>
     */
    public function assignablePermissions(User $actor): array
    {
        if (! $actor->can(Permission::AssignRoles)) {
            return [];
        }

        return Permission::values();
    }
}
