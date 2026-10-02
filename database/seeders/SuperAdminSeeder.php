<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

/**
 * Creates the single super admin account.
 *
 * Uses updateOrCreate so re-seeding an existing database promotes (or repairs)
 * the account instead of failing on a duplicate email.
 */
class SuperAdminSeeder extends Seeder
{
    public const EMAIL = 'superadmin@ocd.com';

    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => self::EMAIL],
            [
                'name' => 'System Administrator',
                // Overridable so a real deployment can set this from the
                // environment instead of relying on the seed value.
                'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'employee_type' => 'old',
            ]
        );

        // A super admin still needs a personnel record to view balances.
        Employee::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['position' => 'Administrator']
        );

        $user->syncRoles([Role::SuperAdmin->value]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->command?->info(sprintf('Super admin ready: %s', self::EMAIL));
    }
}
