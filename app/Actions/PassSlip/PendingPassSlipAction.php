<?php

namespace App\Actions\PassSlip;

use App\Models\PassSlip;
use Illuminate\Support\Collection;

/**
 * Shapes filed pass slips for the review queue and the personnel's own list.
 *
 * Unlike leave, one pass slip is one row — there is no multi-segment filing to
 * group — so this is a straight query/paginate/summarise rather than the
 * grouping PendingReviewAction needs.
 */
class PendingPassSlipAction
{
    /**
     * Slips in one decision bucket, paged.
     *
     * @return array<string, mixed>
     */
    public function paginate(string $status = 'pending', int $page = 1, int $perPage = 10): array
    {
        $query = PassSlip::query()->withStatus($status);

        $total = (clone $query)->count();

        $rows = $query
            ->with([
                'user:id,name',
                'recommendedByUser:id,name',
                'assignedToUser:id,name',
                'reviewedByUser:id,name',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->forPage(max(1, $page), $perPage)
            ->get();

        return [
            'data' => $this->summarise($rows)->values()->all(),
            'current_page' => max(1, $page),
            'last_page' => (int) max(1, ceil($total / $perPage)),
            'total' => $total,
        ];
    }

    /**
     * How many slips sit in each bucket, for the queue's tab badges.
     *
     * @return array<string, int>
     */
    public function counts(): array
    {
        return [
            'pending' => PassSlip::query()->whereNull('reviewed_at')->count(),
            'approved' => PassSlip::query()->where('status', true)->whereNotNull('reviewed_at')->count(),
            'declined' => PassSlip::query()->where('status', false)->whereNotNull('reviewed_at')->count(),
        ];
    }

    /**
     * The slips a single personnel filed, newest first.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function forUser(int $userId): Collection
    {
        $rows = PassSlip::query()
            ->where('user_id', $userId)
            ->with([
                'recommendedByUser:id,name',
                'assignedToUser:id,name',
                'reviewedByUser:id,name',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return $this->summarise($rows);
    }

    /**
     * Flattens a set of rows into the array shape the frontend consumes.
     *
     * Explicitly hand-rolled rather than relying on Eloquent's default
     * serialisation, because the queue only needs a handful of columns and
     * sending whole User models (with their permission relations) on every
     * row would bloat the payload considerably.
     *
     * @param  Collection<int, PassSlip>  $rows
     * @return Collection<int, array<string, mixed>>
     */
    protected function summarise(Collection $rows): Collection
    {
        return $rows->map(fn (PassSlip $slip) => [
            'id' => $slip->id,
            'printed_name' => $slip->printed_name,
            'position' => $slip->position,
            'usd' => $slip->usd,
            'request_type' => $slip->request_type,
            'date_accomplished' => $slip->date_accomplished?->toDateString(),
            'date_requested' => $slip->date_requested?->toDateString(),
            'expected_departure' => $slip->expected_departure?->toDateTimeString(),
            'expected_arrival' => $slip->expected_arrival?->toDateTimeString(),
            'actual_arrival' => $slip->actual_arrival?->toDateTimeString(),
            'destination' => $slip->destination,
            'purpose' => $slip->purpose,
            'status' => $slip->approvalState(),
            // Ids as well as names: the queue lets HR re-point a signature line,
            // and a select can only match on a stable identifier.
            'recommended_by' => $slip->recommended_by,
            'recommended_by_name' => $slip->recommendedByUser?->name,
            'assigned_to' => $slip->assigned_to,
            'assigned_to_name' => $slip->assignedToUser?->name,
            'reviewed_at' => $slip->reviewed_at?->toDateTimeString(),
            'review_remarks' => $slip->review_remarks,
            'reviewer_name' => $slip->reviewedByUser?->name,
            'filed_at' => $slip->created_at?->toDateTimeString(),
        ]);
    }
}
