<?php

namespace App\Models;

use Database\Factories\PassSlipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A personnel's pass slip — the paper form that lets someone leave the office.
 *
 * Mirrors App\Models\Leave's workflow conventions deliberately: `status` is a
 * plain boolean and the decision state is *derived* from it plus `reviewed_at`,
 * rather than being stored as a third enum value.
 *
 * @property string $request_type
 *
 * @use HasFactory<PassSlipFactory>
 */
class PassSlip extends Model
{
    use HasFactory;

    /**
     * The two kinds of pass slip the form distinguishes. Personal trips are
     * the personnel's own business; official trips are on behalf of the office.
     */
    public const REQUEST_TYPES = ['official', 'personal'];

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_DECLINED = 'declined';

    protected $fillable = [
        'user_id',
        'date_accomplished',
        'date_requested',
        'position',
        'printed_name',
        'usd',
        'destination',
        'purpose',
        'request_type',
        'expected_departure',
        'expected_arrival',
        'actual_arrival',
        'recommended_by',
        'status',
        'assigned_to',
        'reviewed_by',
        'reviewed_at',
        'review_remarks',
    ];

    /**
     * `status` is cast to bool and `reviewed_at` gates the distinction, so a
     * `status = false` row with no `reviewed_at` is pending, not declined.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_accomplished' => 'date',
            'date_requested' => 'date',
            'expected_departure' => 'datetime',
            'expected_arrival' => 'datetime',
            'actual_arrival' => 'datetime',
            'status' => 'boolean',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * The personnel who filed the slip.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The immediate supervisor who recommends the slip. Normally the head of the
     * filer's section, but HR may override it.
     *
     * @return BelongsTo<User, $this>
     */
    public function recommendedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recommended_by');
    }

    /**
     * The next higher official who approves the slip.
     *
     * @return BelongsTo<User, $this>
     */
    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The HR/admin officer who actually recorded the decision.
     *
     * Distinct from assignedToUser: the named official is a signature on the
     * form, whereas this is the account that clicked approve.
     *
     * @return BelongsTo<User, $this>
     */
    public function reviewedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * 'pending' | 'approved' | 'declined'.
     *
     * Derived rather than stored so the boolean `status` column stays a plain
     * "was it approved" flag, exactly as it is on Leave.
     */
    public function approvalState(): string
    {
        if ($this->reviewed_at === null) {
            return self::STATUS_PENDING;
        }

        return $this->status ? self::STATUS_APPROVED : self::STATUS_DECLINED;
    }

    public function isPendingReview(): bool
    {
        return $this->approvalState() === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->approvalState() === self::STATUS_APPROVED;
    }

    public function isDeclined(): bool
    {
        return $this->approvalState() === self::STATUS_DECLINED;
    }

    public function isOfficial(): bool
    {
        return $this->request_type === 'official';
    }

    /**
     * Whether the actual time of arrival has been recorded.
     *
     * HR writes this once the personnel returns; the filer never enters it.
     */
    public function hasActualArrival(): bool
    {
        return $this->actual_arrival !== null;
    }

    /**
     * Slips that have been filed but not yet decided.
     *
     * @param  Builder<PassSlip>  $query
     */
    public function scopePendingReview(Builder $query): void
    {
        $query->whereNull('reviewed_at');
    }

    /**
     * @param  Builder<PassSlip>  $query
     */
    public function scopeWithStatus(Builder $query, string $status): void
    {
        match ($status) {
            self::STATUS_APPROVED => $query->where('status', true)->whereNotNull('reviewed_at'),
            self::STATUS_DECLINED => $query->where('status', false)->whereNotNull('reviewed_at'),
            default => $query->whereNull('reviewed_at'),
        };
    }
}
