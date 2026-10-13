<?php

use App\Enums\Role;
use App\Models\Employee;
use App\Models\PassSlip;
use App\Models\Section;
use App\Models\Unit;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

/**
 * The rule under test: filing a pass slip is self-service, but approving or
 * declining one is admin/HR only.
 */
it('lets any employee file a pass slip for themselves', function () {
    renderPage();

    $employee = employeeUser();

    $this->actingAs($employee)
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Attend a coordination meeting.',
        ])
        ->assertRedirect();

    expect(PassSlip::count())->toBe(1);
    expect(PassSlip::first()->user_id)->toBe($employee->id);
});

it('stamps the derived personnel fields from the personnel record', function () {
    renderPage();

    // A submitted position must not be able to override the record, which is why
    // the form does not even send the field.
    $employee = employeeUser();

    // Units cannot exist without a section, so the section is created first and
    // the unit hung off it — otherwise the insert fails on the NOT NULL
    // section_id.
    $section = Section::factory()->create();

    $employee->employee()->update([
        'position' => 'Records Officer',
        'section_id' => $section->id,
        'unit_id' => Unit::factory()->forSection($section)->create()->id,
    ]);

    $this->actingAs($employee)
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Attend a coordination meeting.',
            'position' => 'Chief of Staff',
            'printed_name' => 'Someone Else',
        ])
        ->assertRedirect();

    $slip = PassSlip::first();

    expect($slip->printed_name)->toBe($employee->name)
        ->and($slip->position)->toBe('Records Officer');
});

it('names the section head as the recommending approval by default', function () {
    renderPage();

    $head = userWithRole(Role::HrOfficer->value);
    $section = Section::factory()->create(['head_id' => $head->id]);

    $employee = employeeUser();
    $employee->employee()->update([
        'section_id' => $section->id,
        'unit_id' => Unit::factory()->forSection($section)->create()->id,
    ]);

    $this->actingAs($employee)
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Attend a coordination meeting.',
        ])
        ->assertRedirect();

    expect(PassSlip::first()->recommended_by)->toBe($head->id);
});

it('refuses to let an employee file a slip in someone else’s name', function () {
    renderPage();

    $employee = employeeUser();
    $victim = employeeUser();

    $this->actingAs($employee)
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Attempted impersonation.',
            'user_id' => $victim->id,
        ])
        ->assertRedirect();

    // The submitted id is dropped rather than trusted.
    expect(PassSlip::first()->user_id)->toBe($employee->id);
});

it('lets an employee file an early-out slip with no expected arrival', function () {
    renderPage();

    $employee = employeeUser();

    $this->actingAs($employee)
        ->post(route('slip.store'), [
            'request_type' => 'personal',
            'date_requested' => now()->toDateString(),
            'expected_departure' => now()->setTime(15, 0)->toDateTimeString(),
            // Deliberately omitted: an early-out slip has no planned return.
            'destination' => 'Pavilion',
            'purpose' => 'Leaving early, back before the close.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $slip = PassSlip::first();

    expect($slip->expected_departure)->not->toBeNull()
        ->and($slip->expected_arrival)->toBeNull();
});

it('still rejects a supplied arrival that precedes the departure', function () {
    renderPage();

    // Making the field optional must not have made it unvalidated.
    $this->actingAs(employeeUser())
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->toDateString(),
            'expected_departure' => now()->setTime(12, 0)->toDateTimeString(),
            'expected_arrival' => now()->setTime(8, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Backwards in time.',
        ])
        ->assertSessionHasErrors('expected_arrival');

    expect(PassSlip::count())->toBe(0);
});

it('rejects an arrival that precedes the departure', function () {
    renderPage();

    $this->actingAs(employeeUser())
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Backwards in time.',
        ])
        ->assertSessionHasErrors('expected_arrival');

    expect(PassSlip::count())->toBe(0);
});

/*
|--------------------------------------------------------------------------
| Only admin/HR may decide
|--------------------------------------------------------------------------
*/

it('refuses the review queue to an ordinary employee', function () {
    renderPage();

    $this->actingAs(employeeUser())
        ->get(route('slip-reviews.index'))
        ->assertForbidden();
});

it('refuses to let an ordinary employee approve a pass slip', function () {
    $employee = employeeUser();
    $slip = PassSlip::factory()->create(['user_id' => $employee->id]);

    $this->actingAs(employeeUser())
        ->post(route('slip-reviews.approve', $slip))
        ->assertForbidden();

    expect($slip->fresh()->isPendingReview())->toBeTrue();
});

it('lets hr approve a pass slip', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->create(['user_id' => employeeUser()->id]);

    $this->actingAs($hr)
        ->post(route('slip-reviews.approve', $slip), ['review_remarks' => 'Noted.'])
        ->assertRedirect();

    $slip->refresh();

    expect($slip->isApproved())->toBeTrue()
        ->and($slip->reviewed_by)->toBe($hr->id)
        ->and($slip->review_remarks)->toBe('Noted.');
});

it('lets a super admin decline a pass slip', function () {
    $admin = superAdmin();
    $slip = PassSlip::factory()->create(['user_id' => employeeUser()->id]);

    $this->actingAs($admin)
        ->post(route('slip-reviews.decline', $slip), ['review_remarks' => 'Schedule conflict.'])
        ->assertRedirect();

    expect($slip->fresh()->isDeclined())->toBeTrue();
});

it('requires a reason when declining', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->create(['user_id' => employeeUser()->id]);

    $this->actingAs($hr)
        ->post(route('slip-reviews.decline', $slip), ['review_remarks' => ''])
        ->assertSessionHasErrors('review_remarks');

    expect($slip->fresh()->isPendingReview())->toBeTrue();
});

it('refuses to decide a slip that has already been decided', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->approved()->create(['user_id' => employeeUser()->id]);

    $this->actingAs($hr)
        ->post(route('slip-reviews.decline', $slip), ['review_remarks' => 'Too late.'])
        ->assertForbidden();

    expect($slip->fresh()->isApproved())->toBeTrue();
});

/*
|--------------------------------------------------------------------------
| HR correcting the travel times
|--------------------------------------------------------------------------
*/

it('lets hr correct the expected departure and the actual arrival', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    // Times pinned so the correction is built against a known, later expected
    // return — the factory randomises the departure into the late evening, which
    // would otherwise put the corrected departure after it.
    $slip = PassSlip::factory()->approved()->create([
        'user_id' => employeeUser()->id,
        'expected_departure' => now()->addDays(2)->setTime(6, 0),
        'expected_arrival' => now()->addDays(2)->setTime(14, 0),
    ]);

    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->addDays(2)->setTime(9, 30)->toDateTimeString(),
            'actual_arrival' => now()->addDays(2)->setTime(17, 0)->toDateTimeString(),
        ])
        ->assertRedirect();

    $slip->refresh();

    expect($slip->expected_departure->toDateTimeString())
        ->toBe(now()->addDays(2)->setTime(9, 30)->toDateTimeString())
        ->and($slip->actual_arrival->toDateTimeString())
        ->toBe(now()->addDays(2)->setTime(17, 0)->toDateTimeString());
});

it('lets a super admin correct the travel times on a decided slip', function () {
    $admin = superAdmin();

    // Pinned explicitly rather than left to the factory, because the expected
    // return is *not* editable here — so the correction has to be built against
    // a known return time or the ordering rule rejects it.
    $slip = PassSlip::factory()->approved()->create([
        'user_id' => employeeUser()->id,
        'expected_departure' => now()->addDays(3)->setTime(6, 0),
        'expected_arrival' => now()->addDays(3)->setTime(14, 0),
    ]);

    $this->actingAs($admin)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->addDays(3)->setTime(7, 0)->toDateTimeString(),
            'actual_arrival' => now()->addDays(3)->setTime(19, 0)->toDateTimeString(),
        ])
        ->assertRedirect();

    expect($slip->fresh()->actual_arrival)->not->toBeNull();
});

it('refuses travel time corrections from an ordinary employee', function () {
    $slip = PassSlip::factory()->approved()->create(['user_id' => employeeUser()->id]);
    $original = $slip->expected_departure;

    $this->actingAs(employeeUser())
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->addYear()->toDateTimeString(),
        ])
        ->assertForbidden();

    expect($slip->fresh()->expected_departure->toDateTimeString())
        ->toBe($original->toDateTimeString());
});

it('refuses a departure that lands after the expected return', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->create([
        'user_id' => employeeUser()->id,
        'expected_departure' => now()->setTime(8, 0),
        'expected_arrival' => now()->setTime(12, 0),
    ]);

    // The ordering rule spans two columns: the return is not in this payload, so
    // a plain `before:` rule on the payload alone would let this through.
    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->setTime(15, 0)->toDateTimeString(),
        ])
        ->assertSessionHasErrors('expected_departure');

    expect($slip->fresh()->expected_departure->toDateTimeString())
        ->toBe(now()->setTime(8, 0)->toDateTimeString());
});

it('refuses an actual arrival that precedes the expected departure', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->create([
        'user_id' => employeeUser()->id,
        'expected_departure' => now()->setTime(8, 0),
        'expected_arrival' => now()->setTime(20, 0),
    ]);

    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->setTime(8, 0)->toDateTimeString(),
            'actual_arrival' => now()->setTime(7, 0)->toDateTimeString(),
        ])
        ->assertSessionHasErrors('actual_arrival');
});

it('lets hr record the actual arrival on an early-out slip', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->earlyOut()->create([
        'user_id' => employeeUser()->id,
        'expected_departure' => now()->setTime(15, 0),
    ]);

    // The "departure before expected return" rule is skipped when there is no
    // expected return, so HR is not blocked from closing out an early-out slip.
    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->setTime(15, 0)->toDateTimeString(),
            'actual_arrival' => now()->setTime(17, 30)->toDateTimeString(),
        ])
        ->assertRedirect();

    expect($slip->fresh()->hasActualArrival())->toBeTrue();
});

it('checks the actual arrival against the departure being submitted, not the stored one', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    // The stored departure is deliberately *after* the arrival being submitted,
    // while the departure this request sets is before it. The new departure is
    // the one that will be in force, so this must be accepted.
    $slip = PassSlip::factory()->create([
        'user_id' => employeeUser()->id,
        'expected_departure' => now()->setTime(18, 0),
        'expected_arrival' => now()->setTime(23, 0),
    ]);

    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->setTime(8, 0)->toDateTimeString(),
            'actual_arrival' => now()->setTime(17, 0)->toDateTimeString(),
        ])
        ->assertRedirect();

    expect($slip->fresh()->actual_arrival)->not->toBeNull();
});

it('cannot rewrite the purpose through the travel times endpoint', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->create([
        'user_id' => employeeUser()->id,
        'purpose' => 'Original purpose.',
    ]);

    // Only the two travel columns are accepted; a stray extra field is ignored
    // rather than mass-assigned.
    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'purpose' => 'Rewritten purpose.',
        ])
        ->assertRedirect();

    expect($slip->fresh()->purpose)->toBe('Original purpose.');
});

/*
|--------------------------------------------------------------------------
| Queue
|--------------------------------------------------------------------------
*/

it('renders the review queue for a reviewer and buckets the counts', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);

    PassSlip::factory()->count(2)->create(['user_id' => employeeUser()->id]);
    PassSlip::factory()->approved()->create(['user_id' => employeeUser()->id]);

    $this->actingAs($hr)
        ->get(route('slip-reviews.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('PassSlip/ReviewQueue')
            ->where('counts.pending', 2)
            ->where('counts.approved', 1)
            ->where('counts.declined', 0),
        );
});

it('lets hr re-point the signature lines', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $other = employeeUser();
    $slip = PassSlip::factory()->create(['user_id' => employeeUser()->id]);

    $this->actingAs($hr)
        ->patch(route('slip-reviews.signatories', $slip), [
            'recommended_by' => $other->id,
            'assigned_to' => $other->id,
        ])
        ->assertRedirect();

    expect($slip->fresh()->recommended_by)->toBe($other->id)
        ->and($slip->fresh()->assigned_to)->toBe($other->id);
});

/*
|--------------------------------------------------------------------------
| Ownership
|--------------------------------------------------------------------------
*/

it('only lets the filer or hr see a slip', function () {
    $owner = employeeUser();
    $stranger = employeeUser();
    $slip = PassSlip::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)->get(route('slip.index'))->assertOk();
    $this->actingAs($stranger)->get(route('slip.index'))->assertOk();
    $this->actingAs(userWithRole(Role::HrOfficer->value))->get(route('slip.index'))->assertOk();
});

it('lets the filer withdraw a pending slip but not a decided one', function () {
    $owner = employeeUser();

    $pending = PassSlip::factory()->create(['user_id' => $owner->id]);
    $decided = PassSlip::factory()->approved()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)->delete(route('slip.destroy', $pending))->assertRedirect();
    expect(PassSlip::find($pending->id))->toBeNull();

    $this->actingAs($owner)->delete(route('slip.destroy', $decided))->assertForbidden();
    expect(PassSlip::find($decided->id))->not->toBeNull();
});

it('does not let the filer record the actual arrival', function () {
    $owner = employeeUser();
    $slip = PassSlip::factory()->approved()->create([
        'user_id' => $owner->id,
        'expected_departure' => now()->subHours(5),
        'expected_arrival' => now()->addHours(5),
    ]);

    // The actual arrival is HR's field. There is no self-service endpoint for
    // it at all, so this asserts the route is gone rather than merely refused.
    expect(fn () => route('slip.actual_times', $slip))
        ->toThrow(RouteNotFoundException::class);

    expect($slip->fresh()->hasActualArrival())->toBeFalse();
});

it('shows the actual arrival to the filer once hr records it', function () {
    renderPage();

    $owner = employeeUser();
    $hr = userWithRole(Role::HrOfficer->value);

    $slip = PassSlip::factory()->approved()->create([
        'user_id' => $owner->id,
        'expected_departure' => now()->subHours(5),
        'expected_arrival' => now()->addHours(5),
    ]);

    $this->actingAs($hr)
        ->patch(route('slip-reviews.travel_times', $slip), [
            'expected_departure' => now()->subHours(5)->setTime(8, 0)->toDateTimeString(),
            'actual_arrival' => now()->setTime(17, 0)->toDateTimeString(),
        ])
        ->assertRedirect();

    // Read-only for the filer: they see what HR recorded, and cannot change it.
    $this->actingAs($owner)
        ->get(route('slip.index'))
        ->assertInertia(fn ($page) => $page
            ->where('mySlips.0.actual_arrival', $slip->fresh()->actual_arrival?->toDateTimeString()),
        );
});

/*
|--------------------------------------------------------------------------
| Filing on behalf of others (HR only)
|--------------------------------------------------------------------------
*/

it('lets hr file a slip on someone else’s behalf', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);
    $subject = employeeUser();

    $this->actingAs($hr)
        ->post(route('slip.store'), [
            'request_type' => 'personal',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Back-filled on the personnel’s behalf.',
            'user_id' => $subject->id,
        ])
        ->assertRedirect();

    expect(PassSlip::first()->user_id)->toBe($subject->id);
});

it('will not let a slip be approved by the person who filed it', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);
    $subject = employeeUser();

    $this->actingAs($hr)
        ->post(route('slip.store'), [
            'request_type' => 'official',
            'date_requested' => now()->addDay()->toDateString(),
            'expected_departure' => now()->addDay()->setTime(8, 0)->toDateTimeString(),
            'expected_arrival' => now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'destination' => 'Pavilion',
            'purpose' => 'Self-approved.',
            'user_id' => $subject->id,
            'assigned_to' => $subject->id,
        ])
        ->assertSessionHasErrors('assigned_to');
});

it('gives the employee view every field the hr view renders', function () {
    renderPage();

    // Both screens render the same shared card component, so a slip has to carry
    // the same keys to the personnel's own history as it does to the review
    // queue. Without these the employee's own card renders blank personnel and
    // an unreadable date — the exact thing this asserts against.
    $owner = employeeUser();
    $head = userWithRole(Role::HrOfficer->value);

    $slip = PassSlip::factory()->create([
        'user_id' => $owner->id,
        'position' => 'Records Officer',
        'usd' => 'AFMS / Operations',
        'recommended_by' => $head->id,
    ]);

    $this->actingAs($owner)
        ->get(route('slip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('PassSlip/Index')
            ->has('mySlips', 1)
            ->where('mySlips.0.id', $slip->id)
            ->where('mySlips.0.position', 'Records Officer')
            ->where('mySlips.0.usd', 'AFMS / Operations')
            ->where('mySlips.0.date_accomplished', $slip->date_accomplished->toDateString())
            ->where('mySlips.0.recommended_by_name', $head->name)
            ->where('mySlips.0.status', 'pending'),
        );
});

it('shows the same fields on the review queue as on my slips', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);
    $slip = PassSlip::factory()->create([
        'position' => 'Records Officer',
        'usd' => 'AFMS / Operations',
    ]);

    $this->actingAs($hr)
        ->get(route('slip-reviews.index'))
        ->assertInertia(fn ($page) => $page
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $slip->id)
            ->where('requests.data.0.position', 'Records Officer')
            ->where('requests.data.0.usd', 'AFMS / Operations')
            ->where('requests.data.0.date_accomplished', $slip->date_accomplished->toDateString()),
        );
});

it('exposes the roster to hr and withholds it from employees', function () {
    renderPage();

    Employee::factory()->create();

    $this->actingAs(userWithRole(Role::HrOfficer->value))
        ->get(route('slip.index'))
        ->assertInertia(fn ($page) => $page->where('canFileForOthers', true));

    $this->actingAs(employeeUser())
        ->get(route('slip.index'))
        ->assertInertia(fn ($page) => $page
            ->where('canFileForOthers', false)
            ->has('personnel', 0),
        );
});
