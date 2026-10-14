<?php

use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Support\Str;

/**
 * The rule under test: the calendar is not filtered by decision, so every event
 * it renders has to say what its decision is — otherwise an undecided filing is
 * indistinguishable from an approved one, and there is nothing on the event for
 * the dialog to offer a decision on.
 */
it('labels every calendar event with its approval state and filing group', function () {
    $employee = Employee::factory()->create();
    $group = (string) Str::uuid();

    $pending = Leave::factory()->filed('vacation leave', 1, now()->addDay()->toDateString(), groupId: $group)
        ->for($employee)
        ->create();

    $approved = Leave::factory()->filed('cto', 1, now()->addDays(2)->toDateString())
        ->approved()
        ->for($employee)
        ->create();

    $rejected = Leave::factory()->filed('offset', 1, now()->addDays(3)->toDateString())
        ->rejected(null, 'No cover available.')
        ->for($employee)
        ->create();

    $events = $this->actingAs($employee->user)
        ->getJson(route('calendar.data'))
        ->assertOk()
        ->json();

    $byId = collect($events)->keyBy(fn ($event) => $event['id']);

    expect($byId->get((string) $pending->id)['approval_state'])->toBe('pending')
        ->and($byId->get((string) $pending->id)['filing_group_id'])->toBe($group)
        ->and($byId->get((string) $approved->id)['approval_state'])->toBe('approved')
        // A rejected filing and an undecided one both store `status = false`;
        // only the derived state can tell them apart.
        ->and($byId->get((string) $rejected->id)['approval_state'])->toBe('rejected');
});
