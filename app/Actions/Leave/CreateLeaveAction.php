<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\LaravelData\Data;

class CreateLeaveAction extends Data
{

    protected $workingDaysLeave = [
        'vacation leave',
        'force leave',
        'sick leave',
        'paternity leave',
        'special privilege leave',
        'solo parent leave',
        '10-day vawc leave',
        'special emergency (calamity) leave',
        'wellness leave'
    ];

    /**
     * Persist a filed leave request.
     *
     * Each contiguous range becomes its own ledger row, so every row from one
     * submission shares a `filing_group_id`. That is what lets HR approve or
     * reject the submission as a single unit later.
     *
     * $requiresApproval is false for rows HR records directly (calendar entries,
     * back-dated absences); those are approved from birth. An employee filing
     * starts pending and is excluded from the balance until approved.
     */
    public function createLeaves(array $ranges, LeaveDTO $data, bool $requiresApproval = true): void
    {
        if ($ranges === []) {
            return;
        }

        $filingGroupId = (string) Str::uuid();

        DB::transaction(function () use ($ranges, $data, $requiresApproval, $filingGroupId) {

            foreach ($ranges as $range) {

                $balance = Carbon::parse($range['starts_at'])
                    ->diffInDays(Carbon::parse($range['ends_at'])) + 1;

                Leave::create([
                    'employee_id' => $data->employee_id,
                    'leave_type' => $data->leave_type,
                    'event_type' => $data->event_type,
                    'event_tag' => $data->event_tag,
                    'filing_group_id' => $filingGroupId,
                    'balance' => -$balance,
                    'starts_at' => $range['starts_at'],
                    'ends_at' => $range['ends_at'],
                    // A pending filing is held out of the balance, so the
                    // employee cannot spend the same days twice while awaiting
                    // a decision.
                    'status' => ! $requiresApproval,
                ]);
            }
        });
    }

    /**
     * The group id assigned to the most recent filing for an employee. Useful
     * for redirecting straight to the request that was just submitted.
     */
    public function latestGroupIdFor(int $employeeId): ?string
    {
        return Leave::query()
            ->where('employee_id', $employeeId)
            ->whereNotNull('filing_group_id')
            ->latest('id')
            ->value('filing_group_id');
    }
}
