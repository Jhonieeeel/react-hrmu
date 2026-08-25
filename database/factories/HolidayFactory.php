<?php

namespace Database\Factories;

use App\Models\Holiday;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Holiday>
 */
class HolidayFactory extends Factory
{
    public static function holidays(): array
    {
        return [
            ['holiday_name' => "New Year's Day", 'day' => 1, 'month' => 1],
            ['holiday_name' => 'Chinese New Year', 'day' => 29, 'month' => 1],
            ['holiday_name' => 'EDSA People Power Revolution Anniversary', 'day' => 25, 'month' => 2],
            ['holiday_name' => 'Araw ng Kagitingan', 'day' => 9, 'month' => 4],
            ['holiday_name' => 'Labor Day', 'day' => 1, 'month' => 5],
            ['holiday_name' => 'Independence Day', 'day' => 12, 'month' => 6],
            ['holiday_name' => 'Ninoy Aquino Day', 'day' => 21, 'month' => 8],
            ['holiday_name' => 'National Heroes Day', 'day' => 31, 'month' => 8],
            ['holiday_name' => "All Saints' Day", 'day' => 1, 'month' => 11],
            ['holiday_name' => "All Souls' Day", 'day' => 2, 'month' => 11],
            ['holiday_name' => 'Bonifacio Day', 'day' => 30, 'month' => 11],
            ['holiday_name' => 'Feast of the Immaculate Conception', 'day' => 8, 'month' => 12],
            ['holiday_name' => 'Christmas Eve', 'day' => 24, 'month' => 12],
            ['holiday_name' => 'Christmas Day', 'day' => 25, 'month' => 12],
            ['holiday_name' => 'Rizal Day', 'day' => 30, 'month' => 12],
            ['holiday_name' => 'Last Day of the Year', 'day' => 31, 'month' => 12],
        ];
    }

    public function definition(): array
    {
        return [];
    }
}
