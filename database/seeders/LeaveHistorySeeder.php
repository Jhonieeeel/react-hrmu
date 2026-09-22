<?php

namespace Database\Seeders;

use App\Models\Leave;
use App\Models\User;

/**
 * Replays the rest of a full year's transaction history (Feb 2023 -> Jan
 * 2024) for the employee whose initial balances match
 * LeaveFactory::balances()[0] (5.584 VL / 10.792 SL / 5.000 FL / 3 SPL / 3 WL).
 *
 * Call this from DatabaseSeeder AFTER the Jan 2023 initial accrual and
 * monthly filing placeholder have already been created for $user, e.g.:
 *
 *     foreach (UserFactory::ocdEmployees() as $index => $employeeData) {
 *         $user = User::factory()->create($employeeData);
 *
 *         $balances = LeaveFactory::balances()[$index];
 *         foreach ($balances as $leaveType => $balance) {
 *             Leave::factory()->for($user)->accrual($leaveType, $balance)->create();
 *         }
 *
 *         Leave::factory()->for($user)->monthlyFilingPlaceholder()->create();
 *
 *         if ($index === 0) {
 *             LeaveHistorySeeder::replayEmployeeOne($user);
 *         }
 *     }
 */
class LeaveHistorySeeder
{
    public static function replayEmployeeOne(User $user): void
    {
        foreach (self::months() as $month) {

            foreach ($month['accruals'] as [$leaveType, $balance]) {
                Leave::factory()
                    ->for($user)
                    ->accrual($leaveType, $balance, $month['starts_at'], $month['ends_at'])
                    ->create();
            }

            Leave::factory()
                ->for($user)
                ->monthlyFiling($month['starts_at'], $month['ends_at'], $month['filing_remarks'], $month['filing_completed'])
                ->create();

            foreach ($month['deductions'] as [$leaveType, $eventTag, $balance, $startsAt, $endsAt]) {
                Leave::factory()
                    ->for($user)
                    ->deduction($leaveType, $eventTag, $balance, $startsAt, $endsAt)
                    ->create();
            }
        }
    }

    /**
     * @return array<int, array{
     *     starts_at: string,
     *     ends_at: string,
     *     accruals: array<int, array{0: string, 1: float}>,
     *     filing_remarks: ?string,
     *     filing_completed: bool,
     *     deductions: array<int, array{0: string, 1: string, 2: float, 3: string, 4: string}>
     * }>
     */
    protected static function months(): array
    {
        return [
            // ----- Feb 2023 -----
            [
                'starts_at' => '2023-02-01',
                'ends_at' => '2023-02-28',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Feb filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'tardiness', 0.056, '2023-02-03 08:00:00', '2023-02-03 08:27:00'],
                    ['vacation leave', 'tardiness', 0.054, '2023-02-08 08:00:00', '2023-02-08 08:26:00'],
                    ['vacation leave', 'tardiness', 0.023, '2023-02-28 08:00:00', '2023-02-28 08:11:00'],
                ],
            ],
            // ----- Mar 2023 -----
            [
                'starts_at' => '2023-03-01',
                'ends_at' => '2023-03-31',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Mar filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'undertime', 0.123, '2023-03-08 08:00:00', '2023-03-08 08:59:00'],
                    ['vacation leave', 'undertime', 0.125, '2023-03-15 08:00:00', '2023-03-15 09:00:00'],
                    ['vacation leave', 'undertime', 0.100, '2023-03-22 08:00:00', '2023-03-22 08:48:00'],
                    ['vacation leave', 'undertime', 0.056, '2023-03-29 08:00:00', '2023-03-29 08:27:00'],
                ],
            ],
            // ----- Apr 2023 -----
            [
                'starts_at' => '2023-04-01',
                'ends_at' => '2023-04-30',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Apr filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'tardiness', 0.050, '2023-04-03 08:00:00', '2023-04-03 08:24:00'],
                    ['vacation leave', 'undertime', 0.052, '2023-04-11 08:00:00', '2023-04-11 08:25:00'],
                ],
            ],
            // ----- May 2023 -----
            [
                'starts_at' => '2023-05-01',
                'ends_at' => '2023-05-31',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'May filing completed',
                'filing_completed' => true,
                'deductions' => [],
            ],
            // ----- Jun 2023 -----
            [
                'starts_at' => '2023-06-01',
                'ends_at' => '2023-06-30',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Jun filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'undertime', 0.027, '2023-06-07 08:00:00', '2023-06-07 08:13:00'],
                    ['vacation leave', 'undertime', 0.037, '2023-06-13 08:00:00', '2023-06-13 08:18:00'],
                    ['vacation leave', 'undertime', 0.017, '2023-06-19 08:00:00', '2023-06-19 08:08:00'],
                    ['vacation leave', 'undertime', 0.002, '2023-06-21 08:00:00', '2023-06-21 08:01:00'],
                    ['vacation leave', 'undertime', 0.019, '2023-06-26 08:00:00', '2023-06-26 08:09:00'],
                ],
            ],
            // ----- Jul 2023 -----
            [
                'starts_at' => '2023-07-01',
                'ends_at' => '2023-07-31',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Jul filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'undertime', 0.004, '2023-07-10 08:00:00', '2023-07-10 08:02:00'],
                    ['vacation leave', 'undertime', 0.027, '2023-07-24 08:00:00', '2023-07-24 08:13:00'],
                    ['vacation leave', 'undertime', 0.115, '2023-07-26 08:00:00', '2023-07-26 08:55:00'],
                ],
            ],
            // ----- Aug 2023 -----
            [
                'starts_at' => '2023-08-01',
                'ends_at' => '2023-08-31',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Aug filing completed',
                'filing_completed' => true,
                'deductions' => [],
            ],
            // ----- Sep 2023 -----
            [
                'starts_at' => '2023-09-01',
                'ends_at' => '2023-09-30',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Sep filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'tardiness', 0.019, '2023-09-11 08:00:00', '2023-09-11 08:09:00'],
                    ['special privilege leave', 'leave', 1.000, '2023-09-15 00:00:00', '2023-09-15 00:00:00'],
                ],
            ],
            // ----- Oct 2023 -----
            [
                'starts_at' => '2023-10-01',
                'ends_at' => '2023-10-31',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Oct filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'undertime', 0.050, '2023-10-05 08:00:00', '2023-10-05 08:24:00'],
                    // force leave -> vacation leave conversion
                    ['force leave', 'vacation leave', 1.000, '2023-10-25 00:00:00', '2023-10-25 00:00:00'],
                ],
            ],
            // ----- Nov 2023 -----
            [
                'starts_at' => '2023-11-01',
                'ends_at' => '2023-11-30',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Nov filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'undertime', 0.010, '2023-11-07 08:00:00', '2023-11-07 08:05:00'],
                ],
            ],
            // ----- Dec 2023 -----
            [
                'starts_at' => '2023-12-01',
                'ends_at' => '2023-12-31',
                'accruals' => [['vacation leave', 1.250], ['sick leave', 1.250]],
                'filing_remarks' => 'Dec filing completed',
                'filing_completed' => true,
                'deductions' => [
                    ['vacation leave', 'undertime', 0.025, '2023-12-27 08:00:00', '2023-12-27 08:12:00'],
                ],
            ],
            // ----- Jan 2024 (year-start accrual: force/wellness/special reset) -----
            [
                'starts_at' => '2024-01-01',
                'ends_at' => '2024-01-31',
                'accruals' => [
                    ['vacation leave', 1.250],
                    ['sick leave', 1.250],
                    ['force leave', 5.000],
                    ['wellness leave', 3.000],
                    ['special privilege leave', 3.000],
                ],
                'filing_remarks' => null,
                'filing_completed' => false,
                'deductions' => [],
            ],
        ];
    }
}
