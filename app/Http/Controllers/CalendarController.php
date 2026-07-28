<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\Calendar\CalendarTransactionsAction;
use App\Models\User;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render("Calendar/index", ['users' => User::all()]);
    }

    public function calendarEvents(CalendarTransactionsAction $calendarAction)
    {
        return response()->json($calendarAction());
    }
}
