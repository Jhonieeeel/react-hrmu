<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\UndertimeController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Pages
    Route::get("leaves", [LeaveController::class, 'index'])->name('leaves.index');
    Route::get("leaves/{user}", [leaveController::class, 'show'])->name('leaves.show');
    Route::get("calendar", [CalendarController::class, 'index'])->name('calendar.index');
    Route::get("leaves/{leave}/edit", [LeaveController::class, 'edit'])->name('leaves.edit');

    // PUT / POST
    Route::put("leaves/{leave}/update", [LeaveController::class, 'update'])->name('leaves.update');
    Route::post("leaves/create", [LeaveController::class, 'store'])->name('leaves.store');
    Route::post("leaves/undertim/create", [UndertimeController::class, 'store'])->name('undertime.store');

    // data
    Route::get("data/leaves", [LeaveController::class, "filing"])->name('leaves.data');
    Route::get("data/{user}/balance", [LeaveController::class, "userBalance"])->name("leaves.balance");
    Route::get("data/calendar", [CalendarController::class, 'calendarEvents'])->name('calendar.data');
});

require __DIR__ . '/settings.php';
