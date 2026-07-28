<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\LeaveController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Pages
    Route::get("leaves", [LeaveController::class, 'index'])->name('leaves.index');
    Route::get("leaves/{user}", [leaveController::class, 'show'])->name('leaves.show');
    Route::get("calendar", [CalendarController::class, 'index'])->name('calendar.index');

    // HTTP Requests
    Route::put("leaves/{leave}/update", [LeaveController::class, 'update'])->name('leaves.update');

    // data
    Route::get("data/leaves", [LeaveController::class, "filing"])->name('leaves.data');
    Route::get("data/{user}/balance", [LeaveController::class, "userBalance"])->name("leaves.balance");
    Route::get("data/calendar", [CalendarController::class, 'calendarEvents'])->name('calendar.data');
});

require __DIR__ . '/settings.php';
