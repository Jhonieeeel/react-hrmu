<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\DashboardSummaryAction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard summary.
     */
    public function index(Request $request, DashboardSummaryAction $dashboardSummary): mixed
    {
        return Inertia::render('dashboard', $dashboardSummary($request));
    }
}
