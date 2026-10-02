<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\Section;
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
        // Roles and permissions must exist before any user is assigned one.
        $this->call([
            RolePermissionSeeder::class,
            SuperAdminSeeder::class,
        ]);

        $this->call(SectionSeeder::class);

        $assignments = [
            'rayfrancis@ocd.com' => ['section' => 'AFMS', 'unit' => 'GASU'],
            'jenneric@ocd.com' => ['section' => 'AFMS', 'unit' => 'PMU'],
            'ronaldanthony@ocd.com' => ['section' => 'CBTS', 'unit' => null],
            'marcgil@ocd.com' => ['section' => 'CBTS', 'unit' => null],
            'rosalie@ocd.com' => ['section' => 'AFMS', 'unit' => 'FMU'],
            'lorene@ocd.com' => ['section' => 'AFMS', 'unit' => 'RMU'],
            'carlitojr@ocd.com' => ['section' => 'AFMS', 'unit' => 'RMU'],
            'kim@ocd.com' => ['section' => 'RRMS', 'unit' => null],
            'jayvee@ocd.com' => ['section' => null, 'unit' => null],
            'aizylyn@ocd.com' => ['section' => 'AFMS', 'unit' => 'PMU'],
            'ryan@ocd.com' => ['section' => 'AFMS', 'unit' => 'PMU'],
            'diana@ocd.com' => ['section' => 'OS', 'unit' => null],
            'dave@ocd.com' => ['section' => 'AFMS', 'unit' => 'GASU'],
            'georissmae@ocd.com' => ['section' => 'RRMS', 'unit' => null],
            'amado@ocd.com' => ['section' => 'AFMS', 'unit' => null],
            'aprilroseanne@ocd.com' => ['section' => 'PDPS', 'unit' => null],
            'marielynn@ocd.com' => ['section' => 'AFMS', 'unit' => 'GASU'],
            'johnlenn@ocd.com' => ['section' => 'OS', 'unit' => null],
            'grace@ocd.com' => ['section' => 'AFMS', 'unit' => 'FMU'],
            'angelicmae@ocd.com' => ['section' => 'AFMS', 'unit' => 'RMU'],
        ];

        // Left with no role on purpose: this is the plain-employee baseline that
        // the Gate::before hook in AppServiceProvider grants self-service to.
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        foreach (UserFactory::ocdEmployees() as $index => $employeeData) {
            $user = User::factory()->create($employeeData);

            $assignment = $assignments[$employeeData['email']] ?? [
                'section' => null,
                'unit' => null,
            ];

            $section = $assignment['section']
                ? Section::query()->where('section_code', $assignment['section'])->first()
                : null;
            $unit = $section && $assignment['unit']
                ? $section->units()->where('unit_code', $assignment['unit'])->first()
                : null;

            $employee = Employee::create([
                'user_id' => $user->id,
                'position' => 'Employee',
                'division_id' => $section?->division_id,
                'section_id' => $section?->id,
                'unit_id' => $unit?->id,
            ]);

            $balances = LeaveFactory::balances()[$index % count(LeaveFactory::balances())];

            foreach ($balances as $leaveType => $balance) {
                Leave::factory()
                    ->for($employee, 'employee')
                    ->accrual($leaveType, $balance)
                    ->create();
            }

            Leave::factory()
                ->for($employee, 'employee')
                ->monthlyFilingSeeder()
                ->create();
        }

        foreach (HolidayFactory::holidays() as $holidayData) {
            Holiday::factory()->create($holidayData);
        }
    }
}
