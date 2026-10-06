<?php

use App\Actions\Leave\ReplayBalanceAction;
use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Http\Request;

/**
 * Builds an employee with one accrual and returns their balance figures for a
 * single leave type.
 *
 * @return array{previous: mixed, current: mixed, used: mixed, estimated: mixed}
 */
function figuresFor(string $leaveType, ?bool $pending, float $days = 2.0): array
{
    $employee = Employee::factory()->create();

    Leave::factory()->for($employee, 'employee')
        ->accrual($leaveType, 5, '2023-01-01', '2023-01-31')
        ->create();

    // Force leave is derived from the year's own accrual, so it needs one in
    // the period being reported.
    if ($leaveType === 'force leave') {
        Leave::factory()->for($employee, 'employee')
            ->accrual($leaveType, 5, '2023-03-01', '2023-03-31')
            ->create();
    }

    if ($pending !== null) {
        $filing = Leave::factory()->for($employee, 'employee')
            ->filed($leaveType, $days, '2023-03-06', '2023-03-07');

        // Chained, because Factory::state() returns a clone — discarding the
        // return value of approved() would silently drop the state.
        $pending ? $filing->create() : $filing->approved()->create();
    }

    $request = Request::create('/data/1/balance', 'GET', [
        'month' => 3,
        'year' => 2023,
    ]);

    $row = collect(ReplayBalanceAction::EmployeeBalance($request, $employee))
        ->firstWhere('leave_type', $leaveType);

    return [
        'previous' => (float) $row['previous'],
        'current' => (float) $row['current'],
        'used' => (float) $row['used'],
        'estimated' => (float) $row['estimated'],
    ];
}

/**
 * Every leave type the engine reports on. Wellness leave and special privilege
 * leave have an annual cap rather than an accrual, force leave is derived from
 * the year's accrual, and sick leave rides the filtered ledger — so the same
 * rule has to hold across three different calculation paths.
 */
dataset('leave types', [
    'vacation leave',
    'sick leave',
    'force leave',
    'wellness leave',
    'special privilege leave',
]);

it('holds the balance steady while a filing is still pending', function (string $leaveType) {
    // The figures with an undecided filing must equal the figures with no
    // filing at all. Anything else means days were consumed before approval.
    expect(figuresFor($leaveType, pending: true))
        ->toEqual(figuresFor($leaveType, pending: null));
})->with('leave types');

it('deducts the filing once it is approved', function (string $leaveType) {
    $pending = figuresFor($leaveType, pending: true);
    $approved = figuresFor($leaveType, pending: false);

    // Approval must actually change something, otherwise the test above would
    // pass for the wrong reason.
    expect($approved)->not->toEqual($pending);
})->with('leave types');

it('keeps a rejected filing out of the balance', function (string $leaveType) {
    $employee = Employee::factory()->create();

    Leave::factory()->for($employee, 'employee')
        ->accrual($leaveType, 5, '2023-01-01', '2023-01-31')
        ->create();

    if ($leaveType === 'force leave') {
        Leave::factory()->for($employee, 'employee')
            ->accrual($leaveType, 5, '2023-03-01', '2023-03-31')
            ->create();
    }

    Leave::factory()->for($employee, 'employee')
        ->filed($leaveType, 2, '2023-03-06', '2023-03-07')
        ->rejected(reviewerId: 1, remarks: 'No')
        ->create();

    $request = Request::create('/data/1/balance', 'GET', [
        'month' => 3,
        'year' => 2023,
    ]);

    $row = collect(ReplayBalanceAction::EmployeeBalance($request, $employee))
        ->firstWhere('leave_type', $leaveType);

    expect((float) $row['used'])->toBe(0.0);
})->with('leave types');

it('still counts an hr-recorded deduction while a filing is pending', function () {
    // Tardiness is HR data entry, approved from birth. It must keep reducing
    // the balance even while an unrelated filing is undecided — otherwise the
    // fix above would be over-broad and hide real deductions.
    $employee = Employee::factory()->create();

    Leave::factory()->for($employee, 'employee')
        ->accrual('vacation leave', 10, '2023-01-01', '2023-01-31')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->deduction('vacation leave', 'tardiness', 0.5, '2023-03-06 08:00', '2023-03-06 08:30')
        ->create();

    $request = Request::create('/data/1/balance', 'GET', [
        'month' => 3,
        'year' => 2023,
    ]);

    $row = collect(ReplayBalanceAction::EmployeeBalance($request, $employee))
        ->firstWhere('leave_type', 'vacation leave');

    expect((float) $row['current'])->toBeLessThan(10.0)
        ->and((float) $row['used'])->toBe(0.0);
});

it('keeps a pending filing out of the exported spreadsheet figures', function () {
    $employee = Employee::factory()->create();
    $employee->load('user');

    Leave::factory()->for($employee, 'employee')
        ->accrual('force leave', 5, '2023-01-01', '2023-01-31')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->accrual('force leave', 5, '2023-03-01', '2023-03-31')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->filed('force leave', 2, '2023-03-06', '2023-03-07')
        ->create();

    $date = Carbon\Carbon::create(2023, 3, 1);

    $export = ReplayBalanceAction::EmployeesBalances($date, collect([$employee]));

    $forceLeave = collect($export[$employee->id]['balances'])
        ->firstWhere('leave_type', 'force leave');

    // The export must agree with the on-screen balance, so an undecided filing
    // cannot show up as consumed days in the report either.
    expect((float) $forceLeave['current'])->toBe(10.0)
        ->and($export[$employee->id]['leaves'])->toBeEmpty();
});

it('shows the filing in the export once it is approved', function () {
    $employee = Employee::factory()->create();
    $employee->load('user');

    Leave::factory()->for($employee, 'employee')
        ->accrual('force leave', 5, '2023-01-01', '2023-01-31')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->accrual('force leave', 5, '2023-03-01', '2023-03-31')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->filed('force leave', 2, '2023-03-06', '2023-03-07')
        ->approved()
        ->create();

    $date = Carbon\Carbon::create(2023, 3, 1);

    $export = ReplayBalanceAction::EmployeesBalances($date, collect([$employee]));

    $forceLeave = collect($export[$employee->id]['balances'])
        ->firstWhere('leave_type', 'force leave');

    expect((float) $forceLeave['current'])->toBe(8.0)
        ->and($export[$employee->id]['leaves'])->toHaveCount(1);
});

it('carries the employee position into the export row', function () {
    $employee = Employee::factory()->create(['position' => 'Payroll Officer']);
    $employee->load('user');

    $date = Carbon\Carbon::create(2023, 3, 1);

    $export = ReplayBalanceAction::EmployeesBalances($date, collect([$employee]));

    // `position` is a column on employees. It was previously read as
    // $user->employees?->position, which is a User-side relation and so always
    // resolved to null — the PDF has been rendering a blank title this way.
    expect($export[$employee->id]['position'])->toBe('Payroll Officer');
});

it('reads position even when the caller selected columns explicitly', function () {
    $employee = Employee::factory()->create(['position' => 'HR Assistant']);

    // Mirrors LeaveController::export, which narrows the select to avoid
    // pulling every employees column into the report.
    $selected = Employee::query()
        ->with('user:id,name')
        ->get(['id', 'user_id', 'position'])
        ->first();

    expect($selected->position)->toBe('HR Assistant');

    $date = Carbon\Carbon::create(2023, 3, 1);
    $export = ReplayBalanceAction::EmployeesBalances($date, collect([$selected]));

    expect($export[$selected->id]['position'])->toBe('HR Assistant');
});
