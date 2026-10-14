<?php

namespace App\Actions\Calendar;

use App\Models\Holiday;
use App\Models\Leave;
use Carbon\Carbon;

class CalendarTransactionsAction
{
    /**
     * The columns a calendar row is built from.
     *
     * `event_type` and `event_tag` look redundant beside the where clauses that
     * already constrain them, but they are not: Leave::approvalState() reads them
     * to decide whether a row is a filing at all, and a partial select leaves
     * them null — which would report every event as approved.
     *
     * @return list<string>
     */
    protected function eventColumns(): array
    {
        return [
            'id',
            'employee_id',
            'leave_type',
            'starts_at',
            'ends_at',
            'event_type',
            'event_tag',
            // reviewed_at is what tells a rejected filing apart from one that
            // simply has no decision yet.
            'status',
            'reviewed_at',
            'filing_group_id',
        ];
    }

    public function upcomingLeaves()
    {
        return Leave::query()
            ->with('employee.user:id,name')
            ->where('event_type', 'deduction')
            ->whereIn('event_tag', Leave::FILED_LEAVE_TAGS)
            ->whereDate('starts_at', '>=', now()->toDateString())
            ->orderBy('starts_at')
            ->limit(6)
            ->get($this->eventColumns())
            ->map(fn (Leave $leave) => [
                'id' => $leave->id,
                'employee_id' => $leave->employee_id,
                'employee_name' => $leave->employee?->user?->name ?? 'Unknown employee',
                'leave_type' => $leave->leave_type,
                'starts_at' => Carbon::parse($leave->starts_at)->toDateString(),
                'ends_at' => Carbon::parse($leave->ends_at)->toDateString(),
                // The derived state, not the raw boolean: a rejected filing and a
                // not-yet-decided one both store `false`, and the list needs to
                // tell them apart to label the row.
                'approval_state' => $leave->approvalState(),
                'filing_group_id' => $leave->filing_group_id,
            ])
            ->values();
    }

    public function __invoke()
    {
        $year = now()->year;

        $holidays = Holiday::all()->map(function ($holiday) use ($year) {
            $date = Carbon::create($year, $holiday->month, $holiday->day)->format('Y-m-d');

            return [
                'id' => "holiday-{$holiday->id}",
                'title' => $holiday->holiday_name,
                'start' => $date,
                'end' => $date,
                'calendarTitle' => 'Holiday',
                'calendarId' => 'holiday',
            ];
        });

        // Deliberately not filtered by decision: the calendar is a schedule, and
        // a filing nobody has answered yet is still time somebody is asking for.
        // Each event carries its own approval state instead, so the month view
        // can tell the two apart.
        $leaves = Leave::query()
            ->with('employee.user:id,name')
            ->where('event_type', 'deduction')
            ->whereIn('event_tag', Leave::FILED_LEAVE_TAGS)
            ->select($this->eventColumns())
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => (string) $leave->id,
                    'employee_id' => $leave->employee_id,
                    'title' => $leave->employee?->user?->name ?? 'Unknown employee',
                    'start' => Carbon::parse($leave->starts_at)->format('Y-m-d'),
                    'end' => Carbon::parse($leave->ends_at)->format('Y-m-d'),
                    'user' => $leave->employee?->user,
                    'calendarTitle' => $leave->leave_type,
                    'calendarId' => $leave->leave_type,
                    'approval_state' => $leave->approvalState(),
                    // Decisions act on the whole filing, so the dialog needs the
                    // group rather than this row's own id.
                    'filing_group_id' => $leave->filing_group_id,
                ];
            });

        return $leaves->concat($holidays)->values();
    }
}
