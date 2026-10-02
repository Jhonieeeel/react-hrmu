<?php

use App\Enums\Role;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;

function filingPayload(int $employeeId, string $start = '2023-03-06', string $end = '2023-03-08'): array
{
    return [
        'employee_id' => $employeeId,
        'leave_type' => 'vacation leave',
        'event_type' => 'deduction',
        'event_tag' => 'leave',
        'balance' => -3,
        'starts_at' => $start,
        'ends_at' => $end,
        'status' => null,
        'remarks' => 'Family trip',
    ];
}

function employeeWithRecord(): array
{
    $user = User::factory()->create();
    $employee = Employee::factory()->create(['user_id' => $user->id]);

    return [$user, $employee];
}

it('stores a filed leave as pending and groups its segments', function () {
    [$user, $employee] = employeeWithRecord();

    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($employee->id))
        ->assertRedirect();

    $leaves = Leave::where('employee_id', $employee->id)->get();

    expect($leaves)->not->toBeEmpty();

    // Mar 6-8 2023 is Mon-Wed, so a single contiguous segment is expected.
    expect($leaves)->toHaveCount(1)
        ->and($leaves->first()->isPendingReview())->toBeTrue()
        ->and($leaves->first()->isApproved())->toBeFalse()
        ->and($leaves->first()->filing_group_id)->not->toBeNull();
});

it('gives every segment of one submission the same filing group', function () {
    [$user, $employee] = employeeWithRecord();

    // Mar 9-13 2023 spans a weekend, so it is stored as two segments:
    // Mar 9-10 (Thu-Fri) and Mar 13 (Mon).
    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($employee->id, '2023-03-09', '2023-03-13'))
        ->assertRedirect();

    $groupIds = Leave::where('employee_id', $employee->id)
        ->pluck('filing_group_id')
        ->unique();

    expect(Leave::where('employee_id', $employee->id)->count())->toBe(2)
        ->and($groupIds)->toHaveCount(1);
});

it('lets an employee delete their own pending leave', function () {
    [$user, $employee] = employeeWithRecord();

    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($employee->id));

    $leave = Leave::where('employee_id', $employee->id)->firstOrFail();

    $this->actingAs($user)
        ->delete(route('leaves.destroy', $leave))
        ->assertRedirect();

    expect(Leave::whereKey($leave->id)->exists())->toBeFalse();
});

it('stops an employee editing or deleting a leave once it is approved', function () {
    [$user, $employee] = employeeWithRecord();

    $leave = Leave::factory()
        ->for($employee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->approved()
        ->create();

    $this->actingAs($user)
        ->delete(route('leaves.destroy', $leave))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('leaves.edit', $leave))
        ->assertForbidden();

    expect(Leave::whereKey($leave->id)->exists())->toBeTrue();
});

it('stops an employee touching another employee\'s leave', function () {
    [$owner, $ownerEmployee] = employeeWithRecord();
    [$other, $otherEmployee] = employeeWithRecord();

    $leave = Leave::factory()
        ->for($ownerEmployee, 'employee')
        ->filed('vacation leave', 3, '2023-03-06', '2023-03-08')
        ->create();

    $this->actingAs($other)
        ->delete(route('leaves.destroy', $leave))
        ->assertForbidden();
});

it('ignores an attempt to file leave against another employee id', function () {
    [$user, $ownEmployee] = employeeWithRecord();
    [, $victimEmployee] = employeeWithRecord();

    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($victimEmployee->id));

    // The request is redirected to the caller's own record rather than
    // silently filing against the other employee.
    expect(Leave::where('employee_id', $victimEmployee->id)->count())->toBe(0)
        ->and(Leave::where('employee_id', $ownEmployee->id)->count())->toBe(1);
});

it('stops an employee viewing another employee\'s balance', function () {
    [$user] = employeeWithRecord();
    [, $victim] = employeeWithRecord();

    $this->actingAs($user)
        ->get(route('leaves.show', $victim))
        ->assertForbidden();

    $this->actingAs($user)
        ->getJson(route('leaves.balance', $victim))
        ->assertForbidden();
});

it('lets hr approve every segment of a submission at once', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($employee->id, '2023-03-09', '2023-03-13'));

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)
        ->post(route('leave-reviews.approve', $groupId))
        ->assertRedirect();

    $leaves = Leave::where('filing_group_id', $groupId)->get();

    expect($leaves)->toHaveCount(2);

    foreach ($leaves as $leave) {
        expect($leave->isApproved())->toBeTrue()
            ->and($leave->reviewed_by)->toBe($hr->id)
            ->and($leave->reviewed_at)->not->toBeNull();
    }
});

it('requires a reason when rejecting', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($employee->id));

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)
        ->post(route('leave-reviews.reject', $groupId), [])
        ->assertSessionHasErrors('review_remarks');

    $this->actingAs($hr)
        ->post(route('leave-reviews.reject', $groupId), ['review_remarks' => 'No balance'])
        ->assertRedirect();

    $leave = Leave::where('filing_group_id', $groupId)->firstOrFail();

    expect($leave->isRejected())->toBeTrue()
        ->and($leave->review_remarks)->toBe('No balance');
});

it('stops a second decision on an already reviewed request', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($employee->id));

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId));
    $this->actingAs($hr)->post(route('leave-reviews.reject', $groupId), ['review_remarks' => 'x']);

    expect(Leave::where('filing_group_id', $groupId)->firstOrFail()->isApproved())->toBeTrue();
});

it('ignores a decision on an unknown filing group', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    $this->actingAs($hr)
        ->post(route('leave-reviews.approve', 'does-not-exist'))
        ->assertRedirect();

    expect(Leave::where('filing_group_id', 'does-not-exist')->count())->toBe(0);
});

it('lists a pending request in the review queue', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($employee->id));

    $response = $this->actingAs($hr)
        ->getJson(route('leave-reviews.data'))
        ->assertOk();

    $requests = $response->json('requests');

    expect($requests)->toHaveCount(1)
        ->and($requests[0]['employee_id'])->toBe($employee->id)
        ->and($requests[0]['leave_type'])->toBe('vacation leave')
        ->and($requests[0]['total_days'])->toBeGreaterThan(0);
});

it('clears the request from the queue once approved', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)->post(route('leaves.store'), filingPayload($employee->id));

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId));

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data'))
        ->assertOk()
        ->assertJsonCount(0, 'requests');
});
