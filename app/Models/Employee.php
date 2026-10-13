<?php

namespace App\Models;

use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string|null $position
 *
 * @use HasFactory<EmployeeFactory>
 */
class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'position',
        'division_id',
        'section_id',
        'unit_id',
    ];

    /**
     * @return HasMany<Leave, $this>
     */
    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }

    /**
     * @return HasMany<PassSlip, $this>
     */
    public function passSlips(): HasMany
    {
        return $this->hasMany(PassSlip::class, 'user_id', 'user_id');
    }

    /**
     * The immediate supervisor for this employee.
     *
     * The business defines the supervisor as whoever heads the section this
     * employee's unit belongs to, so it is derived rather than stored — an
     * employee who is promoted into a new section automatically picks up the new
     * head without anyone having to reassign them.
     */
    public function supervisor(): ?User
    {
        return $this->section?->head;
    }

    /**
     * The "Unit / Section / Division" line printed on a pass slip.
     *
     * Built from the employee's designation rather than typed by hand, so the
     * form cannot drift from the org chart.
     */
    public function unitSectionDivisionLabel(): string
    {
        return collect([
            $this->unit?->unit_name,
            $this->section?->section_name,
            $this->division?->division_name,
        ])->filter()->implode(' / ');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Division, $this>
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * @return BelongsTo<Section, $this>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
