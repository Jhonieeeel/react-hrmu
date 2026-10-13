<?php

namespace App\Http\Controllers;

use App\Actions\PassSlip\PendingPassSlipAction;
use App\Actions\PassSlip\ReviewPassSlipAction;
use App\Http\Requests\EditTravelTimesRequest;
use App\Http\Requests\PassSlipReviewRequest;
use App\Models\PassSlip;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The HR pass slip queue: what personnel have filed, and the approve/decline actions.
 *
 * Every route here sits behind `permission:review pass slips`, so an ordinary
 * employee cannot reach the queue at all — approving or declining a pass slip is
 * an admin/hr action and never self-service. Split out from PassSlipController
 * for the same reason LeaveReviewController is separate: the two audiences have
 * genuinely different access.
 */
class PassSlipReviewController extends Controller
{
    /**
     * The buckets the queue can be filtered by, mirroring PassSlip::approvalState().
     */
    protected const STATUSES = ['pending', 'approved', 'declined'];

    public function index(Request $request, PendingPassSlipAction $pending): Response
    {
        $status = $this->status($request);

        return Inertia::render('PassSlip/ReviewQueue', [
            'requests' => $pending->paginate(
                $status,
                $request->integer('page', 1),
                $request->integer('per_page', 10),
            ),
            'counts' => $pending->counts(),
            'filters' => ['status' => $status],
            'signatories' => $this->signatoryOptions(),
        ]);
    }

    /**
     * JSON feed so the queue can refresh without a full page visit.
     */
    public function data(Request $request, PendingPassSlipAction $pending): JsonResponse
    {
        return response()->json([
            'requests' => $pending->paginate(
                $this->status($request),
                $request->integer('page', 1),
                $request->integer('per_page', 10),
            ),
            'counts' => $pending->counts(),
        ]);
    }

    public function approve(PassSlipReviewRequest $request, PassSlip $passSlip, ReviewPassSlipAction $review): RedirectResponse|JsonResponse
    {
        $remarks = $request->validated()['review_remarks'] ?? null;
        $summary = $review->describe($passSlip);

        $review->approve($passSlip, $request->user(), $remarks);

        return $this->respond($request, "Approved {$summary}.");
    }

    public function decline(PassSlipReviewRequest $request, PassSlip $passSlip, ReviewPassSlipAction $review): RedirectResponse|JsonResponse
    {
        // A decline without a reason leaves the personnel with nothing to act on.
        $remarks = $request->validated()['review_remarks'];

        $summary = $review->describe($passSlip);

        $review->decline($passSlip, $request->user(), $remarks);

        return $this->respond($request, "Declined {$summary}.");
    }

    /**
     * Re-points the two signatory lines on a slip.
     *
     * The recommender is normally derived from the filer's section head and the
     * approver is normally picked when the slip is filed, but HR needs to correct
     * either: a section may have no head appointed, or the named official may
     * have been unavailable.
     */
    public function signatories(Request $request, PassSlip $passSlip): RedirectResponse|JsonResponse
    {
        $this->authorize('update', $passSlip);

        $data = $request->validate([
            'recommended_by' => ['nullable', 'integer', 'exists:users,id'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $passSlip->update($data);

        return $this->respond($request, 'Signatories updated.');
    }

    /**
     * Corrects the expected departure and the actual arrival.
     *
     * HR-only, and the one amendment here that is deliberately allowed on a slip
     * which has already been decided: the trip has happened by the time a time is
     * wrong, so locking this behind "pending" would make the correction impossible
     * in exactly the case it exists for.
     */
    public function travelTimes(EditTravelTimesRequest $request, PassSlip $passSlip): RedirectResponse|JsonResponse
    {
        $passSlip->update($request->payload());

        return $this->respond($request, 'Travel times updated.');
    }

    /**
     * Constrains the requested status to one the queue knows how to build.
     */
    protected function status(Request $request): string
    {
        $status = (string) $request->input('status', 'pending');

        return in_array($status, self::STATUSES, true) ? $status : 'pending';
    }

    /**
     * Everyone who could be named as a signatory on a slip.
     *
     * @return Collection<int, array{id: int, name: string}>
     */
    protected function signatoryOptions()
    {
        return User::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name]);
    }

    protected function respond(Request $request, string $message): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message]);
        }

        return back()->with('success', [
            'message' => $message,
            'id' => Str::uuid(),
        ]);
    }
}
