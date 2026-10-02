<?php

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\Employee;
use App\Models\User;

it('renders the access screen with a populated catalogue and picker', function () {
    seedRolesAndPermissions();

    $admin = superAdmin();
    renderPage();

    $target = User::factory()->create(['name' => 'Pick Me']);
    Employee::factory()->create(['user_id' => $target->id]);
    $target->assignRole(Role::HrOfficer->value);

    $this->actingAs($admin)
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('User/RoleManager'));

    $catalogue = $this->actingAs($admin)->getJson(route('roles.data'))->json();
    $users = $this->actingAs($admin)->getJson(route('roles.users'))->json('users');

    expect($catalogue['roles'])->toHaveCount(2)
        ->and($catalogue['counts']['permissions'])->toBeGreaterThan(0)
        ->and(array_keys($catalogue['permissions']))->toContain('Leave review')
        ->and(collect($users)->pluck('id')->all())->toContain($target->id);

    $row = collect($users)->firstWhere('id', $target->id);

    expect($row['roles'])->toContain(Role::HrOfficer->value)
        // Confirms the UI can tell "granted directly" from "held via role".
        ->and($row['permissions'])->toBe([])
        ->and($row['effective'])->toContain(Permission::ReviewLeave->value);
});

it('surfaces a direct grant distinctly from a role grant in the picker payload', function () {
    seedRolesAndPermissions();

    $admin = superAdmin();
    $target = User::factory()->create();
    $target->assignRole(Role::HrOfficer->value);
    $target->givePermissionTo(Permission::ManagePassSlips->value);

    $row = collect($this->actingAs($admin)->getJson(route('roles.users'))->json('users'))
        ->firstWhere('id', $target->id);

    expect($row['permissions'])->toBe([Permission::ManagePassSlips->value])
        ->and($row['roles'])->toBe([Role::HrOfficer->value]);
});

it('gives an employee only their own balance after login', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create(['user_id' => $user->id]);

    renderPage();

    // The employee-facing journey end to end: land on root, follow it to the
    // balance page, and confirm the balance JSON feed answers for that employee.
    $this->actingAs($user)
        ->get(route('home'))
        ->assertRedirect(route('balance.mine'));

    $this->actingAs($user)
        ->get(route('balance.mine'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('user.id', $employee->id));

    $this->actingAs($user)
        ->getJson(route('leaves.balance', $employee))
        ->assertOk();
});

it('refuses the balance feed for a colleague', function () {
    $user = User::factory()->create();
    Employee::factory()->create(['user_id' => $user->id]);

    $colleague = Employee::factory()->create();

    $this->actingAs($user)
        ->getJson(route('leaves.balance', $colleague))
        ->assertForbidden();
});
