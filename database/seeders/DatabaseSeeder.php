<?php

namespace Database\Seeders;

use App\Models\Holiday;
use App\Models\Leave;
use App\Models\User;
use Database\Factories\HolidayFactory;
use Database\Factories\LeaveFactory;
use Database\Factories\UserFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(SectionSeeder::class);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        foreach (UserFactory::ocdEmployees() as $index => $employeeData) {
            $user = User::factory()->create($employeeData); // users

            $balances = LeaveFactory::balances()[$index]; // leaves balances

            foreach ($balances as $leaveType => $balance) {
                Leave::factory()
                    ->for($user)
                    ->accrual($leaveType, $balance)
                    ->create();
            }

            Leave::factory()
                ->for($user)
                ->monthlyFilingPlaceholder() // monthly filing
                ->create();
        }

        foreach (HolidayFactory::holidays() as $holidayData) {
            Holiday::factory()->create($holidayData); // holidays
        }
    }
}
