<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One entry in the trail of status changes to a leave filing.
 *
 * Written by ChangeLeaveStatusAction every time somebody moves a request to a
 * different approval state — including the corrections HR makes after the fact.
 * The `leaves` row itself only holds the *current* decision, so without this the
 * paper record and the screen would disagree with no way to tell which is right.
 */
class LeaveStatusChange extends Model
{
    /**
     * The table carries no `updated_at`.
     *
     * An audit row that can be rewritten is not an audit row, so the column is
     * not there to be written to. Eloquent needs to be told that explicitly or
     * every insert fails on an unknown column.
     */
    public const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'filing_group_id',
        'leave_id',
        'from_status',
        'to_status',
        'user_id',
        'remarks',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Leave, $this>
     */
    public function leave(): BelongsTo
    {
        return $this->belongsTo(Leave::class);
    }
}
