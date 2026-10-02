<?php

namespace App\Actions\Leave;

use App\Models\Employee;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveHistoryAction
{
    public function transactions(Request $request, Employee $user)
    {
        $date = $request->filled('month') && $request->filled('year')
            ? Carbon::create($request->year, $request->month, 1)
            : Carbon::create(now()->year, now()->month, 1);

        return Leave::query()
            ->where('employee_id', $user->id)
            ->whereNot('leave_type', 'monthly filing')
            ->whereIn('event_type', ['accrual', 'deduction'])
            ->whereMonth('starts_at', $date->copy()->month)
            ->whereYear('starts_at', $date->copy()->year)
            ->paginate(5)
            ->withQueryString()
            // The rows are listed whether or not they have been approved, so the
            // UI has to be able to tell a pending filing from one that actually
            // moved the balance. See Leave::approvalState().
            ->through(fn (Leave $leave) => $leave->setAttribute(
                'approval_state',
                $leave->approvalState(),
            ));
    }
}
