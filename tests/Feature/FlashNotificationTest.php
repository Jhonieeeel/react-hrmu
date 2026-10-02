<?php

use App\Enums\Role;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Employee;
use App\Models\User;

/**
 * The flash payload as the frontend actually receives it, i.e. after the
 * Inertia middleware has shaped it.
 */
function flashProp(array $props): array
{
    return $props['flash'] ?? [];
}

function undertimePayload(Employee $employee, int $offset): array
{
    return [
        'employee_id' => $employee->id,
        'event_tag' => 'undertime',
        'event_type' => 'deduction',
        'leave_type' => 'vacation leave',
        'balance' => 0,
        'starts_at' => now()->addDays($offset)->toDateString().' 08:00:00',
        'ends_at' => now()->addDays($offset)->toDateString().' 09:00:00',
        'remarks' => 'batch',
        'status' => false,
    ];
}

it('delivers a usable flash after recording undertime', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $employee = Employee::factory()->create(['user_id' => $hr->id]);
    renderPage();

    $this->actingAs($hr)->post(
        route('undertime.store'),
        undertimePayload($employee, 1),
    )->assertRedirect();

    // UndertimeController flashes a bare string. Without normalisation the
    // frontend reads `.message` on that string, gets undefined, and shows
    // nothing — the "filed undertime but no message appeared" case.
    $flash = flashProp(
        $this->actingAs($hr)->get(route('balance.mine'))->viewData('page')['props']
    );

    expect($flash['success']['message'])->toBeString()
        ->and($flash['success']['message'])->not->toBe('')
        ->and($flash['success']['id'])->toBeString();
});

it('delivers a distinct flash id for every submission in a batch', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $employee = Employee::factory()->create(['user_id' => $hr->id]);
    renderPage();

    $ids = [];

    foreach (range(1, 3) as $offset) {
        $this->actingAs($hr)->post(
            route('undertime.store'),
            undertimePayload($employee, $offset),
        )->assertRedirect();

        // Reading it back off the page is what the browser sees, so this is
        // the id the notification layer would key on.
        $props = $this->actingAs($hr)
            ->get(route('balance.mine'))
            ->viewData('page')['props'];

        $ids[] = flashProp($props)['success']['id'] ?? null;
    }

    expect(array_filter($ids))->toHaveCount(3)
        ->and(array_unique($ids))->toHaveCount(3);
});

it('delivers a distinct flash id for every leave filing in a batch', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $employee = Employee::factory()->create(['user_id' => $hr->id]);
    renderPage();

    $ids = [];

    // Anchored to a Monday so none of the ranges can fall on a weekend, where
    // the range contains no working days and is legitimately rejected.
    $monday = now()->next('Monday')->startOfDay();

    foreach (range(0, 2) as $offset) {
        $start = $monday->copy()->addDays($offset * 2);

        $this->actingAs($hr)->post(route('leaves.store'), [
            'employee_id' => $employee->id,
            'leave_type' => 'vacation leave',
            'event_type' => 'deduction',
            'event_tag' => 'leave',
            'balance' => 0,
            'starts_at' => $start->toDateString(),
            'ends_at' => $start->copy()->addDay()->toDateString(),
        ])->assertRedirect();

        $props = $this->actingAs($hr)
            ->get(route('balance.mine'))
            ->viewData('page')['props'];

        $ids[] = flashProp($props)['success']['id'] ?? null;
    }

    expect(array_filter($ids))->toHaveCount(3)
        ->and(array_unique($ids))->toHaveCount(3);
});

it('clears the flash after one request so it is not replayed', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $employee = Employee::factory()->create(['user_id' => $hr->id]);
    renderPage();

    $this->actingAs($hr)->post(
        route('undertime.store'),
        undertimePayload($employee, 1),
    );

    $first = flashProp(
        $this->actingAs($hr)->get(route('balance.mine'))->viewData('page')['props']
    );

    $second = flashProp(
        $this->actingAs($hr)->get(route('balance.mine'))->viewData('page')['props']
    );

    expect($first['success'])->not->toBeNull()
        ->and($second['success'])->toBeNull();
});

it('reports a rejected leave on the error channel', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $employee = Employee::factory()->create(['user_id' => $hr->id]);
    renderPage();

    // A weekend-only range contains no working days, so nothing is filed. The
    // user pressed Submit; something has to say so.
    $this->actingAs($hr)->post(route('leaves.store'), [
        'employee_id' => $employee->id,
        'leave_type' => 'vacation leave',
        'event_type' => 'deduction',
        'event_tag' => 'leave',
        'balance' => 0,
        'starts_at' => now()->next('Saturday')->toDateString(),
        'ends_at' => now()->next('Sunday')->toDateString(),
    ]);

    $flash = flashProp(
        $this->actingAs($hr)->get(route('balance.mine'))->viewData('page')['props']
    );

    expect($flash['error']['message'])->toBeString()
        ->and($flash['error']['id'])->toBeString()
        ->and($flash['success'])->toBeNull();
});

it('normalises every controller flash shape', function () {
    $middleware = new class(app('request')) extends HandleInertiaRequests
    {
        public function check(mixed $value): ?array
        {
            return $this->normaliseFlash($value);
        }
    };

    // A bare string, as flashed by undertime, organisation, pass slips and the
    // calendar.
    expect($middleware->check('Saved'))->toHaveKeys(['message', 'id'])
        ->and($middleware->check('Saved')['message'])->toBe('Saved');

    // The array shape already in use elsewhere.
    expect($middleware->check(['message' => 'Saved', 'id' => 'abc']))
        ->toBe(['message' => 'Saved', 'id' => 'abc']);

    // Nothing to report.
    expect($middleware->check(null))->toBeNull()
        ->and($middleware->check(''))->toBeNull()
        ->and($middleware->check([]))->toBeNull();
});

it('exposes the exact prop path the notification bridge reads', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $employee = Employee::factory()->create(['user_id' => $hr->id]);
    renderPage();

    $this->actingAs($hr)->post(
        route('undertime.store'),
        undertimePayload($employee, 1),
    );

    $props = $this->actingAs($hr)
        ->get(route('balance.mine'))
        ->viewData('page')['props'];

    // FlashBridge walks page.props.flash.{success,error} and keys off `id`.
    // If that path or those keys change, notices stop appearing silently, so
    // it is asserted rather than left implicit.
    expect($props)->toHaveKey('flash')
        ->and($props['flash'])->toHaveKey('success')
        ->and($props['flash']['success'])->toHaveKeys(['message', 'id']);
});
