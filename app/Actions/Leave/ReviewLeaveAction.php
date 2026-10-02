<?php

namespace App\Actions\Leave;

use App\Enums\Permission;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Records an approval decision on a filed leave request.
 *
 * Always operates on the whole `filing_group_id` so a multi-segment filing is
 * never left partially approved.
 */
class ReviewLeaveAction
{
    /**
     * @throws AuthorizationException
     */
    public function approve(string $filingGroupId, User $reviewer, ?string $remarks = null): int
    {
        return $this->decide($filingGroupId, $reviewer, $remarks, approved: true);
    }

    /**
     * @throws AuthorizationException
     */
    public function reject(string $filingGroupId, User $reviewer, ?string $remarks = null): int
    {
        return $this->decide($filingGroupId, $reviewer, $remarks, approved: false);
    }

    protected function decide(string $filingGroupId, User $reviewer, ?string $remarks, bool $approved): int
    {
        $pending = Leave::query()
            ->pendingReview()
            ->filingGroup($filingGroupId)
            ->get();

        // Authorise against the real rows rather than a flag, so a request that
        // was already decided (or a forged group id) fails closed.
        foreach ($pending as $leave) {
            Gate::forUser($reviewer)->authorize(
                $approved ? 'approve' : 'reject',
                $leave
            );
        }

        if ($pending->isEmpty()) {
            return 0;
        }

        return DB::transaction(fn () => Leave::query()
            ->whereIn('id', $pending->pluck('id'))
            ->update([
                'status' => $approved,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_remarks' => $remarks,
                'updated_at' => now(),
            ]));
    }

    /**
     * Human-readable summary of what a decision will do, for the flash message.
     */
    public function describe(string $filingGroupId): string
    {
        $leave = Leave::query()->filingGroup($filingGroupId)->first();

        if (! $leave) {
            return 'Leave request';
        }

        $days = (float) Leave::query()
            ->pendingReview()
            ->filingGroup($filingGroupId)
            ->get()
            ->sum(fn (Leave $row) => abs((float) $row->balance));

        return sprintf('%.2g days of %s', $days, $leave->leave_type);
    }

    /**
     * Whether the caller holds the permission this action requires.
     */
    public function canReview(User $user): bool
    {
        return $user->can(Permission::ReviewLeave);
    }
}
