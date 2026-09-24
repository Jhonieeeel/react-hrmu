<?php

namespace App\Actions\User;

use App\Data\UserDTO;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    public function execute(UserDTO $data): User {

        $user =  User::create([
                'name' => $data->name,
                'email' => $data->email,
                'employee_type' => $data->employee_type,
                'password' => Hash::make($data->password),
            ]);

        $employee = null;

        if ($data->position) {
            $employee = Employee::create([
                'user_id' => $user->id,
                'position' => $data->position,
                'division_id' => $data->division_id,
                'section_id' => $data->section_id,
                'unit_id' => $data->unit_id,
            ]);
        }

        if ($data->employee_type === 'new employee' && $employee) {
            $this->defaultBalance($data, $employee);
        }

        return $user;
    }

    public function defaultBalance(UserDTO $data, Employee $employee)
    {
        $leaves = ['vacation leave', 'sick leave'];

        foreach ($leaves as $leave) {
            Leave::create([
                'employee_id' => $employee->id,
                'leave_type' => $leave,
                'event_type' => 'accrual',
                'event_tag' => 'accrual',
                'balance' => 0,
                'starts_at' => $data->starts_at,
                'ends_at' => $data->ends_at
            ]);
       }

        //    monthly filing
        Leave::create([
             'employee_id' => $employee->id,
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at,
            'status' => false
        ]);
    }
}
