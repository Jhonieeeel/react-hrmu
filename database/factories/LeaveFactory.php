<?php

namespace Database\Factories;

use App\Models\Leave;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Leave>
 */
class LeaveFactory extends Factory
{

    public static function balances(): array
    {
        return [
            ['vacation leave' => 5.584, 'sick leave' => 10.792, 'force leave' => 5.000],
            ['vacation leave' => 6.188, 'sick leave' => 11.583, 'force leave' => 5.000],
            ['vacation leave' => 14.313, 'sick leave' => 22.833, 'force leave' => 5.000],
            ['vacation leave' => 61.890, 'sick leave' => 154.583, 'force leave' => 5.000],
            ['vacation leave' => 6.368, 'sick leave' => 11.583, 'force leave' => 5.000],
            ['vacation leave' => 19.875, 'sick leave' => 308.250, 'force leave' => 5.000],
            ['vacation leave' => 6.530, 'sick leave' => 11.708, 'force leave' => 5.000],
            ['vacation leave' => 85.496, 'sick leave' => 126.500, 'force leave' => 5.000],
            ['vacation leave' => 58.895, 'sick leave' => 70.833, 'force leave' => 5.000],
            ['vacation leave' => 95.102, 'sick leave' => 114.167, 'force leave' => 5.000],
            ['vacation leave' => 76.800, 'sick leave' => 112.750, 'force leave' => 5.000],
            ['vacation leave' => 55.575, 'sick leave' => 69.462, 'force leave' => 5.000],
            ['vacation leave' => 79.479, 'sick leave' => 100.000, 'force leave' => 5.000],
            ['vacation leave' => 41.644, 'sick leave' => 53.667, 'force leave' => 5.000],
            ['vacation leave' => 139.122, 'sick leave' => 270.292, 'force leave' => 5.000],
            ['vacation leave' => 81.921, 'sick leave' => 122.500, 'force leave' => 5.000],
            ['vacation leave' => 132.852, 'sick leave' => 259.000, 'force leave' => 5.000],
            ['vacation leave' => 72.169, 'sick leave' => 127.500, 'force leave' => 5.000],
            ['vacation leave' => 65.113, 'sick leave' => 127.500, 'force leave' => 5.000],
            ['vacation leave' => 6.516, 'sick leave' => 11.583, 'force leave' => 5.000],
        ];
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //
        ];
    }
}
