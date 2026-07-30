<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\Calendar\CalendarTransactionsAction;
use App\Actions\Leave\CheckDateRangeAction;
use App\Actions\Leave\CreateLeaveAction;
use App\Data\LeaveDTO;
use App\Models\User;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render("Calendar/CalendarIndex", ['users' => User::all()]);
    }

    public function calendarEvents(CalendarTransactionsAction $calendarAction)
    {
        return response()->json($calendarAction());
    }

    public function store(LeaveDTO $leaveData, CreateLeaveAction $action, CheckDateRangeAction $checkDateRangeAction)
    {
        $weekdays = $checkDateRangeAction->checkDateRange($leaveData);

        $action->createLeaves($weekdays, $leaveData);

        return to_route('calendar.index')->with('message', 'Calendar Leave Added');
    }
}
