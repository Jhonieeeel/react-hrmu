<?php

use App\Actions\Leave\PendingReviewAction;
use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Support\Str;

function forceLeaveFiling(Employee $employee, ?bool $approved = null): Leave
{
    // Exactly what LeaveForm submits when "Force Leave" is chosen: the leave_type
    // stays 'force leave' but the tag is switched to 'vacation leave' to mark the
    // force-leave-to-vacation conversion the balance engine expects.
    $state = Leave::factory()->for($employee, 'employee')
        ->state([
            'leave_type' => 'force leave',
            'event_type' => 'deduction',
            'event_tag' => 'vacation leave',
            'filing_group_id' => (string) Str::uuid(),
            'balance' => -3,
            'starts_at' => '2026-10-20',
            'ends_at' => '2026-10-21',
            'status' => false,
            'reviewed_at' => null,
        ]);

    $approved ? $state = $state->approved() : null;

    return $state->create();
}

it('treats a force leave filing as awaiting approval', function () {
    $leave = forceLeaveFiling(Employee::factory()->create());

    // The employee submitted this, so it must go through the same decision as
    // any other leave filing rather than being approved on arrival.
    expect($leave->requiresApproval())->toBeTrue()
        ->and($leave->isPendingReview())->toBeTrue()
        ->and($leave->isApproved())->toBeFalse()
        ->and($leave->countsTowardsBalance())->toBeFalse();
});

it('shows a force leave filing in the review queue', function () {
    seedRolesAndPermissions();

    $employee = Employee::factory()->create();
    forceLeaveFiling($employee);

    $requests = app(PendingReviewAction::class)->requests();

    expect($requests)->toHaveCount(1)
        ->and($requests->first()['leave_type'])->toBe('force leave')
        ->and($requests->first()['employee_id'])->toBe($employee->id)
        ->and($requests->first()['filing_group_id'])->not->toBeNull();
});

it('counts a force leave filing in the queue pending tally', function () {
    seedRolesAndPermissions();

    forceLeaveFiling(Employee::factory()->create());

    expect(app(PendingReviewAction::class)->counts()['pending'])->toBe(1);
});

it('clears an approved force leave filing from the queue', function () {
    seedRolesAndPermissions();

    $employee = Employee::factory()->create();
    forceLeaveFiling($employee);

    $groupId = Leave::where('employee_id', $employee->id)->value('filing_group_id');

    $this->actingAs(superAdmin())
        ->post(route('leave-reviews.approve', $groupId));

    expect(app(PendingReviewAction::class)->requests())->toHaveCount(0);
});

it('leaves an already-approved force leave row out of the queue', function () {
    // A conversion recorded directly by HR arrives already approved. The row is
    // still one the workflow applies to, but with no decision outstanding it
    // must not sit in the queue and must count towards the balance.
    $leave = Leave::factory()->create([
        'leave_type' => 'force leave',
        'event_type' => 'deduction',
        'event_tag' => 'vacation leave',
        'status' => true,
        'reviewed_at' => null,
    ]);

    expect($leave->isApproved())->toBeTrue()
        ->and($leave->isPendingReview())->toBeFalse()
        ->and($leave->countsTowardsBalance())->toBeTrue()
        ->and(Leave::query()->pendingReview()->whereKey($leave->id)->exists())->toBeFalse();
});

it('still treats the other filing tags as requiring approval', function () {
    foreach (['leave', 'cto', 'offset'] as $tag) {
        $leave = new Leave([
            'event_type' => 'deduction',
            'event_tag' => $tag,
        ]);

        expect($leave->requiresApproval())->toBeTrue("tag {$tag} should need approval");
    }
});

it('keeps non-filing deductions approved from birth', function () {
    // Tardiness, undertime and absent are HR data entry.
    foreach (['tardiness', 'undertime', 'absent', 'accrual'] as $tag) {
        $leave = new Leave([
            'event_type' => $tag === 'accrual' ? 'accrual' : 'deduction',
            'event_tag' => $tag,
        ]);

        expect($leave->requiresApproval())->toBeFalse("tag {$tag} should not need approval");
    }
});
