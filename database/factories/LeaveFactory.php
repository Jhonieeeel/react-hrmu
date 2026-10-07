<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Leave>
 */
class LeaveFactory extends Factory
{
    public static function balances(): array
    {
        return [
            ['vacation leave' => 5.584, 'sick leave' => 10.792, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 6.188, 'sick leave' => 11.583, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 14.313, 'sick leave' => 22.833, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 61.890, 'sick leave' => 154.583, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 6.368, 'sick leave' => 11.583, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 19.875, 'sick leave' => 308.250, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 6.530, 'sick leave' => 11.708, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 85.496, 'sick leave' => 126.500, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 58.895, 'sick leave' => 70.833, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 95.102, 'sick leave' => 114.167, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 76.800, 'sick leave' => 112.750, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 55.575, 'sick leave' => 69.462, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 79.479, 'sick leave' => 100.000, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 41.644, 'sick leave' => 53.667, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 139.122, 'sick leave' => 270.292, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 81.921, 'sick leave' => 122.500, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 132.852, 'sick leave' => 259.000, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 72.169, 'sick leave' => 127.500, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 65.113, 'sick leave' => 127.500, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
            ['vacation leave' => 6.516, 'sick leave' => 11.583, 'force leave' => 5.000, 'special privilege leave' => 3, 'wellness leave' => 3],
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
            'employee_id' => Employee::factory(),
            'leave_type' => 'vacation leave',
            'event_type' => 'accrual',
            'event_tag' => 'accrual',
            'balance' => 0,
            'starts_at' => '2023-01-01',
            'ends_at' => '2023-01-31',
        ];
    }

    /**
     * An accrual entry for a specific leave type and balance.
     * Pass $startsAt/$endsAt to accrue a later month; defaults to Jan 2023
     * (the initial balance seeded per employee).
     */
    public function accrual(string $leaveType, float $balance, ?string $startsAt = null, ?string $endsAt = null): static
    {
        return $this->state(fn () => [
            'leave_type' => $leaveType,
            'event_type' => 'accrual',
            'event_tag' => 'accrual',
            'balance' => $balance,
            'starts_at' => $startsAt ?? '2023-01-01',
            'ends_at' => $endsAt ?? '2023-01-31',
        ]);
    }

    /**
     * A deduction entry — tardiness, undertime, filed leave usage, or a
     * force-leave-to-vacation-leave conversion (leave_type: 'force leave',
     * event_tag: 'vacation leave'). $balance is given positive; it is
     * stored negative to match how ReplayBalanceAction expects it.
     */
    public function deduction(string $leaveType, string $eventTag, float $balance, string $startsAt, ?string $endsAt = null): static
    {
        return $this->state(fn () => [
            'leave_type' => $leaveType,
            'event_type' => 'deduction',
            'event_tag' => $eventTag,
            'balance' => -abs($balance),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt ?? $startsAt,
            // Seeded history predates the approval workflow, so deductions
            // recorded by HR are treated as already approved. See also the
            // migration that backfills pre-existing rows.
            'status' => true,
        ]);
    }

    /**
     * A leave request submitted by an employee and awaiting a decision.
     *
     * $days is stored as a negative balance, matching CreateLeaveAction.
     */
    public function filed(string $leaveType, float $days, string $startsAt, ?string $endsAt = null, ?string $groupId = null): static
    {
        return $this->state(fn () => [
            'leave_type' => $leaveType,
            'event_type' => 'deduction',
            'event_tag' => 'leave',
            'filing_group_id' => $groupId ?? (string) Str::uuid(),
            'balance' => -abs($days),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt ?? $startsAt,
            'status' => false,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
    }

    /**
     * Mark a filed request as approved by the given reviewer.
     */
    public function approved(?int $reviewerId = null, ?string $remarks = null): static
    {
        return $this->state(fn () => [
            'status' => true,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_remarks' => $remarks,
        ]);
    }

    /**
     * Mark a filed request as rejected.
     */
    public function rejected(?int $reviewerId = null, ?string $remarks = null): static
    {
        return $this->state(fn () => [
            'status' => false,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_remarks' => $remarks,
        ]);
    }

    /**
     * The current month's monthly filing placeholder.
     */
    public function monthlyFilingPlaceholder(?string $startsAt = null, ?string $endsAt = null): static
    {
        return $this->state(fn () => [
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'balance' => 0,
            'starts_at' => $startsAt ?? now()->startOfMonth(),
            'ends_at' => $endsAt ?? now()->endOfMonth(),
            'status' => false,
        ]);
    }

    public function monthlyFilingSeeder(): static
    {
        return $this->state(fn () => [
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'balance' => 0,
            'starts_at' => '2023-01-01',
            'ends_at' => '2023-01-31',
            'status' => false,
        ]);
    }

    /**
     * A dated monthly filing entry, optionally marked completed with remarks.
     */
    public function monthlyFiling(string $startsAt, string $endsAt, ?string $remarks = null, bool $completed = true): static
    {
        return $this->state(fn () => [
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'balance' => 0,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => $completed,
            'remarks' => $remarks,
        ]);
    }
}
