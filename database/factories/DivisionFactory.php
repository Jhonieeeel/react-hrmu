<?php

namespace Database\Factories;

use App\Models\Division;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Division>
 */
class DivisionFactory extends Factory
{
    /**
     * Sequence-based codes: Faker's `unique()->lexify('D###')` has only 9000
     * combinations and runs out when a test creates many divisions.
     */
    public function definition(): array
    {
        static $sequence = 0;

        return [
            'division_name' => fake()->words(3, true).' Division '.($sequence + 1),
            'division_code' => 'D'.str_pad((string) $sequence++, 4, '0', STR_PAD_LEFT),
        ];
    }
}
