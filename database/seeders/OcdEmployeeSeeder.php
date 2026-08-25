<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Unit;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OcdEmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $defaultUnit = Unit::first();

        foreach (UserFactory::ocdEmployees() as $data) {
            $user = User::create([
                'name' => $data['name'],
                'username' => Str::slug($data['name'], ''),
                'email' => $data['email'],
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ]);

            Employee::create([
                'user_id' => $user->id,
                'unit_id' => $defaultUnit?->id,
                'employee_type' => $data['employee_type'],
            ]);
        }
    }
}
