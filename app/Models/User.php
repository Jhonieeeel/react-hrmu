<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Permission;
use App\Models\Concerns\TracksSuperAdmins;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @use HasFactory<UserFactory>
 */
#[Fillable(['name', 'email', 'password', 'employee_type'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, TracksSuperAdmins;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function passSlips(): HasMany
    {
        return $this->hasMany(PassSlip::class);
    }

    public function leaves(): HasManyThrough
    {
        return $this->hasManyThrough(Leave::class, Employee::class);
    }

    /**
     * @return HasMany<Employee, $this>
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * The single personnel record linked to this login. Used by the ownership
     * policies to resolve "is this the caller's own record?".
     */
    public function employee(): ?Employee
    {
        return $this->employees()->first();
    }

    /**
     * Every permission name the user effectively holds: the baseline set granted
     * implicitly to all authenticated users, plus anything their roles confer.
     *
     * This is the single source of truth for the permission list handed to the
     * frontend, so the UI and the server can never disagree about what a user
     * may click.
     *
     * @return list<string>
     */
    public function effectivePermissions(): array
    {
        $baseline = Permission::baseline();

        // Restrict to permissions that actually exist in the database. This keeps
        // the method safe to call on a database that has not been seeded yet —
        // Spatie's hasPermissionTo() throws on an unknown name, and this runs on
        // every Inertia request.
        $granted = app(PermissionRegistrar::class)
            ->getPermissions()
            ->pluck('name')
            ->intersect(Permission::values())
            ->filter(fn (string $name) => $this->hasPermissionTo($name));

        return $granted
            ->merge(array_column($baseline, 'value'))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    public function roleNames(): array
    {
        return $this->getRoleNames()->values()->all();
    }
}
