<?php

namespace App\Providers;

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\PermissionRegistrar;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();

        if (app()->environment('local') && request()->header('x-forwarded-proto') === 'https') {
            URL::forceScheme('https');
        }
    }

    /**
     * Two rules sit in front of every policy check:
     *
     * 1. A super admin is allowed everything, so a policy never has to remember
     *    to add an escape hatch.
     * 2. Every authenticated user holds the baseline permissions. This is what
     *    lets an ordinary employee file leave and read their own balance without
     *    being assigned a role. Returning `true` only for the baseline abilities
     *    keeps the policies — which are what enforce record ownership — in charge
     *    of everything else.
     */
    protected function configureAuthorization(): void
    {
        Gate::before(function (User $user, string $ability): ?bool {
            // Baseline first: it is a pure in-memory decision, so it works even
            // before the database has been seeded.
            $permission = Permission::tryFrom($ability);

            if ($permission !== null && in_array($permission, Permission::baseline(), true)) {
                return true;
            }

            // Until the database is seeded there are no roles, and hasRole()
            // throws on an unknown name. Returning null lets the normal
            // policy chain run instead of 500-ing on a fresh install.
            if (app(PermissionRegistrar::class)->getPermissions()->isEmpty()) {
                return null;
            }

            if ($user->hasRole(Role::SuperAdmin)) {
                return true;
            }

            // Returning null lets the normal policy/Gate chain run.
            return null;
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
