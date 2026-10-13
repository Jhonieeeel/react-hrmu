<?php

namespace App\Actions\PassSlip;

use App\Data\PassSlipDTO;
use App\Models\Employee;
use App\Models\PassSlip;
use App\Models\User;
use App\Notifications\PassSlipNotification;
use Illuminate\Auth\Access\AuthorizationException;

/**
 * Files a new pass slip.
 *
 * The important job here is deciding *who* the slip belongs to and stamping the
 * fields the form asks for but the filer must not type: the printed name, the
 * position, and the Unit/Section/Division line all come from the personnel
 * record, so a slip cannot claim a designation the filer does not hold.
 */
class CreatePassSlipAction
{
    /**
     * @throws AuthorizationException
     */
    public function execute(PassSlipDTO $data, User $actor): PassSlip
    {
        $owner = $this->resolveOwner($data, $actor);

        $passSlip = new PassSlip([
            'user_id' => $owner->id,

            // The printed name is a snapshot, not a live read of users.name: the
            // slip records who signed it at the time, and a later rename should
            // not rewrite that history.
            'printed_name' => $owner->name,
            // Coalesced to empty strings because position and usd are NOT NULL
            // columns, and a personnel record can legitimately have neither a
            // position filled in nor a full unit/section/division chain.
            'position' => $owner->employee()?->position ?? '',
            'usd' => $owner->employee()?->unitSectionDivisionLabel() ?? '',

            'date_accomplished' => $data->date_accomplished ?? today(),
            'date_requested' => $data->date_requested,

            'request_type' => $data->request_type,
            'expected_departure' => $data->expected_departure,
            'expected_arrival' => $data->expected_arrival,

            'destination' => $data->destination,
            'purpose' => $data->purpose,

            // The immediate supervisor is the head of the filer's section. HR may
            // name someone else, which is what the override in the DTO is for.
            'recommended_by' => $this->resolveRecommender($data, $owner, $actor),

            'assigned_to' => $data->assigned_to,

            // A new filing is always pending. Leaving this unset and deriving
            // "pending" from a null reviewed_at means an approved slip can never
            // be confused with one nobody has looked at yet.
            'status' => false,
        ]);

        $passSlip->save();

        $this->notifyApprover($passSlip);

        return $passSlip;
    }

    /**
     * Resolves whose slip this is.
     *
     * A submitted user_id is only honoured for callers holding ViewAllPassSlips.
     * Without that check any employee could post a slip under someone else's
     * name just by editing the request payload, so the submitted id is dropped
     * rather than trusted.
     */
    protected function resolveOwner(PassSlipDTO $data, User $actor): User
    {
        if ($data->user_id === null || $data->user_id === $actor->id) {
            return $actor;
        }

        if (! $actor->can('view all pass slips')) {
            return $actor;
        }

        return User::findOrFail($data->user_id);
    }

    /**
     * The "Recommending Approval" signatory.
     *
     * HR's explicit choice wins; otherwise it falls back to the head of the
     * filer's section. An employee cannot pick their own recommender — only HR
     * is allowed to override it, which is the same rule as filing for others.
     */
    protected function resolveRecommender(PassSlipDTO $data, User $owner, User $actor): ?int
    {
        if ($data->recommended_by !== null && $actor->can('view all pass slips')) {
            return $data->recommended_by;
        }

        return Employee::query()
            ->where('user_id', $owner->id)
            ->with('section:id,head_id')
            ->first()
            ?->section
            ?->head_id;
    }

    /**
     * Tells the named approver a slip is waiting on them.
     *
     * Skipped silently when no approver has been named yet — HR can assign one
     * later from the review queue, and a slip should not fail to file just
     * because the office is empty of approvals.
     */
    protected function notifyApprover(PassSlip $passSlip): void
    {
        $approver = $passSlip->assignedToUser;

        if ($approver === null) {
            return;
        }

        $approver->notify(new PassSlipNotification($passSlip));
    }
}
