<?php

namespace Database\Factories;

use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Section>
 */
class SectionFactory extends Factory
{
    public static function sections(): array
    {
        return [
            ['section_name' => 'Administrative and Financial Management Section', 'section_code' => 'AFMS'],
            ['section_name' => 'Operation Section', 'section_code' => 'OS'],
            ['section_name' => 'Rehabilitation and Recovery Management Section', 'section_code' => 'RRMS'],
            ['section_name' => 'Capacity Building and Training Section', 'section_code' => 'CBTS'],
            ['section_name' => 'Policy Development and Planning Section', 'section_code' => 'PDPS'],
        ];
    }

    public function definition(): array
    {
        // Sequence-based codes: `unique()->lexify('S###')` has only 9000
        // combinations and runs out when a test creates many sections.
        static $sequence = 0;

        return [
            'section_name' => fake()->words(3, true).' '.($sequence + 1),
            'section_code' => 'S'.str_pad((string) $sequence++, 4, '0', STR_PAD_LEFT),
        ];
    }
}
