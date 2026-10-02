<?php

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;

it('gives a user with no role the baseline self-service permissions', function () {
    $user = employeeUser();

    expect($user->hasRole(Role::HrOfficer->value))->toBeFalse();

    expect($user->can(Permission::FileLeave->value))->toBeTrue()
        ->and($user->can(Permission::ViewOwnBalance->value))->toBeTrue()
        ->and($user->can(Permission::FileMonthlyReport->value))->toBeTrue();
});

it('does not give a user with no role any elevated permission', function () {
    $user = employeeUser();

    expect($user->can(Permission::ReviewLeave->value))->toBeFalse()
        ->and($user->can(Permission::ViewAllBalances->value))->toBeFalse()
        ->and($user->can(Permission::ViewAllEmployees->value))->toBeFalse()
        ->and($user->can(Permission::ManageAccruals->value))->toBeFalse()
        ->and($user->can(Permission::AssignRoles->value))->toBeFalse();
});

it('reports baseline permissions through effectivePermissions', function () {
    $user = employeeUser();

    $effective = $user->effectivePermissions();

    expect($effective)->toContain(Permission::FileLeave->value)
        ->not->toContain(Permission::ReviewLeave->value);
});

it('lets a super admin pass every permission check', function () {
    $admin = superAdmin();

    foreach (Permission::cases() as $permission) {
        expect($admin->can($permission->value))->toBeTrue(
            "super admin should hold {$permission->value}"
        );
    }
});

it('gives the hr role review and employee permissions but not role assignment', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    expect($hr->can(Permission::ReviewLeave->value))->toBeTrue()
        ->and($hr->can(Permission::ApproveLeave->value))->toBeTrue()
        ->and($hr->can(Permission::ViewAllEmployees->value))->toBeTrue()
        ->and($hr->can(Permission::ManageAccruals->value))->toBeTrue()
        // The one permission the HR role must never hold, or an HR account
        // could promote itself to super admin.
        ->and($hr->can(Permission::AssignRoles->value))->toBeFalse();
});

it('refuses employee administration to a plain employee', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->get(route('users.index'))
        ->assertForbidden();
});

it('refuses the leave review queue to a plain employee', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->get(route('leave-reviews.index'))
        ->assertForbidden();
});

it('refuses the balance export to a plain employee', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->get(route('leaves.export'))
        ->assertForbidden();
});

it('allows the review queue for the hr role', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);

    $this->actingAs($hr)
        ->get(route('leave-reviews.index'))
        ->assertOk();
});

it('allows employee administration for the hr role', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);

    $this->actingAs($hr)
        ->get(route('users.index'))
        ->assertOk();
});

it('refuses role assignment to the hr role', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    $target = User::factory()->create();

    $this->actingAs($hr)
        ->put(route('users.roles.update', $target), ['roles' => []])
        ->assertForbidden();
});

it('lets a super admin assign roles', function () {
    $admin = superAdmin();
    $target = User::factory()->create();

    $this->actingAs($admin)
        ->put(route('users.roles.update', $target), [
            'roles' => [Role::HrOfficer->value],
        ])
        ->assertRedirect();

    expect($target->fresh()->hasRole(Role::HrOfficer->value))->toBeTrue();
});

it('rejects an unknown role name', function () {
    $admin = superAdmin();
    $target = User::factory()->create();

    $this->actingAs($admin)
        ->put(route('users.roles.update', $target), ['roles' => ['wizard']])
        ->assertSessionHasErrors('roles.0');
});

it('refuses to demote the only super admin', function () {
    $admin = superAdmin();

    $this->actingAs($admin)
        ->put(route('users.roles.update', $admin), ['roles' => []])
        ->assertForbidden();
});

it('allows demoting a super admin when another one remains', function () {
    $first = superAdmin();
    $second = superAdmin();

    $this->actingAs($first)
        ->put(route('users.roles.update', $second), ['roles' => []])
        ->assertRedirect();

    expect($second->fresh()->hasRole(Role::SuperAdmin->value))->toBeFalse();
});

it('rejects a guest at every protected route', function () {
    $this->get(route('leaves.index'))->assertRedirect(route('login'));
    $this->get(route('leave-reviews.index'))->assertRedirect(route('login'));
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

it('recognises the only remaining super admin', function () {
    $admin = superAdmin();

    expect($admin->isOnlySuperAdmin())->toBeTrue();

    superAdmin();

    expect($admin->fresh()->isOnlySuperAdmin())->toBeFalse();
});
