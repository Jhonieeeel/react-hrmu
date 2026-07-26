<?php

namespace App\Actions\Leave;

use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveHistoryAction
{
    public function transactions(Request $request, User $user)
    {
        $date = $request->filled('month') && $request->filled('year')
            ? Carbon::create($request->year, $request->month, 1)
            : Carbon::create(now()->year, now()->month, 1);

        return Leave::where('user_id', $user->id)
            ->whereNotIn('leave_type', ['monthly filing'])
            ->whereMonth('starts_at', $date->copy()->month)
            ->whereYear('starts_at', $date->copy()->year)
            ->paginate(5)
            ->withQueryString()
        ;
    }
}
