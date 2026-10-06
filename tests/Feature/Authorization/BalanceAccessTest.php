<?php

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\User;

function caller(): array
{
    seedRolesAndPermissions();

    $user = User::factory()->create();
    $employee = Employee::factory()->create(['user_id' => $user->id]);

    return [$user, $employee];
}

it('lets a plain employee open their own balance', function () {
    renderPage();

    [$user, $employee] = caller();

    $this->actingAs($user)
        ->get(route('leaves.show', $employee))
        ->assertOk();
});

it('lets a plain employee read their own balance feed', function () {
    [$user, $employee] = caller();

    $this->actingAs($user)
        ->getJson(route('leaves.balance', $employee))
        ->assertOk()
        ->assertJsonStructure(['balances', 'transactions', 'pending']);
});

it('lets the hr role open any employee balance', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = caller();

    $this->actingAs($hr)
        ->get(route('leaves.show', $employee))
        ->assertOk();
});

it('lets the hr role read the balance feed for anyone', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = caller();

    $this->actingAs($hr)
        ->getJson(route('leaves.balance', $employee))
        ->assertOk();
});

it('lets a super admin open any employee balance', function () {
    renderPage();

    $admin = superAdmin();
    [, $employee] = caller();

    $this->actingAs($admin)
        ->get(route('leaves.show', $employee))
        ->assertOk();
});

/*
 * The balance page is self-service reachable, so the frontend has to decide
 * whether to draw the accrual controls. These pin the permission that decision
 * is based on — if the server-side gate ever moves, this is the canary.
 */

it('does not advertise the accrual control to a plain employee', function () {
    [$user] = caller();

    $permissions = $this->actingAs($user)
        ->get(route('leaves.show', $user->employee()->id))
        ->assertOk()
        ->viewData('page')['props']['auth']['permissions'];

    // UserBalance gates AccrualButton/AccrualDialog on this.
    expect($permissions)->not->toContain(Permission::ManageAccruals->value);
});

it('advertises the accrual control to hr', function () {
    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = caller();

    $permissions = $this->actingAs($hr)
        ->get(route('leaves.show', $employee))
        ->assertOk()
        ->viewData('page')['props']['auth']['permissions'];

    expect($permissions)->toContain(Permission::ManageAccruals->value);
});

it('stops an employee reaching the employee directory json feed', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->getJson(route('users.data'))
        ->assertForbidden();
});

it('stops an employee creating another user', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->post(route('users.store'), [
            'name' => 'Intruder',
            'email' => 'intruder@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertForbidden();

    expect(User::where('email', 'intruder@example.com')->exists())->toBeFalse();
});

it('stops an employee adding an accrual to themselves', function () {
    [$user, $employee] = caller();

    $payload = [
        'employee_id' => $employee->id,
        'leave_type' => 'vacation leave',
        'event_type' => 'accrual',
        'event_tag' => 'accrual',
        'balance' => 99,
        'starts_at' => '2023-05-01',
        'ends_at' => '2023-05-31',
    ];

    $this->actingAs($user)
        ->post(route('leaves.accrual', $user->id), $payload)
        ->assertForbidden();
});

/*
 * The accrual button posts the *upcoming* month (AccrualButton derives it with
 * addMonth) and the controller redirects back to the balance page carrying that
 * month. UserBalance follows those filters to re-point its own filter state, so
 * the user does not re-pick the period they just accrued for. This pins the
 * server half of that contract.
 */
it('redirects to the balance page already advanced to the accrued month', function () {
    renderPage();

    $hr = userWithRole(Role::HrOfficer->value);
    [, $employee] = caller();

    $response = $this->actingAs($hr)->post(route('leaves.accrual', $employee->id), [
        'employee_id' => $employee->id,
        'leave_type' => 'vacation leave',
        'event_type' => 'accrual',
        'event_tag' => 'accrual',
        'balance' => 1.25,
        'starts_at' => '2026-11-01',
        'ends_at' => '2026-11-30',
    ]);

    $response->assertRedirect(route('leaves.show', [
        'employee' => $employee->id,
        'month' => 11,
        'year' => 2026,
    ]));

    // And that redirect really does hand the new period to the page as props.
    // Note these arrive as strings — they come off the query string — which is
    // why the page normalises with String() before comparing periods.
    $this->actingAs($hr)
        ->get(route('leaves.show', [
            'employee' => $employee->id,
            'month' => 11,
            'year' => 2026,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Leave/UserBalance')
            ->where('filters.month', '11')
            ->where('filters.year', '2026')
        );
});

it('stops an employee adding a balance adjustment to themselves', function () {
    [$user, $employee] = caller();

    $this->actingAs($user)
        ->post(route('users_balance.store'), [
            'employee_id' => $employee->id,
            'leave_type' => 'vacation leave',
            'event_type' => 'accrual',
            'event_tag' => 'accrual',
            'balance' => 50,
            'starts_at' => '2023-05-01',
            'ends_at' => '2023-05-31',
        ])
        ->assertForbidden();
});

it('stops an employee recording undertime against themselves', function () {
    [$user, $employee] = caller();

    $this->actingAs($user)
        ->post(route('undertime.store'), [
            'employee_id' => $employee->id,
            'leave_type' => 'vacation leave',
            'event_type' => 'deduction',
            'event_tag' => 'undertime',
            'balance' => -1,
            'starts_at' => '2023-05-02 08:00',
            'ends_at' => '2023-05-02 09:00',
        ])
        ->assertForbidden();
});

it('stops an employee creating holidays', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->post(route('holidays.store'), [
            'holiday_name' => 'Independence Day',
            'month' => 6,
            'day' => 12,
        ])
        ->assertForbidden();
});

it('lets the hr role create holidays', function () {
    $hr = userWithRole(Role::HrOfficer->value);

    $this->actingAs($hr)
        ->post(route('holidays.store'), [
            'holiday_name' => 'Independence Day',
            'month' => 6,
            'day' => 12,
        ])
        ->assertRedirect();

    expect(Holiday::where('holiday_name', 'Independence Day')->exists())->toBeTrue();
});

it('stops an employee restructuring the organisation', function () {
    $user = employeeUser();

    $this->actingAs($user)
        ->post(route('divisions.store'), [
            'division_name' => 'Shadow Division',
            'division_code' => 'SHD',
        ])
        ->assertForbidden();
});

it('stops an employee deleting someone else\'s calendar entry', function () {
    $user = employeeUser();

    $leave = Leave::factory()
        ->for(Employee::factory(), 'employee')
        ->accrual('vacation leave', 5)
        ->create();

    $this->actingAs($user)
        ->delete(route('calendar.destroy', $leave))
        ->assertForbidden();

    expect(Leave::whereKey($leave->id)->exists())->toBeTrue();
});

it('stops an employee updating their own employee record', function () {
    [$user, $employee] = caller();

    $this->actingAs($user)
        ->post(route('users.update', $user), [
            'name' => 'Changed Name',
            'email' => $user->email,
            'employee_type' => 'old',
            'position' => 'CEO',
        ])
        ->assertForbidden();
});

it('shares the effective permission list with the frontend', function () {
    renderPage();

    // Any page works as a carrier for the shared props; the balance page is the
    // one every authenticated user reaches.
    $user = employeeUser();

    $response = $this->actingAs($user)
        ->get(route('balance.mine'))
        ->assertOk();

    $permissions = $response->viewData('page')['props']['auth']['permissions'] ?? [];

    expect($permissions)->toContain(Permission::ViewOwnBalance->value)
        ->not->toContain(Permission::AssignRoles->value);
});

it('reports no baseline elevated permissions for a plain employee', function () {
    $user = employeeUser();

    $elevated = [
        Permission::ReviewLeave,
        Permission::ViewAllBalances,
        Permission::ManageAccruals,
        Permission::RecordAdjustments,
        Permission::ViewAllEmployees,
        Permission::AssignRoles,
    ];

    foreach ($elevated as $permission) {
        expect($user->can($permission->value))->toBeFalse(
            "plain employee should not hold {$permission->value}"
        );
    }
});
