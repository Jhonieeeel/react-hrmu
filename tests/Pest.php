<?php

use App\Enums\Role;
use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * Renders Inertia responses without needing a built Vite manifest.
 *
 * Called explicitly by the tests that assert a full page renders, so the rest of
 * the suite stays unaffected.
 */
function renderPage(): void
{
    test()->withoutVite();
}

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/*
|--------------------------------------------------------------------------
| Authorization helpers
|--------------------------------------------------------------------------
|
| Role and permission tests need real spatie rows to exist, because the gate
| resolves permissions from the database rather than from anything on the model.
| These helpers seed only the minimum, and reuse it across a test run.
|
*/

function seedRolesAndPermissions(): void
{
    if (app(PermissionRegistrar::class)
        ->getPermissions()
        ->isNotEmpty()) {
        return;
    }

    test()->seed(RolePermissionSeeder::class);
}

/**
 * A plain employee: no roles at all, only the implicit baseline permissions.
 */
function employeeUser(): User
{
    seedRolesAndPermissions();

    $user = User::factory()->create();

    $employee = Employee::factory()->create(['user_id' => $user->id]);

    $user->setRelation('employees', collect([$employee]));

    return $user;
}

/**
 * A user holding the given role name.
 */
function userWithRole(string $role, ?Employee $employee = null): User
{
    seedRolesAndPermissions();

    $user = User::factory()->create();

    if ($employee) {
        $employee->update(['user_id' => $user->id]);
        $user->setRelation('employees', collect([$employee]));
    }

    $user->assignRole($role);

    return $user;
}

function superAdmin(): User
{
    return userWithRole(Role::SuperAdmin->value);
}
