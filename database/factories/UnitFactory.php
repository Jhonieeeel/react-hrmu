<?php

namespace Database\Factories;

use App\Models\Section;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    public static function units(): array
    {
        return [
            'AFMS' => [
                ['unit_name' => 'Finance Management Unit', 'unit_code' => 'FMU'],
                ['unit_name' => 'Procurement Management Unit', 'unit_code' => 'PMU'],
                ['unit_name' => 'Records Management Unit', 'unit_code' => 'RMU'],
                ['unit_name' => 'Human Resource Management Unit', 'unit_code' => 'HRMU'],
                ['unit_name' => 'General Administrative Support Unit', 'unit_code' => 'GASU'],
            ],
        ];
    }

    public function definition(): array
    {
        return [
            'unit_name' => fake()->unique()->words(3, true),
            'unit_code' => strtoupper(fake()->unique()->lexify('U###')),
        ];
    }

    public function forSection(Section $section): static
    {
        return $this->state(fn() => ['section_id' => $section->id]);
    }
}
