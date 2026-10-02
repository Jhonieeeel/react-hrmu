<?php

namespace App\Actions\Leave;

use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Support\Collection;

/**
 * Groups the ledger rows of each pending filing into a single reviewable
 * request.
 *
 * A single "File Leave" submission writes one row per contiguous weekday range
 * (weekends and holidays are stripped by CheckDateRangeAction), and those rows
 * share a `filing_group_id`. HR needs to approve the submission as one unit —
 * approving half of someone's leave request is not a meaningful outcome.
 */
class PendingReviewAction
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function requests(): Collection
    {
        $requests = Leave::query()
            ->pendingReview()
            ->with('reviewer:id,name')
            ->orderBy('employee_id')
            ->orderBy('starts_at')
            ->get()
            ->groupBy(fn (Leave $leave) => $leave->filing_group_id ?? "legacy-{$leave->id}");

        // Eager-load the employee details for every employee in the queue in one
        // go, rather than per group.
        $employees = Employee::query()
            ->with(['user:id,name', 'unit:id,unit_name', 'section:id,section_name'])
            ->whereIn('id', $requests->flatten()->pluck('employee_id')->unique())
            ->get()
            ->keyBy('id');

        return $this->sortRequests(
            $requests->map(fn (Collection $group) => $this->summarise(
                $group,
                $employees->get($group->first()->employee_id)
            ))
        );
    }

    /**
     * Newest filings first.
     *
     * Typed loosely on purpose: sortBy/values would otherwise strip the precise
     * per-request shape that summarise() guarantees, and the controller serialises
     * this straight to JSON.
     *
     * @param  Collection<int, array<string, mixed>>  $requests
     * @return Collection<int, array<string, mixed>>
     */
    protected function sortRequests(Collection $requests): Collection
    {
        return $requests
            ->sortByDesc(fn (array $request) => $request['filed_at'] ?? '')
            ->values();
    }

    /**
     * The pending requests authored by a single employee.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function forEmployee(Employee $employee): Collection
    {
        return $this->requests()
            ->where('employee_id', $employee->id)
            ->values();
    }

    /**
     * Requests grouped by their filing id for one status, paginated.
     *
     * `requests()` is deliberately unpaginated because it backs the badge count
     * and the in-page list. This is the same data shaped for a paged table, so
     * an HR officer can work through a large backlog without the page growing
     * without bound.
     *
     * The grouping happens in PHP because the unit of review is a filing, not a
     * ledger row — one submission can span several rows, so paginating rows
     * would split a request across two pages.
     */
    public function paginate(
        string $status = 'pending',
        int $page = 1,
        int $perPage = 10,
    ): array {
        $query = match ($status) {
            'approved' => Leave::query()->where('event_type', 'deduction')
                ->whereIn('event_tag', Leave::FILED_LEAVE_TAGS)
                ->where('status', true),
            'rejected' => Leave::query()->where('event_type', 'deduction')
                ->whereIn('event_tag', Leave::FILED_LEAVE_TAGS)
                ->where('status', false)
                ->whereNotNull('reviewed_at'),
            default => Leave::query()->pendingReview(),
        };

        $rows = $query
            ->with('reviewer:id,name')
            ->orderByDesc('created_at')
            ->orderBy('employee_id')
            ->get()
            ->groupBy(fn (Leave $leave) => $leave->filing_group_id ?? "legacy-{$leave->id}");

        $employees = Employee::query()
            ->with(['user:id,name', 'unit:id,unit_name', 'section:id,section_name'])
            ->whereIn('id', $rows->flatten()->pluck('employee_id')->unique())
            ->get()
            ->keyBy('id');

        $requests = $rows
            ->map(fn ($group) => $this->summarise($group, $employees->get($group->first()->employee_id)))
            ->sortByDesc(fn (array $request) => $request['filed_at'] ?? '')
            ->values();

        $page = max(1, $page);
        $total = $requests->count();

        return [
            'data' => $requests->forPage($page, $perPage)->values(),
            'current_page' => $page,
            'last_page' => (int) max(1, ceil($total / $perPage)),
            'total' => $total,
        ];
    }

    /**
     * How many requests sit in each bucket, for the queue's tab badges.
     *
     * Counts distinct filings rather than rows, so a multi-segment request
     * inflates the other tabs by exactly the amount a reviewer cares about.
     *
     * @return array<string, int>
     */
    public function counts(): array
    {
        $countGroups = fn ($query) => $query
            ->get()
            ->groupBy(fn (Leave $leave) => $leave->filing_group_id ?? "legacy-{$leave->id}")
            ->count();

        return [
            'pending' => $countGroups(Leave::query()->pendingReview()),
            'approved' => $countGroups(
                Leave::query()->where('event_type', 'deduction')
                    ->whereIn('event_tag', Leave::FILED_LEAVE_TAGS)
                    ->where('status', true)
            ),
            'rejected' => $countGroups(
                Leave::query()->where('event_type', 'deduction')
                    ->whereIn('event_tag', Leave::FILED_LEAVE_TAGS)
                    ->where('status', false)
                    ->whereNotNull('reviewed_at')
            ),
        ];
    }

    /**
     * @param  Collection<int, Leave>  $group
     * @return array<string, mixed>
     */
    protected function summarise(Collection $group, ?Employee $employee = null): array
    {
        $first = $group->first();
        $employee ??= $first->employee;

        return [
            'filing_group_id' => $first->filing_group_id,
            'employee_id' => $first->employee_id,
            'employee_name' => $employee->user->name ?? 'Unknown employee',
            'position' => $employee?->position,
            'unit' => $employee?->unit?->unit_name,
            'section' => $employee?->section?->section_name,
            'leave_type' => $first->leave_type,
            'ranges' => $group
                ->map(fn (Leave $leave) => [
                    'starts_at' => $leave->starts_at->toDateString(),
                    'ends_at' => $leave->ends_at->toDateString(),
                ])
                ->values()
                ->all(),
            'total_days' => (float) abs($group->sum('balance')),
            'remarks' => $first->remarks,
            'filed_at' => $group->min('created_at')?->toDateTimeString(),
            // Signals that this filing predates grouping, so the UI can avoid
            // offering a bulk action that would only affect one of the rows.
            'segment_count' => $group->count(),
            // Decision trail, shown on the approved/rejected tabs.
            'reviewed_at' => $group->max('reviewed_at')?->toDateTimeString(),
            'review_remarks' => $group->first(
                fn (Leave $leave) => $leave->review_remarks !== null
            )?->review_remarks,
            'reviewer_name' => $group->first()->reviewer?->name,
        ];
    }
}
