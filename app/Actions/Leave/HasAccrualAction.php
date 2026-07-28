<?php

namespace App\Actions\Leave;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class HasAccrualAction
{
    public function checkUserStatus(Request $request, User $user): bool
    {
        $date = $request->filled('month') && $request->filled('year')
            ? Carbon::create($request->year, $request->month, 1)
            : Carbon::create(now()->year, now()->month, 1);

        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();

        $hasMonthlyFiling = Leave::query()
            ->whereBelongsTo($user)
            ->where('leave_type', 'monthly filing')
            ->where('status', true)
            ->whereBetween('starts_at', [$start, $end])
            ->exists();

        $hasAccrual = Leave::query()
            ->whereBelongsTo($user)
            ->whereIn('leave_type', [
                'vacation leave',
                'sick leave',
                'force leave',
            ])
            ->where('event_type', 'accrual')
            ->whereBetween('starts_at', [$start->copy()->addMonthNoOverflow(), $end->copy()->addMonthNoOverflow()])
            ->exists();

        return $hasMonthlyFiling && !$hasAccrual;
    }
}
