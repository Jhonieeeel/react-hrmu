<?php

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\Employee;
use App\Models\User;

function accessUser(): User
{
    // Seeds the spatie role/permission rows these tests assign against.
    seedRolesAndPermissions();

    $user = User::factory()->create(['name' => 'Access Target']);
    Employee::factory()->create(['user_id' => $user->id]);

    return $user;
}

it('lets a super admin open the access management page', function () {
    renderPage();

    $this->actingAs(superAdmin())
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('User/RoleManager'));
});

it('refuses the access management page to an hr officer', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    // The HR role deliberately lacks AssignRoles, so an HR account cannot
    // promote itself or a colleague to super admin.
    $this->actingAs($hr)
        ->get(route('roles.index'))
        ->assertForbidden();
});

it('refuses the access management page to a plain employee', function () {
    $this->actingAs(employeeUser())
        ->get(route('roles.index'))
        ->assertForbidden();
});

it('lists users with their current roles and direct permissions', function () {
    $target = accessUser();
    $target->assignRole(Role::HrOfficer->value);
    $target->givePermissionTo(Permission::ManagePassSlips->value);

    $response = $this->actingAs(superAdmin())
        ->getJson(route('roles.users'))
        ->assertOk();

    $row = collect($response->json('users'))->firstWhere('id', $target->id);

    expect($row)->not->toBeNull()
        ->and($row['name'])->toBe('Access Target')
        ->and($row['roles'])->toContain(Role::HrOfficer->value)
        ->and($row['permissions'])->toContain(Permission::ManagePassSlips->value)
        // The role confers review leave, so it must show as effective even
        // though it is not a direct grant.
        ->and($row['effective'])->toContain(Permission::ReviewLeave->value);
});

it('narrows the user picker by a search term', function () {
    $target = accessUser();

    $response = $this->actingAs(superAdmin())
        ->getJson(route('roles.users', ['search' => 'Access Target']))
        ->assertOk();

    expect(collect($response->json('users'))->pluck('id')->all())
        ->toContain($target->id);
});

it('omits the baseline permissions from the assignable catalogue', function () {
    $response = $this->actingAs(superAdmin())
        ->getJson(route('roles.data'))
        ->assertOk();

    $assignable = collect($response->json('permissions'))
        ->flatMap(fn (array $group) => $group)
        ->all();

    // Baseline permissions come from the Gate::before hook and cannot be
    // revoked, so offering them as checkboxes would be a lie.
    foreach (Permission::baseline() as $permission) {
        expect($assignable)->not->toContain($permission->value);
    }

    expect($assignable)->toContain(Permission::ReviewLeave->value)
        ->and($assignable)->toContain(Permission::AssignRoles->value);
});

it('groups the assignable permissions for display', function () {
    $response = $this->actingAs(superAdmin())
        ->getJson(route('roles.data'))
        ->assertOk();

    expect($response->json('permissions'))->toHaveKey('Leave review')
        ->toHaveKey('Employee administration')
        ->toHaveKey('Balances and accruals');
});

it('assigns a role through the update endpoint', function () {
    $target = accessUser();

    $this->actingAs(superAdmin())
        ->put(route('users.roles.update', $target), ['roles' => [Role::HrOfficer->value]])
        ->assertRedirect();

    expect($target->fresh()->hasRole(Role::HrOfficer->value))->toBeTrue()
        ->and($target->fresh()->can(Permission::ReviewLeave->value))->toBeTrue();
});

it('assigns a direct permission without touching roles', function () {
    $target = accessUser();

    $this->actingAs(superAdmin())
        ->put(route('users.roles.update', $target), [
            'roles' => [],
            'permissions' => [Permission::ManagePassSlips->value],
        ])
        ->assertRedirect();

    $target = $target->fresh();

    expect($target->hasRole(Role::HrOfficer->value))->toBeFalse()
        ->and($target->can(Permission::ManagePassSlips->value))->toBeTrue();
});

it('revokes a direct permission when it is removed', function () {
    $target = accessUser();
    $target->givePermissionTo(Permission::ManagePassSlips->value);

    $this->actingAs(superAdmin())
        ->put(route('users.roles.update', $target), [
            'roles' => [],
            'permissions' => [],
        ])
        ->assertRedirect();

    expect($target->fresh()->can(Permission::ManagePassSlips->value))->toBeFalse();
});

it('leaves direct permissions alone when the request omits the key', function () {
    $target = accessUser();
    $target->givePermissionTo(Permission::ManagePassSlips->value);

    $this->actingAs(superAdmin())
        ->put(route('users.roles.update', $target), ['roles' => [Role::HrOfficer->value]])
        ->assertRedirect();

    // A roles-only save must not be read as "grant no direct permissions".
    expect($target->fresh()->getDirectPermissions()->pluck('name')->all())
        ->toContain(Permission::ManagePassSlips->value);
});

it('refuses an unknown permission name', function () {
    $target = accessUser();

    $this->actingAs(superAdmin())
        ->put(route('users.roles.update', $target), [
            'roles' => [],
            'permissions' => ['delete the entire database'],
        ])
        ->assertSessionHasErrors('permissions.0');

    expect($target->fresh()->getDirectPermissions())->toBeEmpty();
});

it('refuses an unknown role name', function () {
    $target = accessUser();

    $this->actingAs(superAdmin())
        ->put(route('users.roles.update', $target), ['roles' => ['wizard']])
        ->assertSessionHasErrors('roles.0');

    expect($target->fresh()->hasRole('wizard'))->toBeFalse();
});

it('refuses role assignment to an hr officer', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $target = accessUser();

    $this->actingAs($hr)
        ->put(route('users.roles.update', $target), ['roles' => [Role::SuperAdmin->value]])
        ->assertForbidden();

    expect($target->fresh()->hasRole(Role::SuperAdmin->value))->toBeFalse();
});

it('refuses role assignment to a plain employee', function () {
    $target = accessUser();

    $this->actingAs(employeeUser())
        ->put(route('users.roles.update', $target), ['roles' => [Role::SuperAdmin->value]])
        ->assertForbidden();

    expect($target->fresh()->hasRole(Role::SuperAdmin->value))->toBeFalse();
});

it('still refuses to demote the last super admin', function () {
    $admin = superAdmin();
    $target = accessUser();

    $this->actingAs($admin)
        ->put(route('users.roles.update', $admin), ['roles' => []])
        ->assertForbidden();

    expect($admin->fresh()->hasRole(Role::SuperAdmin->value))->toBeTrue();

    // Once a second super admin exists the first can step down.
    $target->assignRole(Role::SuperAdmin->value);

    $this->actingAs($admin)
        ->put(route('users.roles.update', $admin), ['roles' => []])
        ->assertRedirect();

    expect($admin->fresh()->hasRole(Role::SuperAdmin->value))->toBeFalse();
});

it('refuses the access data endpoints to an hr officer', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    $this->actingAs($hr)->getJson(route('roles.users'))->assertForbidden();
    $this->actingAs($hr)->getJson(route('roles.data'))->assertForbidden();
});
