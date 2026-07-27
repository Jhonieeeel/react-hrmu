<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\Calendar\CalendarTransactionsAction;

class CalendarController extends Controller
{
    public function index(CalendarTransactionsAction $calendarAction)
    {
        $calendarEvents = $calendarAction();

        return Inertia::render("Calendar/index", ['calendarEvents' => $calendarEvents]);
    }
}
