<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PassSlip extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'destination',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedToUser(): BelongsTo {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
