<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PassSlipController;
use App\Http\Controllers\UndertimeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get("dashboard", [DashboardController::class, 'index'])->name('dashboard');

    // export
    Route::get("leaves/exporting_excel", [LeaveController::class, 'export'])->name('leaves.export');


    // Pages
    Route::get("leaves", [LeaveController::class, 'index'])->name('leaves.index');
    Route::get("leaves/{employee}", [LeaveController::class, 'show'])->name('leaves.show');
    Route::get("calendar", [CalendarController::class, 'index'])->name('calendar.index');
    Route::get("leaves/{leave}/edit_leave", [LeaveController::class, 'edit'])->name('leaves.edit');
    Route::get("users", [UserController::class, 'index'])->name('users.index');

    // Organization CRUD
    Route::post('organizations/divisions', [OrganizationController::class, 'storeDivision'])->name('divisions.store');
    Route::put('organizations/divisions/{division}', [OrganizationController::class, 'updateDivision'])->name('divisions.update');
    Route::delete('organizations/divisions/{division}', [OrganizationController::class, 'destroyDivision'])->name('divisions.destroy');
    Route::post('organizations/sections', [OrganizationController::class, 'storeSection'])->name('sections.store');
    Route::put('organizations/sections/{section}', [OrganizationController::class, 'updateSection'])->name('sections.update');
    Route::delete('organizations/sections/{section}', [OrganizationController::class, 'destroySection'])->name('sections.destroy');
    Route::post('organizations/units', [OrganizationController::class, 'storeUnit'])->name('units.store');
    Route::put('organizations/units/{unit}', [OrganizationController::class, 'updateUnit'])->name('units.update');
    Route::delete('organizations/units/{unit}', [OrganizationController::class, 'destroyUnit'])->name('units.destroy');

    // Holiday CRUD
    Route::post('holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::delete('holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');

    // Calendar event actions
    Route::put('calendar/{leave}/update', [CalendarController::class, 'update'])->name('calendar.update');
    Route::delete('calendar/{leave}/delete', [CalendarController::class, 'destroy'])->name('calendar.destroy');

    // PUT / POST
    Route::put("leaves/{leave}/update_filing", [LeaveController::class, 'update'])->name('leaves.update'); // for monthly filing
    Route::post("leaves/create_leave", [LeaveController::class, 'store'])->name('leaves.store');
    Route::post("leaves/undertim/create_undertime", [UndertimeController::class, 'store'])->name('undertime.store');
    Route::put("leaves/{leave}/update_undertime", [UndertimeController::class, 'update'])->name('undertime.update');
    Route::delete("leaves/{leave}/delete", [LeaveController::class, 'destroy'])->name('leaves.destroy');
    Route::post("leaves/{user}/create_accrual", [LeaveController::class, 'accrual'])->name('leaves.accrual');
    Route::post("users/create", [UserController::class, 'store'])->name('users.store');
    Route::post("users/balance/create", [UserController::class, 'balance'])->name('users_balance.store');
    Route::post("users/monthy_filing/create", [UserController::class, 'filing'])->name('users_filing.store');
    Route::get("users/{user}", [UserController::class, 'show'])->name('users_info.show');
    Route::post("users/{user}/initial_accrual", [LeaveController::class, 'initialAccrual'])->name('leaves.initial_accrual');
    Route::post('users/{user}/update', [UserController::class, 'update'])->name('users.update');

    // data
    Route::get("data/leaves", [LeaveController::class, "filing"])->name('leaves.data');
    Route::get("data/{employee}/balance", [LeaveController::class, "userBalance"])->name("leaves.balance");
    Route::get("data/calendar", [CalendarController::class, 'calendarEvents'])->name('calendar.data');
    Route::get("data/users", [UserController::class, 'data'])->name('users.data');

    Route::get("slip", [PassSlipController::class, 'index'])->name('slip.index');
});

require __DIR__ . '/settings.php';
