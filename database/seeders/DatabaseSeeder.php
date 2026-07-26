<?php

namespace Database\Seeders;

use App\Models\Holiday;
use App\Models\Leave;
use App\Models\User;
use Database\Factories\LeaveFactory;
use Database\Factories\UserFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        foreach (UserFactory::ocdEmployees() as $index => $employee) {

            $user = User::factory()->create($employee);

            $balances = LeaveFactory::balances()[$index];

            foreach ($balances as $leaveType => $balance) {
                Leave::create([
                    'user_id' => $user->id,
                    'leave_type' => $leaveType,
                    'event_type' => 'accrual',
                    'event_tag' => 'accrual',
                    'balance' => $balance,
                    'starts_at' => '2023-01-01',
                    'ends_at' => '2023-01-31',
                ]);
            }

            Leave::create([
                'user_id' => $user->id,
                'leave_type' => 'monthly filing',
                'event_type' => 'filing',
                'event_tag' => 'filing',
                'balance' => 0,
                'status' => false,
                'starts_at' => '2023-01-01',
                'ends_at' => '2023-01-31'
            ]);
        }

        // Holiday::insert([
        //     [
        //         'holiday_name' => 'New Year\'s Day',
        //         'day' => 1,
        //         'month' => 1,
        //     ],
        //     [
        //         'holiday_name' => 'Chinese New Year',
        //         'day' => 29,
        //         'month' => 1,
        //     ],
        //     [
        //         'holiday_name' => 'EDSA People Power Revolution Anniversary',
        //         'day' => 25,
        //         'month' => 2,
        //     ],
        //     [
        //         'holiday_name' => 'Araw ng Kagitingan',
        //         'day' => 9,
        //         'month' => 4,
        //     ],
        //     [
        //         'holiday_name' => 'Labor Day',
        //         'day' => 1,
        //         'month' => 5,
        //     ],
        //     [
        //         'holiday_name' => 'Independence Day',
        //         'day' => 12,
        //         'month' => 6,
        //     ],
        //     [
        //         'holiday_name' => 'Ninoy Aquino Day',
        //         'day' => 21,
        //         'month' => 8,
        //     ],
        //     [
        //         'holiday_name' => 'National Heroes Day',
        //         'day' => 31,
        //         'month' => 8, // Placeholder – this holiday is actually the last Monday of August.
        //     ],
        //     [
        //         'holiday_name' => 'All Saints\' Day',
        //         'day' => 1,
        //         'month' => 11,
        //     ],
        //     [
        //         'holiday_name' => 'All Souls\' Day',
        //         'day' => 2,
        //         'month' => 11,
        //     ],
        //     [
        //         'holiday_name' => 'Bonifacio Day',
        //         'day' => 30,
        //         'month' => 11,
        //     ],
        //     [
        //         'holiday_name' => 'Feast of the Immaculate Conception',
        //         'day' => 8,
        //         'month' => 12,
        //     ],
        //     [
        //         'holiday_name' => 'Christmas Eve',
        //         'day' => 24,
        //         'month' => 12,
        //     ],
        //     [
        //         'holiday_name' => 'Christmas Day',
        //         'day' => 25,
        //         'month' => 12,
        //     ],
        //     [
        //         'holiday_name' => 'Rizal Day',
        //         'day' => 30,
        //         'month' => 12,
        //     ],
        //     [
        //         'holiday_name' => 'Last Day of the Year',
        //         'day' => 31,
        //         'month' => 12,
        //     ],
        // ]);
    }
}
