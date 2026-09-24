<?php

namespace App\Actions\User;

use App\Models\Employee;
use App\Models\User;

class UpdateEmployeeDetailsAction
{
    /**
     * @param array{name: string, email: string, employee_type: string, position: string, division_id: int|null, section_id: int|null, unit_id: int|null} $data
     */
    public function execute(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'employee_type' => $data['employee_type'],
        ]);

        $employee = $user->employees()->first();

        if ($employee) {
            $employee->update([
                'position' => $data['position'],
                'division_id' => $data['division_id'],
                'section_id' => $data['section_id'],
                'unit_id' => $data['unit_id'],
            ]);
        } else {
            Employee::create([
                'user_id' => $user->id,
                'position' => $data['position'],
                'division_id' => $data['division_id'],
                'section_id' => $data['section_id'],
                'unit_id' => $data['unit_id'],
            ]);
        }

        return $user->load('employees.section', 'employees.unit');
    }
}
