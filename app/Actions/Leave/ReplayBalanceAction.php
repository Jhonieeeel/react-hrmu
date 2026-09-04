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

    public static function UserBalance(Request $request, User $user): array
    {
        $date = $request->filled('month') && $request->filled('year')
            ? Carbon::create($request->year, $request->month, 1)
            : Carbon::create(now()->year, now()->month, 1);

        $start = Carbon::create(2023, 1, 1);

        $current = Leave::query()
            ->where('user_id', $user->id)
            ->whereBetween('starts_at', [
                $start,
                $date->copy()->endOfMonth(),
            ])
            ->get();

        $previous = Leave::query()
            ->where('user_id', $user->id)
            ->whereDate('starts_at', '<', $date->copy()->startOfMonth())
            ->get();

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
                'deductionAmount' => $event->balance,
            ];
        })->values()->toArray();

        return [
            'events' => $events,
            'undertimeCount' => $undertimeCount,
            'tardinessCount' => $tardinessCount,
        ];
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
                if ($type === 'vacation leave') {
                    $flAsVacationLeave = $current->where('leave_type', 'force leave')->where('event_tag', $type)->sum('balance');
                }

                return [
                    'leave_type' => $type,

                    'previous' => $previous
                        ->where('leave_type', $type)
                        ->sum('balance'),

                    'current' => $current
                        ->where('leave_type', $type)
                        ->sum('balance') + $flAsVacationLeave,

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
