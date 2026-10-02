<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LeaveReviewController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PassSlipController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UndertimeController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // export
    Route::get('leaves/exporting_excel', [LeaveController::class, 'export'])
        ->middleware('permission:export balances')
        ->name('leaves.export');

    // Pages
    Route::get('leaves', [LeaveController::class, 'index'])->name('leaves.index');
    Route::get('leaves/{employee}', [LeaveController::class, 'show'])->name('leaves.show');
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('leaves/{leave}/edit_leave', [LeaveController::class, 'edit'])->name('leaves.edit');

    // Leave review queue (HR). Approving or rejecting always acts on a whole
    // filing_group_id so a multi-segment request is never split.
    Route::middleware('permission:review leave')->group(function () {
        Route::get('leave-reviews', [LeaveReviewController::class, 'index'])->name('leave-reviews.index');
        Route::get('data/leave-reviews', [LeaveReviewController::class, 'data'])->name('leave-reviews.data');
        Route::post('leave-reviews/{filingGroup}/approve', [LeaveReviewController::class, 'approve'])->name('leave-reviews.approve');
        Route::post('leave-reviews/{filingGroup}/reject', [LeaveReviewController::class, 'reject'])->name('leave-reviews.reject');
    });

    // Organization CRUD
    Route::middleware('permission:manage organization')->group(function () {
        Route::post('organizations/divisions', [OrganizationController::class, 'storeDivision'])->name('divisions.store');
        Route::put('organizations/divisions/{division}', [OrganizationController::class, 'updateDivision'])->name('divisions.update');
        Route::delete('organizations/divisions/{division}', [OrganizationController::class, 'destroyDivision'])->name('divisions.destroy');
        Route::post('organizations/sections', [OrganizationController::class, 'storeSection'])->name('sections.store');
        Route::put('organizations/sections/{section}', [OrganizationController::class, 'updateSection'])->name('sections.update');
        Route::delete('organizations/sections/{section}', [OrganizationController::class, 'destroySection'])->name('sections.destroy');
        Route::post('organizations/units', [OrganizationController::class, 'storeUnit'])->name('units.store');
        Route::put('organizations/units/{unit}', [OrganizationController::class, 'updateUnit'])->name('units.update');
        Route::delete('organizations/units/{unit}', [OrganizationController::class, 'destroyUnit'])->name('units.destroy');
    });

    // Holiday CRUD
    Route::middleware('permission:manage holidays')->group(function () {
        Route::post('holidays', [HolidayController::class, 'store'])->name('holidays.store');
        Route::delete('holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');
    });

    // Calendar event actions. The controller authorises against the LeavePolicy,
    // which is what keeps an employee from editing someone else's entry.
    Route::put('calendar/{leave}/update', [CalendarController::class, 'update'])->name('calendar.update');
    Route::delete('calendar/{leave}/delete', [CalendarController::class, 'destroy'])->name('calendar.destroy');

    // PUT / POST
    Route::put('leaves/{leave}/update_filing', [LeaveController::class, 'update'])->name('leaves.update'); // for monthly filing
    Route::post('leaves/create_leave', [LeaveController::class, 'store'])->name('leaves.store');
    Route::delete('leaves/{leave}/delete', [LeaveController::class, 'destroy'])->name('leaves.destroy');

    // Adjustments are HR data entry, never employee self-service.
    Route::middleware('permission:record adjustments')->group(function () {
        Route::post('leaves/undertim/create_undertime', [UndertimeController::class, 'store'])->name('undertime.store');
        Route::put('leaves/{leave}/update_undertime', [UndertimeController::class, 'update'])->name('undertime.update');
    });

    // Accruals and initial balances are HR-only.
    Route::middleware('permission:manage accruals')->group(function () {
        Route::post('leaves/{user}/create_accrual', [LeaveController::class, 'accrual'])->name('leaves.accrual');
        Route::post('users/balance/create', [UserController::class, 'balance'])->name('users_balance.store');
        Route::post('users/{user}/initial_accrual', [LeaveController::class, 'initialAccrual'])->name('leaves.initial_accrual');
    });

    // Employee administration
    Route::middleware('permission:view all employees')->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('data/users', [UserController::class, 'data'])->name('users.data');
        Route::post('users/create', [UserController::class, 'store'])->name('users.store');
        Route::post('users/monthy_filing/create', [UserController::class, 'filing'])->name('users_filing.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users_info.show');
        Route::post('users/{user}/update', [UserController::class, 'update'])->name('users.update');
    });

    // Role assignment. Split out from the block above because it is
    // super-admin-only, while employee management is also open to the HR role.
    Route::middleware('permission:assign roles')->group(function () {
        Route::put('users/{user}/roles', [RoleController::class, 'update'])->name('users.roles.update');
        Route::get('data/roles', [RoleController::class, 'options'])->name('roles.data');
    });

    // data
    Route::get('data/leaves', [LeaveController::class, 'filing'])->name('leaves.data');
    Route::get('data/{employee}/balance', [LeaveController::class, 'userBalance'])->name('leaves.balance');
    Route::get('data/calendar', [CalendarController::class, 'calendarEvents'])->name('calendar.data');

    Route::get('slip', [PassSlipController::class, 'index'])->name('slip.index');
});

require __DIR__.'/settings.php';
