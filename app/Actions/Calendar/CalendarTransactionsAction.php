<?php

namespace App\Actions\Calendar;

use App\Models\Holiday;
use App\Models\Leave;
use Carbon\Carbon;

class CalendarTransactionsAction
{
    public function upcomingLeaves()
    {
        return Leave::query()
            ->with('employee.user:id,name')
            ->where('event_type', 'deduction')
            ->whereIn('event_tag', ['leave', 'vacation leave', 'cto', 'offset'])
            ->whereDate('starts_at', '>=', now()->toDateString())
            ->orderBy('starts_at')
            ->limit(6)
            ->get(['id', 'employee_id', 'leave_type', 'starts_at', 'ends_at', 'status'])
            ->map(fn (Leave $leave) => [
                'id' => $leave->id,
                'employee_id' => $leave->employee_id,
                'employee_name' => $leave->employee?->user?->name ?? 'Unknown employee',
                'leave_type' => $leave->leave_type,
                'starts_at' => Carbon::parse($leave->starts_at)->toDateString(),
                'ends_at' => Carbon::parse($leave->ends_at)->toDateString(),
                'status' => $leave->status,
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

        $leaves = Leave::query()
            ->with('employee.user:id,name')
            ->where('event_type', 'deduction')
            ->whereIn('event_tag', ['leave', 'vacation leave', 'cto', 'offset'])
            ->select([
                'id',
                'employee_id',
                'leave_type',
                'starts_at',
                'ends_at',
            ])
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
                ];
            });

        return $leaves->concat($holidays)->values();
    }
}
