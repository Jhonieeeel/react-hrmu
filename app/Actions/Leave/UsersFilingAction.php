<?php

namespace App\Actions\Leave;

use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\Request;

class UsersFilingAction
{
    public function __invoke(Request $request)
    {
        $date = $request->filled('month') && $request->filled('year')
            ? Carbon::create($request->year, $request->month, 1)
            : Carbon::create(now()->year, now()->month, 1);

        return Leave::query()->with('user:id,name')
            ->where('leave_type', 'monthly filing')
            ->whereBetween(
                'starts_at',
                [
                    $date->copy()->startOfMonth(),
                    $date->copy()->endOfMonth()
                ]
            )
            ->paginate(10)
            ->withQueryString();
    }
}
