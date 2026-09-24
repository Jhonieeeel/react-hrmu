<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Section extends Model
{
    protected $fillable = [
        'division_id',
        'section_name',    // AFMS, CBTS, OS, RRMS, PDPS
        'section_code', //
    ];

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function employees(): HasManyThrough
    {
        return $this->hasManyThrough(Employee::class, Unit::class);
    }
}
