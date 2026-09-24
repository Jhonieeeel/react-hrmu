<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Database\Seeder;

class LeaveSeeder extends Seeder
{
    /**
     * Replays the exact leave transaction history captured in the debug dump
     * (user_id 2 and 3, Jan 2023 - Jan 2024) so ReplayBalanceAction can be
     * tested against known-good numbers.
     */
    public function run(): void
    {
        foreach ($this->rows() as $row) {
            $employee = Employee::query()
                ->where('user_id', $row['user_id'])
                ->firstOrFail();

            unset($row['user_id']);
            $row['employee_id'] = $employee->id;

            Leave::create($row);
        }
    }

    protected function rows(): array
    {
        return [

            // ===================== Jan 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 5.584, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 10.792, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'force leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 5.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'special privilege leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 3.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'wellness leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 3.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 1, 'remarks' => 'Jan filing completed'],

            // ===================== Jan 2023 — user 3 =====================
            ['user_id' => 3, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 6.188, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 3, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 11.583, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 3, 'leave_type' => 'force leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 5.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 3, 'leave_type' => 'special privilege leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 3.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 3, 'leave_type' => 'wellness leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 3.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 3, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-01-01 00:00:00', 'ends_at' => '2023-01-31 00:00:00', 'status' => 0, 'remarks' => null],

            // ===================== Feb 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-02-01 00:00:00', 'ends_at' => '2023-02-28 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-02-01 00:00:00', 'ends_at' => '2023-02-28 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-02-01 00:00:00', 'ends_at' => '2023-02-28 00:00:00', 'status' => 1, 'remarks' => 'Feb filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'tardiness', 'balance' => -0.056, 'starts_at' => '2023-02-03 08:00:00', 'ends_at' => '2023-02-03 08:27:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'tardiness', 'balance' => -0.054, 'starts_at' => '2023-02-08 08:00:00', 'ends_at' => '2023-02-08 08:26:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'tardiness', 'balance' => -0.023, 'starts_at' => '2023-02-28 08:00:00', 'ends_at' => '2023-02-28 08:11:00', 'status' => 0, 'remarks' => null],

            // ===================== Mar 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-03-01 00:00:00', 'ends_at' => '2023-03-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-03-01 00:00:00', 'ends_at' => '2023-03-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-03-01 00:00:00', 'ends_at' => '2023-03-31 00:00:00', 'status' => 1, 'remarks' => 'Mar filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.123, 'starts_at' => '2023-03-08 08:00:00', 'ends_at' => '2023-03-08 08:59:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.125, 'starts_at' => '2023-03-15 08:00:00', 'ends_at' => '2023-03-15 09:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.100, 'starts_at' => '2023-03-22 08:00:00', 'ends_at' => '2023-03-22 08:48:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.056, 'starts_at' => '2023-03-29 08:00:00', 'ends_at' => '2023-03-29 08:27:00', 'status' => 0, 'remarks' => null],

            // ===================== Apr 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-04-01 00:00:00', 'ends_at' => '2023-04-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-04-01 00:00:00', 'ends_at' => '2023-04-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-04-01 00:00:00', 'ends_at' => '2023-04-30 00:00:00', 'status' => 1, 'remarks' => 'Apr filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'tardiness', 'balance' => -0.050, 'starts_at' => '2023-04-03 08:00:00', 'ends_at' => '2023-04-03 08:24:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.052, 'starts_at' => '2023-04-11 08:00:00', 'ends_at' => '2023-04-11 08:25:00', 'status' => 0, 'remarks' => null],

            // ===================== May 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-05-01 00:00:00', 'ends_at' => '2023-05-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-05-01 00:00:00', 'ends_at' => '2023-05-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-05-01 00:00:00', 'ends_at' => '2023-05-31 00:00:00', 'status' => 1, 'remarks' => 'May filing completed'],

            // ===================== Jun 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-06-01 00:00:00', 'ends_at' => '2023-06-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-06-01 00:00:00', 'ends_at' => '2023-06-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-06-01 00:00:00', 'ends_at' => '2023-06-30 00:00:00', 'status' => 1, 'remarks' => 'Jun filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.027, 'starts_at' => '2023-06-07 08:00:00', 'ends_at' => '2023-06-07 08:13:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.037, 'starts_at' => '2023-06-13 08:00:00', 'ends_at' => '2023-06-13 08:18:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.017, 'starts_at' => '2023-06-19 08:00:00', 'ends_at' => '2023-06-19 08:08:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.002, 'starts_at' => '2023-06-21 08:00:00', 'ends_at' => '2023-06-21 08:01:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.019, 'starts_at' => '2023-06-26 08:00:00', 'ends_at' => '2023-06-26 08:09:00', 'status' => 0, 'remarks' => null],

            // ===================== Jul 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-07-01 00:00:00', 'ends_at' => '2023-07-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-07-01 00:00:00', 'ends_at' => '2023-07-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-07-01 00:00:00', 'ends_at' => '2023-07-31 00:00:00', 'status' => 1, 'remarks' => 'Jul filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.004, 'starts_at' => '2023-07-10 08:00:00', 'ends_at' => '2023-07-10 08:02:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.027, 'starts_at' => '2023-07-24 08:00:00', 'ends_at' => '2023-07-24 08:13:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.115, 'starts_at' => '2023-07-26 08:00:00', 'ends_at' => '2023-07-26 08:55:00', 'status' => 0, 'remarks' => null],

            // ===================== Aug 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-08-01 00:00:00', 'ends_at' => '2023-08-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-08-01 00:00:00', 'ends_at' => '2023-08-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-08-01 00:00:00', 'ends_at' => '2023-08-31 00:00:00', 'status' => 1, 'remarks' => 'Aug filing completed'],

            // ===================== Sep 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-09-01 00:00:00', 'ends_at' => '2023-09-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-09-01 00:00:00', 'ends_at' => '2023-09-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-09-01 00:00:00', 'ends_at' => '2023-09-30 00:00:00', 'status' => 1, 'remarks' => 'Sep filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'tardiness', 'balance' => -0.019, 'starts_at' => '2023-09-11 08:00:00', 'ends_at' => '2023-09-11 08:09:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'special privilege leave', 'event_type' => 'deduction', 'event_tag' => 'leave', 'balance' => -1.000, 'starts_at' => '2023-09-15 00:00:00', 'ends_at' => '2023-09-15 00:00:00', 'status' => 0, 'remarks' => null],

            // ===================== Oct 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-10-01 00:00:00', 'ends_at' => '2023-10-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-10-01 00:00:00', 'ends_at' => '2023-10-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-10-01 00:00:00', 'ends_at' => '2023-10-31 00:00:00', 'status' => 1, 'remarks' => 'Oct filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.050, 'starts_at' => '2023-10-05 08:00:00', 'ends_at' => '2023-10-05 08:24:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'force leave', 'event_type' => 'deduction', 'event_tag' => 'vacation leave', 'balance' => -1.000, 'starts_at' => '2023-10-25 00:00:00', 'ends_at' => '2023-10-25 00:00:00', 'status' => 0, 'remarks' => null],

            // ===================== Nov 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-11-01 00:00:00', 'ends_at' => '2023-11-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-11-01 00:00:00', 'ends_at' => '2023-11-30 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-11-01 00:00:00', 'ends_at' => '2023-11-30 00:00:00', 'status' => 1, 'remarks' => 'Nov filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.010, 'starts_at' => '2023-11-07 08:00:00', 'ends_at' => '2023-11-07 08:05:00', 'status' => 0, 'remarks' => null],

            // ===================== Dec 2023 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-12-01 00:00:00', 'ends_at' => '2023-12-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2023-12-01 00:00:00', 'ends_at' => '2023-12-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2023-12-01 00:00:00', 'ends_at' => '2023-12-31 00:00:00', 'status' => 1, 'remarks' => 'Dec filing completed'],
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'deduction', 'event_tag' => 'undertime', 'balance' => -0.025, 'starts_at' => '2023-12-27 08:00:00', 'ends_at' => '2023-12-27 08:12:00', 'status' => 0, 'remarks' => null],

            // ===================== Jan 2024 — user 2 =====================
            ['user_id' => 2, 'leave_type' => 'vacation leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2024-01-01 00:00:00', 'ends_at' => '2024-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'sick leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 1.250, 'starts_at' => '2024-01-01 00:00:00', 'ends_at' => '2024-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'monthly filing', 'event_type' => 'filing', 'event_tag' => 'filing', 'balance' => 0.000, 'starts_at' => '2024-01-01 00:00:00', 'ends_at' => '2024-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'force leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 5.000, 'starts_at' => '2024-01-01 00:00:00', 'ends_at' => '2024-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'wellness leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 3.000, 'starts_at' => '2024-01-01 00:00:00', 'ends_at' => '2024-01-31 00:00:00', 'status' => 0, 'remarks' => null],
            ['user_id' => 2, 'leave_type' => 'special privilege leave', 'event_type' => 'accrual', 'event_tag' => 'accrual', 'balance' => 3.000, 'starts_at' => '2024-01-01 00:00:00', 'ends_at' => '2024-01-31 00:00:00', 'status' => 0, 'remarks' => null],
        ];
    }
}
