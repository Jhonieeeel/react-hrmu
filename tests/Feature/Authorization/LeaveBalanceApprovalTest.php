<?php

use App\Actions\Leave\ReplayBalanceAction;
use App\Models\Employee;
use App\Models\Leave;
use App\Services\LeaveBalanceService;
use Illuminate\Http\Request;

function balanceFor(Employee $employee): array
{
    $request = Request::create('/data/1/balance', 'GET', [
        'month' => 3,
        'year' => 2023,
    ]);

    $balances = ReplayBalanceAction::EmployeeBalance($request, $employee);

    return collect($balances)->keyBy('leave_type')->all();
}

function seededEmployee(): Employee
{
    $employee = Employee::factory()->create();

    // 10 days accrued in January, matching the seeded-history pattern.
    Leave::factory()
        ->for($employee, 'employee')
        ->accrual('vacation leave', 10, '2023-01-01', '2023-01-31')
        ->create();

    return $employee;
}

it('excludes a pending leave from the balance', function () {
    $employee = seededEmployee();

    Leave::factory()
        ->for($employee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->create();

    $balance = balanceFor($employee)['vacation leave'];

    // 10 accrued, 3 still awaiting approval so nothing is consumed yet.
    expect((float) $balance['previous'])->toBe(10.0)
        ->and((float) $balance['used'])->toBe(0.0);
});

it('deducts a leave once it is approved', function () {
    $employee = seededEmployee();

    Leave::factory()
        ->for($employee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->approved()
        ->create();

    $balance = balanceFor($employee)['vacation leave'];

    // The engine reports accrued and consumed separately, so `used` is the field
    // that reflects the deduction.
    expect((float) $balance['used'])->toBe(3.0)
        ->and((float) $balance['previous'])->toBe(10.0);
});

it('excludes a rejected leave from the balance', function () {
    $employee = seededEmployee();

    Leave::factory()
        ->for($employee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->rejected(reviewerId: 1, remarks: 'Insufficient balance')
        ->create();

    $balance = balanceFor($employee)['vacation leave'];

    expect((float) $balance['used'])->toBe(0.0)
        ->and((float) $balance['previous'])->toBe(10.0);
});

it('still counts an hr-recorded deduction as approved', function () {
    $employee = seededEmployee();

    // Tardiness is entered by HR, not filed by the employee, so it must always
    // count regardless of the approval workflow.
    Leave::factory()
        ->for($employee, 'employee')
        ->deduction('vacation leave', 'tardiness', 0.5, '2023-03-06 08:00', '2023-03-06 08:30')
        ->create();

    $balance = balanceFor($employee)['vacation leave'];

    // Undertime is folded into the month's `current` figure by totalUndertime(),
    // so that is where the reduction shows up.
    expect((float) $balance['current'])->toBeLessThan(10.0);
});

it('reports pending days separately from the balance', function () {
    $employee = seededEmployee();

    Leave::factory()
        ->for($employee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->create();

    $request = Request::create('/');
    $request->setUserResolver(fn () => Employee::find($employee->id)->user);

    $service = new LeaveBalanceService(
        $request,
        Employee::find($employee->id)->user
    );

    expect($service->pendingByLeaveType($employee))
        ->toHaveKey('vacation leave')
        ->and($service->pendingByLeaveType($employee)['vacation leave'])->toBe(3.0);
});
