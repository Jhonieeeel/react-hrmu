<?php

namespace App\Actions\Leave;

use App\Enums\Permission;
use App\Models\Leave;
use App\Models\LeaveStatusChange;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use InvalidArgumentException;

/**
 * Moves a filed leave request to a different approval state.
 *
 * This is the correction path, and it is deliberately separate from
 * ReviewLeaveAction. Deciding a request is a one-shot act on something nobody
 * has answered yet; this is for afterwards — the leave was approved in error, or
 * the paper record says otherwise, and the request has to be moved.
 *
 * Two things follow from that separation:
 *
 *  - It acts on a filing group in *any* state, decided or not, rather than only
 *    on the pending rows ReviewLeaveAction queries.
 *  - It writes a leave_status_changes row every time. The `leaves` row only
 *    holds the current decision, so without the trail a correction would leave
 *    no evidence that the earlier decision ever happened — which is exactly the
 *    situation the corrections exist to resolve.
 */
class ChangeLeaveStatusAction
{
    /**
     * The states a filing can be moved to. Mirrors Leave::approvalState().
     *
     * @var list<string>
     */
    public const STATUSES = [
        Leave::STATUS_PENDING,
        Leave::STATUS_APPROVED,
        Leave::STATUS_REJECTED,
    ];

    /**
     * @throws AuthorizationException
     */
    public function change(
        string $filingGroupId,
        User $actor,
        string $toStatus,
        ?string $remarks = null
    ): int {
        if (! in_array($toStatus, self::STATUSES, true)) {
            throw new InvalidArgumentException("Unknown leave status [{$toStatus}].");
        }

        // Only the rows that are actually filings can have their status moved —
        // an accrual or an undertime adjustment has no approval state, and
        // writing one would invent a decision that never happened.
        $rows = Leave::query()
            ->filingGroup($filingGroupId)
            ->get()
            ->filter(fn (Leave $leave) => $leave->requiresApproval());

        if ($rows->isEmpty()) {
            return 0;
        }

        // Authorise against the real rows and fail closed: if any row in the
        // filing cannot be changed, none of them are. A forged group id, or a
        // group the caller may only partly touch, must not move half a request.
        foreach ($rows as $leave) {
            Gate::forUser($actor)->authorize('changeStatus', $leave);
        }

        $fromStatus = $rows->first()->approvalState();

        return DB::transaction(function () use ($rows, $fromStatus, $toStatus, $actor, $remarks, $filingGroupId): int {
            // Back to pending has to clear the decision trail as well as the
            // boolean: scopePendingReview() reads `whereNull('reviewed_at')`, so
            // a row cleared only on `status` would vanish from the queue while
            // still reading as approved.
            $clearing = $toStatus === Leave::STATUS_PENDING;

            $updated = Leave::query()
                ->whereIn('id', $rows->pluck('id'))
                ->update([
                    'status' => $toStatus === Leave::STATUS_APPROVED,
                    'reviewed_by' => $clearing ? null : $actor->id,
                    'reviewed_at' => $clearing ? null : now(),
                    // A blank reason on a move is kept as "no reason given"
                    // rather than wiping what the previous reviewer wrote.
                    'review_remarks' => $remarks !== null && $remarks !== ''
                        ? $remarks
                        : ($clearing ? null : $rows->first()->review_remarks),
                    'updated_at' => now(),
                ]);

            LeaveStatusChange::create([
                'filing_group_id' => $filingGroupId,
                // One entry per filing, not per ledger row: a multi-segment
                // request moved by one person is one decision, and three audit
                // rows for three contiguous segments would read as three people.
                'leave_id' => $rows->first()->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'user_id' => $actor->id,
                'remarks' => $remarks ?: null,
            ]);

            return $updated;
        });
    }

    /**
     * Human-readable summary of what a move will affect, for the flash message.
     */
    public function describe(string $filingGroupId): string
    {
        $leave = Leave::query()->filingGroup($filingGroupId)->first();

        if (! $leave) {
            return 'Leave request';
        }

        $days = (float) Leave::query()
            ->filingGroup($filingGroupId)
            ->get()
            ->sum(fn (Leave $row) => abs((float) $row->balance));

        return sprintf('%.2g days of %s', $days, $leave->leave_type);
    }

    /**
     * Whether the caller holds the permission this action requires.
     */
    public function canChangeStatus(User $user): bool
    {
        return $user->can(Permission::ReviewLeave);
    }
}
