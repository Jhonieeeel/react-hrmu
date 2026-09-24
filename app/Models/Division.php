<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_name',
        'division_code',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
