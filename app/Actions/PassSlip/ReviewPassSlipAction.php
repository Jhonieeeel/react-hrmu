<?php

namespace App\Actions\PassSlip;

use App\Models\PassSlip;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Records an approve/decline decision on a pass slip.
 *
 * Deliberately a narrow analogue of ReviewLeaveAction: one slip, one decision,
 * and the authorisation is checked against the re-read row rather than a flag
 * carried in from the request, so an already-decided slip cannot be flipped by
 * replaying the endpoint.
 */
class ReviewPassSlipAction
{
    /**
     * @throws AuthorizationException
     */
    public function approve(PassSlip $passSlip, User $reviewer, ?string $remarks = null): PassSlip
    {
        return $this->decide($passSlip, $reviewer, $remarks, approved: true);
    }

    /**
     * @throws AuthorizationException
     */
    public function decline(PassSlip $passSlip, User $reviewer, ?string $remarks = null): PassSlip
    {
        return $this->decide($passSlip, $reviewer, $remarks, approved: false);
    }

    protected function decide(PassSlip $passSlip, User $reviewer, ?string $remarks, bool $approved): PassSlip
    {
        // Re-read the row so the policy sees the current state. If two HR officers
        // click at once, the loser is rejected by `review()` rather than
        // overwriting the winner's decision.
        $current = PassSlip::query()->findOrFail($passSlip->id);

        Gate::forUser($reviewer)->authorize(
            $approved ? 'approve' : 'decline',
            $current
        );

        return DB::transaction(function () use ($current, $reviewer, $remarks, $approved) {
            $current->forceFill([
                'status' => $approved,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'review_remarks' => $remarks,
            ])->save();

            return $current;
        });
    }

    /**
     * Human-readable summary of what was decided, for the flash message.
     */
    public function describe(PassSlip $passSlip): string
    {
        $who = $passSlip->printed_name ?: 'the personnel';

        return "{$passSlip->request_type} pass slip for {$who}";
    }
}
