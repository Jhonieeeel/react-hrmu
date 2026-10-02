<?php

namespace App\Models;

use Database\Factories\SectionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * @property string|null $section_name
 *
 * @use HasFactory<SectionFactory>
 */
class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_id',
        'section_name',    // AFMS, CBTS, OS, RRMS, PDPS
        'section_code', //
    ];

    /**
     * @return BelongsTo<Division, $this>
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * @return HasMany<Unit, $this>
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    /**
     * @return HasManyThrough<Employee, $this>
     */
    public function employees(): HasManyThrough
    {
        return $this->hasManyThrough(Employee::class, Unit::class);
    }
}
