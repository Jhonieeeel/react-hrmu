<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\UndertimeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get("leaves/exporting_excel", [LeaveController::class, 'export'])->name('leaves.export');


    // Pages
    Route::get("leaves", [LeaveController::class, 'index'])->name('leaves.index');
    Route::get("leaves/{user}", [leaveController::class, 'show'])->name('leaves.show');
    Route::get("calendar", [CalendarController::class, 'index'])->name('calendar.index');
    Route::get("leaves/{leave}/edit_leave", [LeaveController::class, 'edit'])->name('leaves.edit');
    Route::get("users", [UserController::class, 'index'])->name('users.index');

    // PUT / POST
    Route::put("leaves/{leave}/update_filing", [LeaveController::class, 'update'])->name('leaves.update');
    Route::post("leaves/create_leave", [LeaveController::class, 'store'])->name('leaves.store');
    Route::post("leaves/undertim/create_undertime", [UndertimeController::class, 'store'])->name('undertime.store');
    Route::put("leaves/{leave}/update_undertime", [UndertimeController::class, 'update'])->name('undertime.update');
    Route::post("leaves/{user}/create_accrual", [LeaveController::class, 'accrual'])->name('leaves.accrual');
    Route::post("users/create", [UserController::class, 'store'])->name('users.store');
    Route::post("users/balance/create", [UserController::class, 'balance'])->name('users_balance.store');
    Route::post("users/monthy_filing/create", [UserController::class, 'filing'])->name('users_filing.store');

    // data
    Route::get("data/leaves", [LeaveController::class, "filing"])->name('leaves.data');
    Route::get("data/{user}/balance", [LeaveController::class, "userBalance"])->name("leaves.balance");
    Route::get("data/calendar", [CalendarController::class, 'calendarEvents'])->name('calendar.data');
    Route::get("data/users", [UserController::class, 'data'])->name('users.data');

    // export

});

require __DIR__ . '/settings.php';
