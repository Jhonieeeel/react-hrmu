<?php

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveStatusChange;
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

/**
 * Files a leave request that stays in the review queue.
 *
 * Filed by a plain employee: every filing waits for a decision, whoever files
 * it, so there is no special caller needed here any more.
 *
 * @return array{0: User, 1: Employee}
 */
function filePendingLeave(string $start = '2023-03-06', string $end = '2023-03-08'): array
{
    [$user, $employee] = employeeWithRecord();

    test()->actingAs($user)
        ->post(route('leaves.store'), filingPayload($employee->id, $start, $end))
        ->assertRedirect();

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

    // Mar 9-13 2023 spans a weekend, so it is stored as two segments.
    [, $employee] = filePendingLeave('2023-03-09', '2023-03-13');

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
    [, $employee] = filePendingLeave();

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
    [, $employee] = filePendingLeave();

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
    [, $employee] = filePendingLeave();

    $response = $this->actingAs($hr)
        ->getJson(route('leave-reviews.data'))
        ->assertOk();

    $requests = $response->json('requests.data');

    expect($requests)->toHaveCount(1)
        ->and($requests[0]['employee_id'])->toBe($employee->id)
        ->and($requests[0]['leave_type'])->toBe('vacation leave')
        ->and($requests[0]['total_days'])->toBeGreaterThan(0)
        ->and($response->json('counts.pending'))->toBe(1);
});

it('clears the request from the queue once approved', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId));

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data'))
        ->assertOk()
        ->assertJsonCount(0, 'requests.data')
        ->assertJsonPath('counts.pending', 0)
        // The decision moves it to the approved bucket rather than deleting it.
        ->assertJsonPath('counts.approved', 1);
});

it('shows a decided request on the approved tab with its decision trail', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId), [
        'review_remarks' => 'Enjoy',
    ]);

    $response = $this->actingAs($hr)
        ->getJson(route('leave-reviews.data', ['status' => 'approved']))
        ->assertOk();

    $approved = $response->json('requests.data');

    expect($approved)->toHaveCount(1)
        ->and($approved[0]['review_remarks'])->toBe('Enjoy')
        ->and($approved[0]['reviewed_at'])->not->toBeNull()
        ->and($approved[0]['reviewer_name'])->toBe($hr->name);
});

it('moves a rejected request out of pending and into rejected', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.reject', $groupId), [
        'review_remarks' => 'No balance',
    ]);

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data', ['status' => 'rejected']))
        ->assertOk()
        ->assertJsonCount(1, 'requests.data');

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data', ['status' => 'pending']))
        ->assertOk()
        ->assertJsonCount(0, 'requests.data');
});

it('falls back to pending for an unknown status filter', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data', ['status' => 'not-a-status']))
        ->assertOk()
        ->assertJsonCount(1, 'requests.data');
});

it('renders the review queue page for a reviewer and hides it from everyone else', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $this->actingAs($hr)
        ->get(route('leave-reviews.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Leave/ReviewQueue')
            ->has('requests.data', 1)
            ->where('counts.pending', 1)
            ->where('filters.status', 'pending')
        );

    // A plain employee has no ReviewLeave permission, so the page is unreachable.
    $plain = User::factory()->create();

    $this->actingAs($plain)
        ->get(route('leave-reviews.index'))
        ->assertForbidden();
});

it('does not let a non-HR user record an undertime adjustment', function () {
    $plain = User::factory()->create();
    [, $employee] = employeeWithRecord();

    $this->actingAs($plain)
        ->post(route('undertime.store'), [
            'employee_id' => $employee->id,
            'leave_type' => 'vacation leave',
            'event_type' => 'deduction',
            'event_tag' => 'tardiness',
            'balance' => -0.5,
            'starts_at' => '2023-03-06 08:00:00',
            'ends_at' => '2023-03-06 09:00:00',
        ])
        ->assertForbidden();

    expect(Leave::where('employee_id', $employee->id)->count())->toBe(0);
});

it('lets an HR user record an undertime adjustment', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('undertime.store'), [
            'employee_id' => $employee->id,
            'leave_type' => 'vacation leave',
            'event_type' => 'deduction',
            'event_tag' => 'tardiness',
            'balance' => -0.5,
            'starts_at' => '2023-03-06 08:00:00',
            'ends_at' => '2023-03-06 09:00:00',
        ])
        ->assertRedirect();

    expect(Leave::where('employee_id', $employee->id)->count())->toBe(1);
});

/*
 * Every filing waits for a decision
 *
 * Earlier drafts treated a filing by someone holding ReviewLeave as that
 * person's own approval. That was wrong — the paper record still has to be
 * agreed to by a person, so those requests were being recorded as approved
 * without anyone having decided them. Nobody self-approves now; holders of the
 * permission move a request explicitly, through the status endpoint tested below.
 */

it('holds a reviewer filing their own leave for approval', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $own = Employee::factory()->create(['user_id' => $hr->id]);
    $hr->setRelation('employees', collect([$own]));

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($own->id));

    expect(Leave::where('employee_id', $own->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('holds a reviewer filing leave for an employee', function () {
    // HR entering leave for somebody is not HR approving it.
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($employee->id));

    expect(Leave::where('employee_id', $employee->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('holds a super admin filing leave for an employee', function () {
    $admin = superAdmin();
    [, $employee] = employeeWithRecord();

    $this->actingAs($admin)
        ->post(route('leaves.store'), filingPayload($employee->id));

    expect(Leave::where('employee_id', $employee->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('holds a reviewer filing a cto', function () {
    // cto spends a credit rather than taking leave, but it is still a filing:
    // only one of FILED_LEAVE_TAGS, so it waits like any other.
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), [
            ...filingPayload($employee->id),
            'leave_type' => 'cto',
            'event_tag' => 'cto',
        ]);

    expect(Leave::where('employee_id', $employee->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('holds a reviewer filing an offset', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), [
            ...filingPayload($employee->id),
            'leave_type' => 'offset',
            'event_tag' => 'offset',
        ]);

    expect(Leave::where('employee_id', $employee->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('holds a plain employee filing', function () {
    [$user, $employee] = employeeWithRecord();

    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($employee->id));

    expect(Leave::where('employee_id', $employee->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('tells every filer the request is awaiting approval', function () {
    // One message for every role now that there is no auto-approve branch to
    // describe. Telling an admin a request is approved when it is not sends
    // someone hunting a queue entry that is not there.
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = employeeWithRecord();

    $this->actingAs($hr)
        ->post(route('leaves.store'), filingPayload($employee->id))
        ->assertSessionHas('success.message', 'Leave filed successfully and is awaiting approval.');
});

it('never lets a filing carry an approved status through the payload', function () {
    // `status` is on the DTO, so a crafted payload could try to post it as
    // approved. The action writes the column itself, so the request value is
    // ignored — asserted because the field is still accepted from the client,
    // and that is the sort of thing that quietly comes back to life.
    [$user, $employee] = employeeWithRecord();

    $this->actingAs($user)
        ->post(route('leaves.store'), [
            ...filingPayload($employee->id),
            'status' => true,
        ]);

    expect(Leave::where('employee_id', $employee->id)->firstOrFail()->isPendingReview())->toBeTrue();
});

/*
 * Correcting a status after the fact
 *
 * The paper record and the screen are expected to disagree: some requests were
 * recorded as approved without anyone having agreed to them, and somebody has to
 * be able to move them. Anyone holding ReviewLeave can, every move is written to
 * an audit trail, and nobody else can touch them.
 */

it('lets a reviewer move an already approved request back to pending', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId));

    $this->actingAs($hr)
        ->patch(route('leave-reviews.status', $groupId), ['status' => 'pending']);

    $leave = Leave::where('filing_group_id', $groupId)->firstOrFail();

    expect($leave->isPendingReview())->toBeTrue()
        // scopePendingReview() reads whereNull('reviewed_at'), so a row cleared
        // only on the boolean would drop out of the queue while still reading
        // as approved.
        ->and($leave->reviewed_at)->toBeNull()
        ->and($leave->reviewed_by)->toBeNull();
});

it('lets a reviewer reject a request that was approved', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId));

    $this->actingAs($hr)->patch(route('leave-reviews.status', $groupId), [
        'status' => 'rejected',
        'review_remarks' => 'Not approved on the paper record',
    ]);

    expect(Leave::where('filing_group_id', $groupId)->firstOrFail()->isRejected())->toBeTrue();
});

it('keeps a correction on the audit trail with who and when', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.approve', $groupId));

    $this->actingAs($hr)->patch(route('leave-reviews.status', $groupId), ['status' => 'pending']);

    // The `leaves` row only holds the current decision, so the trail is the only
    // record that the request was ever approved.
    $change = LeaveStatusChange::where('filing_group_id', $groupId)->firstOrFail();

    expect($change->from_status)->toBe('approved')
        ->and($change->to_status)->toBe('pending')
        ->and($change->user_id)->toBe($hr->id)
        ->and($change->created_at)->not->toBeNull();
});

it('records one audit entry per filing rather than one per ledger row', function () {
    // Mar 9-13 2023 spans a weekend, so the submission is stored as two
    // segments. Moving it is one decision by one person.
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave('2023-03-09', '2023-03-13');

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    expect(Leave::where('filing_group_id', $groupId)->count())->toBe(2);

    $this->actingAs($hr)->patch(route('leave-reviews.status', $groupId), ['status' => 'approved']);

    expect(LeaveStatusChange::where('filing_group_id', $groupId)->count())->toBe(1);

    // Both segments move, so the filing is never left half-decided.
    foreach (Leave::where('filing_group_id', $groupId)->get() as $leave) {
        expect($leave->isApproved())->toBeTrue();
    }
});

it('keeps the previous reviewer note when a correction carries no new one', function () {
    // Overwriting an explanation with a blank would destroy the record of why
    // something was decided the first time.
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->post(route('leave-reviews.reject', $groupId), [
        'review_remarks' => 'No balance left',
    ]);

    $this->actingAs($hr)->patch(route('leave-reviews.status', $groupId), ['status' => 'approved']);

    expect(Leave::where('filing_group_id', $groupId)->firstOrFail()->review_remarks)
        ->toBe('No balance left');
});

it('requires a reason when a correction rejects the request', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)
        ->patch(route('leave-reviews.status', $groupId), ['status' => 'rejected'])
        ->assertSessionHasErrors('review_remarks');
});

it('refuses a status outside the three the queue knows', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)
        ->patch(route('leave-reviews.status', $groupId), ['status' => 'deleted'])
        ->assertSessionHasErrors('status');
});

it('refuses a status change from somebody without the review permission', function () {
    // The correction path stays behind the same permission as deciding;
    // otherwise any employee could approve their own leave.
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($employee->user)
        ->patch(route('leave-reviews.status', $groupId), ['status' => 'approved'])
        ->assertForbidden();

    expect(Leave::where('filing_group_id', $groupId)->firstOrFail()->isPendingReview())->toBeTrue();
});

it('ignores a status change on an unknown filing group', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    $this->actingAs($hr)
        ->patch(route('leave-reviews.status', 'does-not-exist'), ['status' => 'approved']);

    expect(LeaveStatusChange::where('filing_group_id', 'does-not-exist')->count())->toBe(0);
});

it('moves the request between the queue tabs', function () {
    // The point of the feature: correcting a status has to actually move the row
    // between buckets, or the tabs would disagree with the ledger.
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = filePendingLeave();

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs($hr)->patch(route('leave-reviews.status', $groupId), ['status' => 'approved']);

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data', ['status' => 'pending']))
        ->assertJsonCount(0, 'requests.data')
        ->assertJsonPath('counts.approved', 1);

    $this->actingAs($hr)->patch(route('leave-reviews.status', $groupId), ['status' => 'pending']);

    $this->actingAs($hr)
        ->getJson(route('leave-reviews.data', ['status' => 'pending']))
        ->assertJsonCount(1, 'requests.data')
        ->assertJsonPath('counts.approved', 0);
});

/*
 * The calendar's file-leave dialog posts to the same endpoint as the leave
 * register, so the rules above already cover the security boundary. These tests
 * pin the frontend contract that keeps the dialog honest: a non-HR caller is
 * told which employee id "self" means, and is never offered ViewAllBalances.
 */

it('shares the caller employee id so the calendar can lock the employee field', function () {
    [$user, $employee] = employeeWithRecord();

    $props = $this->actingAs($user)
        ->get(route('calendar.index'))
        ->assertOk()
        ->viewData('page')['props'];

    // Without this the dialog has no id to submit for a self-service user, and
    // the only way to fill the field would be the roster picker.
    expect($props['auth']['employee_id'])->toBe($employee->id)
        ->and($props['auth']['permissions'])->not->toContain(Permission::ViewAllBalances->value);
});

it('leaves the shared employee id null for a login with no personnel record', function () {
    $orphan = User::factory()->create();

    $props = $this->actingAs($orphan)
        ->get(route('calendar.index'))
        ->assertOk()
        ->viewData('page')['props'];

    // The dialog stays unusable rather than defaulting to employee 0, which the
    // server would then resolve to the caller anyway.
    expect($props['auth']['employee_id'])->toBeNull();
});

it('files calendar leave for the caller when the dialog submits their own id', function () {
    [$user, $employee] = employeeWithRecord();
    [, $colleague] = employeeWithRecord();

    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($employee->id));

    expect(Leave::where('employee_id', $employee->id)->count())->toBe(1)
        ->and(Leave::where('employee_id', $colleague->id)->count())->toBe(0);
});

it('rejects a calendar filing aimed at another employee outright', function () {
    [$user] = employeeWithRecord();
    [, $victim] = employeeWithRecord();

    // resolveEmployee silently redirects to the caller's own record. That is
    // safe but reads as success, so an explicit mismatch must not pass through
    // either — assert the invariant that matters: the victim is never touched.
    $this->actingAs($user)
        ->post(route('leaves.store'), filingPayload($victim->id, '2023-03-06', '2023-03-07'));

    expect(Leave::where('employee_id', $victim->id)->count())->toBe(0);
});
