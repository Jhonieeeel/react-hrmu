<?php

use App\Actions\Leave\LeaveHistoryAction;
use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Http\Request;

it('labels each history row with its approval state', function () {
    $employee = Employee::factory()->create();

    Leave::factory()->for($employee, 'employee')
        ->accrual('vacation leave', 10, '2023-03-01', '2023-03-31')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->filed('vacation leave', 2, '2023-03-06', '2023-03-07')
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->filed('vacation leave', 1, '2023-03-13')
        ->approved()
        ->create();

    Leave::factory()->for($employee, 'employee')
        ->filed('vacation leave', 1, '2023-03-20')
        ->rejected(reviewerId: 1, remarks: 'No')
        ->create();

    $request = Request::create('/', 'GET', ['month' => 3, 'year' => 2023]);

    $rows = (new LeaveHistoryAction)->transactions($request, $employee);

    $byDay = collect($rows->items())
        ->mapWithKeys(fn (Leave $leave) => [
            Carbon\Carbon::parse($leave->starts_at)->toDateString() => $leave->approval_state,
        ])
        ->all();

    expect($byDay)->toMatchArray([
        '2023-03-06' => 'pending',
        '2023-03-13' => 'approved',
        '2023-03-20' => 'rejected',
    ]);

    // The accrual carries no decision of its own, but must still be labelled
    // so the table can decide how to render every row.
    expect($byDay['2023-03-01'])->toBe('approved');
});

it('marks an hr-recorded deduction as approved without a decision', function () {
    $employee = Employee::factory()->create();

    Leave::factory()->for($employee, 'employee')
        ->deduction('vacation leave', 'tardiness', 0.5, '2023-03-06 08:00', '2023-03-06 08:30')
        ->create();

    $request = Request::create('/', 'GET', ['month' => 3, 'year' => 2023]);

    $rows = (new LeaveHistoryAction)->transactions($request, $employee);

    // Nothing about a tardiness entry is ever "pending" — HR records it directly.
    expect($rows->items()[0]->approval_state)->toBe('approved');
});
