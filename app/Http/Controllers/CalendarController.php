<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\Calendar\CalendarTransactionsAction;
use App\Actions\Leave\CheckDateRangeAction;
use App\Actions\Leave\CreateLeaveAction;
use App\Data\LeaveDTO;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\Leave;
use Illuminate\Support\Str;

class CalendarController extends Controller
{
    public function index(CalendarTransactionsAction $calendarAction)
    {
        return Inertia::render('Calendar/CalendarIndex', [
            'users' => Employee::query()
                ->with('user:id,name')
                ->get()
                ->map(fn (Employee $employee) => [
                    'id' => $employee->id,
                    'name' => $employee->user?->name ?? 'Unknown employee',
                ]),
            'upcomingLeaves' => $calendarAction->upcomingLeaves(),
            'holidays' => Holiday::query()
                ->orderBy('month')
                ->orderBy('day')
                ->get(['id', 'holiday_name', 'month', 'day']),
        ]);
    }

    public function calendarEvents(CalendarTransactionsAction $calendarAction)
    {
        return response()->json($calendarAction());
    }

    public function store(LeaveDTO $leaveData, CreateLeaveAction $action, CheckDateRangeAction $checkDateRangeAction)
    {
        $weekdays = $checkDateRangeAction->checkDateRange($leaveData);

        $action->createLeaves($weekdays, $leaveData);

        return to_route('calendar.index')->with('success', 'Calendar Leave Added');
    }

    public function update(Request $request, Leave $leave)
    {
        $validated = $request->validate([
            'employee_id' => ['sometimes', 'integer', 'exists:employees,id'],
            'leave_type' => ['sometimes', 'string', 'max:255'],
            'event_type' => ['sometimes', 'string', 'max:255'],
            'event_tag' => ['sometimes', 'nullable', 'string', 'max:255'],
            'balance' => ['sometimes', 'numeric'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after_or_equal:starts_at'],
            'status' => ['sometimes', 'boolean'],
        ]);

        $leave->fill($validated)->save();

        return back()->with('success', [
            'message' => 'Calendar event updated successfully.',
            'id' => Str::uuid(),
        ]);
    }

    public function destroy(Leave $leave)
    {
        $leave->delete();

        return back()->with('success', [
            'message' => 'Calendar event deleted successfully.',
            'id' => Str::uuid(),
        ]);
    }
}
