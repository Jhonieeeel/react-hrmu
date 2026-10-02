<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leave extends Model
{
    use HasFactory;

    /**
     * `event_tag` values that represent a leave filing submitted by an employee
     * and therefore subject to the approval workflow.
     *
     * `vacation leave` is the odd one out. It is only ever set when an employee
     * files *force* leave: the leave_type stays 'force leave', but the tag marks
     * it as a force-leave-to-vacation conversion so the balance engine folds it
     * into the vacation leave credit (see ReplayBalanceAction). Because it
     * originates from a filing, it has to wait for a decision like any other —
     * treating it as an HR row made force leave silently self-approve and
     * consume balance without ever appearing in the review queue.
     *
     * Everything else in the ledger is written by HR (accruals, monthly filings,
     * tardiness, undertime, absent) and counts as approved the instant it is
     * stored.
     */
    public const FILED_LEAVE_TAGS = ['leave', 'cto', 'offset', 'vacation leave'];

    /**
     * Statuses a filing can hold once it has been submitted for review.
     */
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'employee_id',
        'leave_type',
        'event_type',
        'event_tag',
        'filing_group_id',
        'balance',
        'starts_at',
        'ends_at',
        'status',
        'remarks',
        'reviewed_by',
        'reviewed_at',
        'review_remarks',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'balance' => 'decimal:3',
        'status' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /* ---------------------------------------------------------------------
     | Approval workflow
     | ---------------------------------------------------------------------
     | The legacy `status` boolean means "filing completed" on filing rows and
     | "approved" on deduction rows. To keep one column serving two meanings
     | without ambiguity, the approval state below is derived: a row that is not
     | an employee filing is always approved, and for a filing `status` is the
     | decision. Rejections are recorded by the presence of `reviewed_at`
     | together with a review note and a cleared approval.
     */

    /**
     * Whether this row is an employee-submitted filing that needs a decision.
     */
    public function requiresApproval(): bool
    {
        return $this->event_type === 'deduction'
            && in_array($this->event_tag, self::FILED_LEAVE_TAGS, true);
    }

    /**
     * True when the row counts towards the employee's balance. HR-recorded
     * deductions always do; an employee filing only once it has been approved.
     */
    public function countsTowardsBalance(): bool
    {
        return ! $this->requiresApproval() || (bool) $this->status;
    }

    /**
     * The approval state of this row.
     */
    public function approvalState(): string
    {
        if (! $this->requiresApproval()) {
            return self::STATUS_APPROVED;
        }

        if ($this->status) {
            return self::STATUS_APPROVED;
        }

        return $this->reviewed_at ? self::STATUS_REJECTED : self::STATUS_PENDING;
    }

    public function isPendingReview(): bool
    {
        return $this->approvalState() === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->approvalState() === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->approvalState() === self::STATUS_REJECTED;
    }

    /* ---------------------------------------------------------------------
     | Scopes
     | --------------------------------------------------------------------- */

    /**
     * Filings awaiting a decision.
     *
     * @param  Builder<static>  $query
     */
    public function scopePendingReview(Builder $query): void
    {
        $query->where('event_type', 'deduction')
            ->whereIn('event_tag', self::FILED_LEAVE_TAGS)
            ->where('status', false)
            ->whereNull('reviewed_at');
    }

    /**
     * @param  Builder<static>  $query
     */
    public function scopeFilingGroup(Builder $query, string $groupId): void
    {
        $query->where('filing_group_id', $groupId);
    }
}
