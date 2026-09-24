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
}
