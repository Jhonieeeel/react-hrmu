<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\PassSlip;
use App\Models\User;

/**
 * Who may see, file, decide and amend a pass slip.
 *
 * The rule that shapes this policy: a slip is filed by one person and decided by
 * HR. Approving or declining is never self-service and never the immediate
 * supervisor's to do — it needs ReviewPassSlips, which only the admin/hr roles
 * hold.
 */
class PassSlipPolicy
{
    /**
     * Can the user file a pass slip at all?
     *
     * Filing is baseline (every employee), but the policy is the place that
     * also answers the harder question: for whom?
     */
    public function create(User $user): bool
    {
        return $user->can(Permission::FilePassSlip);
    }

    /**
     * Can the user file a slip on someone else's behalf?
     *
     * Mirrors LeaveController::resolveEmployee — a submitted user_id is only
     * honoured for holders of ViewAllPassSlips, so an ordinary employee cannot
     * post a slip into someone else's name by tampering with the form.
     */
    public function createForOthers(User $user): bool
    {
        return $user->can(Permission::ViewAllPassSlips);
    }

    /**
     * Can the user see the pass slip ledger of everyone?
     */
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::ViewAllPassSlips);
    }

    /**
     * Can the user read this specific slip?
     *
     * The filer always can. HR can read everything.
     */
    public function view(User $user, PassSlip $passSlip): bool
    {
        if ($user->can(Permission::ViewAllPassSlips)) {
            return true;
        }

        return $passSlip->user_id === $user->id;
    }

    /**
     * Can the user record a decision on this slip?
     *
     * Only ever HR/admin, and only while the slip is still undecided — a slip
     * that has already been approved or declined fails closed, so a
     * double-submit cannot silently flip the outcome.
     */
    public function review(User $user, PassSlip $passSlip): bool
    {
        if ($passSlip->isPendingReview() === false) {
            return false;
        }

        return $user->can(Permission::ReviewPassSlips);
    }

    public function approve(User $user, PassSlip $passSlip): bool
    {
        return $this->review($user, $passSlip);
    }

    public function decline(User $user, PassSlip $passSlip): bool
    {
        return $this->review($user, $passSlip);
    }

    /**
     * Can the user amend this slip?
     *
     * A filer may correct their own request, but only while it is pending —
     * once HR has ruled on it, amending the terms behind their back is not
     * something the filer gets to do. HR can always amend.
     */
    public function update(User $user, PassSlip $passSlip): bool
    {
        if ($user->can(Permission::ManagePassSlips)) {
            return true;
        }

        return $passSlip->user_id === $user->id && $passSlip->isPendingReview();
    }

    /**
     * Can the user correct the expected departure and record the actual arrival?
     *
     * HR/admin only, and deliberately *not* restricted to pending slips —
     * the actual arrival is only knowable once the personnel has come back, which
     * is after the slip has been decided. Locking this behind "pending" would
     * make the correction impossible in exactly the case it exists for.
     *
     * The two fields have different owners by design. The expected departure is
     * the filer's to state, but HR corrects it when it was recorded wrongly. The
     * actual arrival is HR's alone — the filer never enters it.
     *
     * Kept separate from `update` so this two-column correction cannot inherit
     * whatever the general ability is later allowed to touch.
     */
    public function editTravelTimes(User $user, PassSlip $passSlip): bool
    {
        return $user->can(Permission::ManagePassSlips);
    }

    /**
     * Can the user delete this slip?
     *
     * Same split as editing: the filer may withdraw a request that has not been
     * decided; afterwards only HR can remove it.
     */
    public function delete(User $user, PassSlip $passSlip): bool
    {
        if ($user->can(Permission::ManagePassSlips)) {
            return true;
        }

        return $passSlip->user_id === $user->id && $passSlip->isPendingReview();
    }
}
