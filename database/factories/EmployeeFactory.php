<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Section;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'position' => 'Programmer',
            'unit_id' => Unit::factory()->for(Section::factory(), 'section'),
        ];
    }
}
