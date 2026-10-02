<?php

use App\Enums\Role;
use App\Models\Employee;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('an hr user can visit the dashboard', function () {
    $user = userWithRole(Role::HrOfficer->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
});

test('a plain employee cannot see the workforce dashboard', function () {
    $user = User::factory()->create();

    // The dashboard aggregates every employee's filings, so it is HR-only.
    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('a plain employee lands on their own balance from the root url', function () {
    $user = User::factory()->create();
    Employee::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertRedirect(route('balance.mine'));
});

test('an hr user lands on the dashboard from the root url', function () {
    $user = userWithRole(Role::HrOfficer->value);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertRedirect(route('dashboard'));
});

test('a plain employee can open their own balance page', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create(['user_id' => $user->id]);

    renderPage();

    $this->actingAs($user)
        ->get(route('balance.mine'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Leave/UserBalance')
            ->where('user.id', $employee->id)
        );
});

test('a plain employee cannot open a colleague balance page', function () {
    $user = User::factory()->create();
    Employee::factory()->create(['user_id' => $user->id]);

    $colleague = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('leaves.show', $colleague))
        ->assertForbidden();
});

test('an account with no employee record is told so rather than shown a 500', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('balance.mine'))
        ->assertForbidden();
});

test('a plain employee cannot open the hr leave register or its data feed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('leaves.index'))->assertForbidden();
    $this->actingAs($user)->getJson(route('leaves.data'))->assertForbidden();
});

test('an hr user can open the leave register and its data feed', function () {
    $user = userWithRole(Role::HrOfficer->value);

    renderPage();

    $this->actingAs($user)->get(route('leaves.index'))->assertOk();
    $this->actingAs($user)->getJson(route('leaves.data'))->assertOk();
});
