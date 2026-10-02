<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    /**
     * Can the user browse the employee directory?
     */
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::ViewAllEmployees);
    }

    /**
     * Can the user open this employee's balance and history page?
     *
     * Everyone may open their own; everyone else needs the HR permission.
     */
    public function view(User $user, Employee $employee): bool
    {
        if ($this->isSelf($user, $employee)) {
            return $user->can(Permission::ViewOwnBalance);
        }

        return $user->can(Permission::ViewAllBalances);
    }

    public function create(User $user): bool
    {
        return $user->can(Permission::CreateEmployees);
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->can(Permission::UpdateAnyEmployee);
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->can(Permission::DeleteEmployees);
    }

    /**
     * A user is always allowed to see their own linked employee record, which
     * is what lets them reach their own balance page.
     */
    public function viewSelf(User $user): bool
    {
        return $user->employees()->exists();
    }

    protected function isSelf(User $user, Employee $employee): bool
    {
        return $user->employees()->whereKey($employee->id)->exists();
    }
}
