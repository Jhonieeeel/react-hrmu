<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Holiday;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class CheckDateRangeAction
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

    protected $calendarDaysLeave = [
        'maternity leave',
        'study leave',
        'rehabilitation leave',
        'adoption leave'
    ];
    public function checkDateRange(LeaveDTO $leaveData): array
    {
        if (in_array($leaveData->leave_type, $this->workingDaysLeave)) {

            $period = CarbonPeriod::create(
                $leaveData->starts_at,
                $leaveData->ends_at
            )->filter(fn(Carbon $date) => $date->isWeekday());

            $holidayKeys = Holiday::query()
                ->get()
                ->mapWithKeys(fn($holiday) => [
                    "{$holiday->month}-{$holiday->day}" => true,
                ]);

            $validatedDays = [];

            foreach ($period as $date) {
                $key = "{$date->month}-{$date->day}";

                if (!isset($holidayKeys[$key])) {
                    $validatedDays[] = $date->toDateString();
                }
            }

            return $this->splitIntoRanges($validatedDays);
        }

        return [
            [
                'starts_at' => Carbon::parse($leaveData->starts_at)->toDateString(),
                'ends_at' => Carbon::parse($leaveData->ends_at)->toDateString(),
            ]
        ];
    }


    protected function splitIntoRanges(array $dates): array
    {
        if (empty($dates)) {
            return [];
        }

        sort($dates);

        $ranges = [];

        $start = Carbon::parse($dates[0]);
        $end = Carbon::parse($dates[0]);

        foreach (array_slice($dates, 1) as $date) {

            $current = Carbon::parse($date);

            if ($current->isSameDay($end->copy()->addDay())) {
                $end = $current;
                continue;
            }

            $ranges[] = [
                'starts_at' => $start->toDateString(),
                'ends_at' => $end->toDateString(),
            ];

            $start = $current;
            $end = $current;
        }

        $ranges[] = [
            'starts_at' => $start->toDateString(),
            'ends_at' => $end->toDateString(),
        ];

        return $ranges;
    }
}
