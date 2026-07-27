<?php

namespace App\Actions\Calendar;

use App\Models\Holiday;
use App\Models\Leave;
use Carbon\Carbon;

class CalendarTransactionsAction
{
    public function __invoke()
    {
        $year = now()->year;

        $holidays = Holiday::all()->map(function ($holiday) use ($year) {
            $date = Carbon::create($year, $holiday->month, $holiday->day)->format('Y-m-d');

            return [
                'id'            => "holiday-{$holiday->id}",
                'title'         => $holiday->holiday_name,
                'start'         => $date,
                'end'           => $date,
                'calendarTitle' => 'Holiday',
                'calendarId'    => 'holiday',
            ];
        });

        $leaves = Leave::query()
            ->with('user:id,name')
            ->where('event_type', 'deduction')
            ->whereIn('event_tag', ['leave', 'vacation leave', 'cto', 'offset'])
            ->select([
                'id',
                'user_id',
                'leave_type',
                'starts_at',
                'ends_at',
            ])
            ->get()
            ->map(function ($leave) {
                return [
                    'id'            => (string) $leave->id,
                    'user_id'       => $leave->user_id,
                    'title'         => $leave->user->name,
                    'start'         => Carbon::parse($leave->starts_at)->format('Y-m-d'),
                    'end'           => Carbon::parse($leave->ends_at)->format('Y-m-d'),
                    'user'          => $leave->user,
                    'calendarTitle' => $leave->leave_type,
                    'calendarId'    => $leave->leave_type,
                ];
            });

        return $leaves->concat($holidays)->values();
    }
}
