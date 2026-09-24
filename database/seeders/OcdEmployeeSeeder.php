<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Unit;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OcdEmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $defaultUnit = Unit::query()->firstOrFail();

        foreach (UserFactory::ocdEmployees() as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'email_verified_at' => now(),
                    'employee_type' => $data['employee_type'],
                    'password' => Hash::make('password'),
                ],
            );

            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'position' => 'Employee',
                    'section_id' => $defaultUnit->section_id,
                    'unit_id' => $defaultUnit->id,
                ],
            );
        }
    }
}
