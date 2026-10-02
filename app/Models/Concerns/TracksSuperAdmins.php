<?php

namespace App\Models\Concerns;

use App\Actions\User\UpdateUserRolesAction;
use App\Enums\Role;
use App\Models\User;
use Spatie\Permission\PermissionRegistrar;

/**
 * Guards the "there must always be at least one super admin" invariant.
 *
 * Lives with the model rather than in a controller because the seeder relies on
 * the same check, and because the super admin's Gate bypass means a policy alone
 * cannot enforce it.
 *
 * @see UpdateUserRolesAction for the check that blocks the demotion.
 */
trait TracksSuperAdmins
{
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SuperAdmin);
    }

    /**
     * Whether this user is the only super admin left.
     */
    public function isOnlySuperAdmin(): bool
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return static::query()
            ->role(Role::SuperAdmin)
            ->whereKeyNot($this->getKey())
            ->doesntExist();
    }

    /**
     * Removes the super admin role unless doing so would strand the system.
     *
     * @return bool True when the role was actually removed.
     */
    public function revokeSuperAdminSafely(): bool
    {
        if (! $this->isSuperAdmin()) {
            return false;
        }

        if ($this->isOnlySuperAdmin()) {
            return false;
        }

        $this->removeRole(Role::SuperAdmin);

        return true;
    }
}
