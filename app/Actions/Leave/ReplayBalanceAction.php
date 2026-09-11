<?php

namespace App\Actions\Leave;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ReplayBalanceAction
{
    protected $leaveTypes = ['vacation leave', 'sick leave', 'force leave'];

    protected static array $minutesConversion = [
        0 => 0.000, 1 => 0.002, 2 => 0.004, 3 => 0.006, 4 => 0.008, 5 => 0.010,
        6 => 0.012, 7 => 0.015, 8 => 0.017, 9 => 0.019, 10 => 0.021,
        11 => 0.023, 12 => 0.025, 13 => 0.027, 14 => 0.029, 15 => 0.031,
        16 => 0.033, 17 => 0.035, 18 => 0.037, 19 => 0.040, 20 => 0.042,
        21 => 0.044, 22 => 0.046, 23 => 0.048, 24 => 0.050, 25 => 0.052,
        26 => 0.054, 27 => 0.056, 28 => 0.058, 29 => 0.060, 30 => 0.063,
        31 => 0.065, 32 => 0.067, 33 => 0.069, 34 => 0.071, 35 => 0.073,
        36 => 0.075, 37 => 0.077, 38 => 0.079, 39 => 0.081, 40 => 0.083,
        41 => 0.085, 42 => 0.087, 43 => 0.090, 44 => 0.092, 45 => 0.094,
        46 => 0.096, 47 => 0.098, 48 => 0.100, 49 => 0.102, 50 => 0.104,
        51 => 0.106, 52 => 0.108, 53 => 0.110, 54 => 0.112, 55 => 0.115,
        56 => 0.117, 57 => 0.119, 58 => 0.121, 59 => 0.123,
    ];

    protected static array $hoursConversion = [
        0 => 0.000,
        1 => 0.125,
        2 => 0.250,
        3 => 0.375,
        4 => 0.500,
        5 => 0.625,
        6 => 0.750,
        7 => 0.875,
        8 => 1.000,
    ];

    public static function UserBalance(Request $request, User $user): array
    {
        $date = $request->filled('month') && $request->filled('year')
            ? Carbon::create($request->year, $request->month, 1)
            : Carbon::create(now()->year, now()->month, 1);

        $start = Carbon::create(2023, 1, 1); // jan 1 2023

        $current = Leave::query()
            ->where('user_id', $user->id)
            ->whereBetween('starts_at', [
                $start,
                $date->copy()->endOfMonth(),
            ])
            ->get(); // query all transactions

        $previous = Leave::query()
            ->where('user_id', $user->id)
            ->whereDate('starts_at', '<', $date->copy()->startOfMonth())
            ->get(); // query all prev transactions

        $balances = self::replayBalances($current, $previous, $date);

        return self::calculateBalances($balances, $current, $date)
            ->values()
            ->toArray();
    }

    public static function UsersBalances(Carbon $date, Collection $users): array
    {
        $userIds = $users->pluck('id');
        $start = Carbon::create(2023, 1, 1);

        $allCurrent = Leave::query()
            ->whereIn('user_id', $userIds)
            ->whereBetween('starts_at', [
                $start,
                $date->copy()->endOfMonth(),
            ])
            ->get()
            ->groupBy('user_id');

        $currentEvents = Leave::query()
            ->whereIn('user_id', $userIds)
            ->whereBetween('starts_at', [
                $date->copy()->startOfMonth(),
                $date->copy()->endOfMonth(),
            ])
            ->get()
            ->groupBy('user_id');


        $allPrevious = Leave::query()
            ->whereIn('user_id', $userIds)
            ->whereDate('starts_at', '<', $date->copy()->startOfMonth())
            ->get()
            ->groupBy('user_id');

        return $users->mapWithKeys(function (User $user) use ($allCurrent, $allPrevious, $date, $currentEvents) {

            $userCurrent = $allCurrent->get($user->id, collect());
            $previous = $allPrevious->get($user->id, collect());

            $userCurrentEvents = $currentEvents->get($user->id, collect());

            info($userCurrentEvents);

            $balances = self::replayBalances($userCurrent, $previous, $date);

            $newBalances = self::calculateBalances($balances, $userCurrent, $date)
                ->values()
                ->toArray();

            $currentUndertime = $userCurrentEvents
                ->whereIn('event_tag', ['tardiness', 'undertime']);

            $currentFiledLeaves = $userCurrentEvents
                ->whereIn('event_tag', ['leave', 'cto']);

            $filing = $userCurrentEvents->where('leave_type', 'monthly filing')->first();

            $deductionData = self::deductionEvents($currentUndertime);
            $leavesCollection = self::filedLeaves($currentFiledLeaves);

            return [
                $user->id => [
                    'name' => $user->name,
                    'balances' => $newBalances,
                    'events' => $deductionData['events'],
                    'undertimeCount' => $deductionData['undertimeCount'],
                    'tardinessCount' => $deductionData['tardinessCount'],
                    'leaves' => $leavesCollection,
                    'filing' => $filing->remarks ?? '',
                    'date' => $date,
                ]
            ];
        })->toArray();
    }

    protected static function filedLeaves(Collection $leavesCollection): array
    {
        return $leavesCollection->map(function ($leave) {

            $startsAt = Carbon::parse($leave->starts_at);

            $abbreviation = self::abbreviateLeaveType($leave->leave_type);

            return [
                'label' => $startsAt->format('M j') . ' - ' . $abbreviation,
                'leave_type' => $leave->leave_type,
                'starts_at' => $startsAt->toDateString(),
            ];
        })->values()->toArray();
    }

    protected static function abbreviateLeaveType(string $leaveType): string
    {
        if (Str::upper($leaveType) === 'CTO') {
            return 'CTO';
        }

        return collect(explode(' ', $leaveType))
            ->map(fn($word) => Str::upper(Str::substr($word, 0, 1)))
            ->implode('');
    }

    protected static function deductionEvents(Collection $currentUndertime): array
{
    $undertimeCount = $currentUndertime->where('event_tag', 'undertime')->count();
    $tardinessCount = $currentUndertime->where('event_tag', 'tardiness')->count();

    $events = $currentUndertime->map(function ($event) {

        $startsAt = Carbon::parse($event->starts_at);
        $endsAt = Carbon::parse($event->ends_at);

        $diffMinutes = $startsAt->diffInMinutes($endsAt);

        $hours = intdiv($diffMinutes, 60);
        $minutes = $diffMinutes % 60;

        $durationParts = [];
        if ($hours > 0) {
            $durationParts[] = $hours . ' ' . ($hours === 1 ? 'hr' : 'hrs');
        }
        if ($minutes > 0 || $hours === 0) {
            $durationParts[] = $minutes . ' ' . ($minutes === 1 ? 'min' : 'mins');
        }
        $durationText = implode(' ', $durationParts);

        $tag = Str::upper(Str::substr($event->event_tag, 0, 1));

        return [
            'label' => $startsAt->format('M j') . ', ' . $durationText . ' ' . $tag,
            'minutes' => $minutes,
            'hours' => $hours,
            'day' => $startsAt->day,
            'month_key' => $startsAt->format('Y-m'), // <-- needed to separate pay periods correctly
            'deductionAmount' => $event->balance,
        ];
    })->values()->toArray();

    return [
        'events' => $events,
        'undertimeCount' => $undertimeCount,
        'tardinessCount' => $tardinessCount,
    ];
}


    protected static function minutesToDayEquivalent(int $totalMinutes): float
    {
        if ($totalMinutes <= 0) {
            return 0.0;
        }

        $hours = intdiv($totalMinutes, 60);
        $remainderMinutes = $totalMinutes % 60;

        $hoursValue = self::$hoursConversion[$hours]
            ?? round($hours * 0.125, 3);

        $minutesValue = self::$minutesConversion[$remainderMinutes] ?? 0.0;

        return -round($hoursValue + $minutesValue, 3);
    }

    protected static function totalUndertime(Collection $current): float
{
    $currentEvents = self::deductionEvents(
        $current->whereIn('event_tag', ['tardiness', 'undertime'])
    );

    $periodBuckets = [];

    foreach ($currentEvents['events'] as $event) {
        $totalEventMinutes = ($event['hours'] * 60) + $event['minutes'];
        $period = $event['day'] <= 15 ? 1 : 2;
        $bucketKey = $event['month_key'] . '-' . $period;

        $periodBuckets[$bucketKey] = ($periodBuckets[$bucketKey] ?? 0) + $totalEventMinutes;
    }

    $total = 0.0;
    foreach ($periodBuckets as $minutes) {
        $total += self::minutesToDayEquivalent($minutes);
    }

    return $total;
}

    protected static function replayBalances(
        Collection $current,
        Collection $previous,
        Carbon $date
    ): Collection {


        $leaveTypes = [
            'vacation leave',
            'sick leave',
            'force leave',
        ];

        $currentYear = $current->filter(
            fn($item) => Carbon::parse($item->starts_at)->year === $date->year
        );

        return collect($leaveTypes)
            ->map(function ($type) use ($current, $previous, $currentYear) {

                $flAsVacationLeave = 0;
                $undertimeAsVacationLeave = 0;

                if ($type === 'vacation leave') {
                    $flAsVacationLeave = $current->where('leave_type', 'force leave')->where('event_tag', $type)->sum('balance');

                    $undertimeAsVacationLeave = self::totalUndertime($current);
                }

                return [
                    'leave_type' => $type,

                    'previous' => $previous
                        ->where('leave_type', $type)
                        ->sum('balance'), // sum all balances

                    'current' => $current
                        ->where('leave_type', $type)
                        ->where('event_type', 'accrual')
                        ->sum('balance') + $flAsVacationLeave + $undertimeAsVacationLeave,

                    'used' => abs(
                        $currentYear
                            ->where('leave_type', $type)
                            ->where('event_type', 'deduction')
                            ->whereIn('event_tag', ['leave', 'vacation leave'])
                            ->sum('balance')
                    ),
                ];
            })
            ->values();
    }

    protected static function calculateBalances(
        Collection $balances,
        Collection $current,
        Carbon $date
    ): Collection {

        $totalForceLeaveDeduction = 0;

        $current_balance = $current->where('leave_type', 'force leave')
                                        ->where('event_type' , 'accrual')
                                        ->where('event_tag', 'accrual')
                                        ->sum('balance');


        for ($year = 2023; $year < $date->year; $year++) {

            $used = abs(
                $current
                    ->filter(fn($item) => Carbon::parse($item->starts_at)->year === $year)
                    ->where('leave_type', 'force leave')
                    ->where('event_type', 'deduction')
                    ->whereIn('event_tag', ['leave', 'vacation leave'])
                    ->sum('balance')
            );

            $unused = max(0, $current_balance - $used);

            $totalForceLeaveDeduction += $unused;
        }

        return $balances->map(function ($balance) use ($date, $totalForceLeaveDeduction, $current, $current_balance) {

            if ($balance['leave_type'] === 'vacation leave') {
                $balance['previous'] -= $totalForceLeaveDeduction;
                $balance['current'] -= $totalForceLeaveDeduction;
            }

            $balance['monthly_accrual'] = 0;
            $balance['estimated'] = $balance['current'];

            switch ($balance['leave_type']) {

                case 'vacation leave':

                    $balance['monthly_accrual'] = 1.25; // monthly accrual

                    $balance['estimated'] = $balance['current'] + 1.25;

                    if ($date->month === 12) {

                        $forceLeaveUsed = abs(
                            $current
                                ->filter(fn($item) => Carbon::parse($item->starts_at)->year === $date->year)
                                ->where('leave_type', 'force leave')
                                ->where('event_type', 'deduction')
                                ->whereIn('event_tag', ['leave', 'vacation leave'])
                                ->sum('balance')
                        );

                        $unused = max(0, $current_balance - $forceLeaveUsed);

                        $balance['estimated'] -= $unused;
                    }

                    break;

                case 'sick leave':

                    $balance['monthly_accrual'] = 1.25;
                    $balance['estimated'] += 1.25;

                    break;

                case 'force leave':

                    $forceLeaveUsed = abs(
                        $current
                            ->filter(fn($item) => Carbon::parse($item->starts_at)->year === $date->year)
                            ->where('leave_type', 'force leave')
                            ->where('event_type', 'deduction')
                            ->sum('balance')
                    );

                    $balance['previous'] = max(0,  $current_balance - $forceLeaveUsed);
                    $balance['current'] = max(0, $current_balance - $forceLeaveUsed);
                    $balance['monthly_accrual'] = 0;

                    $balance['estimated'] = $date->month === 12
                        ? 5 // expectation balance
                        : $balance['current'];
                    break;
            }

            return $balance;
        });
    }
}
