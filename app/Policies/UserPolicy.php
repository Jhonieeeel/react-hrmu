<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

/**
 * Authorization rules that act on a User record rather than on its Employee
 * record (e.g. role assignment).
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::ViewAllEmployees);
    }

    /**
     * A user may always open their own account.
     */
    public function view(User $user, User $target): bool
    {
        return $user->is($target) || $user->can(Permission::ViewAllEmployees);
    }

    public function update(User $user, User $target): bool
    {
        return $user->is($target) || $user->can(Permission::UpdateAnyEmployee);
    }

    /**
     * Can the user change this user's role assignments?
     */
    public function assignRole(User $user, User $target): bool
    {
        return $user->can(Permission::AssignRoles);
    }
}
