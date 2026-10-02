<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Holiday;
use App\Models\User;

class HolidayPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can(Permission::ManageHolidays);
    }

    public function update(User $user, Holiday $holiday): bool
    {
        return $user->can(Permission::ManageHolidays);
    }

    public function delete(User $user, Holiday $holiday): bool
    {
        return $user->can(Permission::ManageHolidays);
    }
}
