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

    /**
     * Unique codes come from a sequence rather than Faker's `unique()` pool.
     * `unique()->lexify('U###')` only has 9000 combinations, which a test that
     * creates many employees can exhaust.
     */
    public function definition(): array
    {
        static $sequence = 0;

        return [
            'unit_name' => fake()->words(3, true).' '.($sequence + 1),
            'unit_code' => 'U'.str_pad((string) $sequence++, 4, '0', STR_PAD_LEFT),
        ];
    }

    public function forSection(Section $section): static
    {
        return $this->state(fn () => ['section_id' => $section->id]);
    }
}
