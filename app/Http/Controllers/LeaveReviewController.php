<?php

namespace App\Http\Controllers;

use App\Actions\Leave\PendingReviewAction;
use App\Actions\Leave\ReviewLeaveAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The HR review queue: what employees have filed, and the approve/reject actions.
 *
 * Separate from LeaveController because these routes are entirely HR-facing and
 * protected by the ReviewLeave permission at the route level.
 */
class LeaveReviewController extends Controller
{
    public function index(PendingReviewAction $pending): Response
    {
        return Inertia::render('Leave/ReviewQueue', [
            'requests' => $pending->requests(),
        ]);
    }

    /**
     * JSON feed so the queue can refresh without a full page visit.
     */
    public function data(PendingReviewAction $pending): JsonResponse
    {
        return response()->json(['requests' => $pending->requests()]);
    }

    public function approve(Request $request, string $filingGroup, ReviewLeaveAction $review): RedirectResponse|JsonResponse
    {
        $remarks = $request->validate([
            'review_remarks' => ['nullable', 'string', 'max:1000'],
        ])['review_remarks'] ?? null;

        $summary = $review->describe($filingGroup);
        $updated = $review->approve($filingGroup, $request->user(), $remarks);

        return $this->respond(
            $request,
            $updated,
            $updated > 0
                ? "Approved {$summary}."
                : 'That request has already been reviewed.'
        );
    }

    public function reject(Request $request, string $filingGroup, ReviewLeaveAction $review): RedirectResponse|JsonResponse
    {
        // A rejection without a reason leaves the employee with nothing to act
        // on, so the note is mandatory here.
        $validated = $request->validate([
            'review_remarks' => ['required', 'string', 'max:1000'],
        ]);

        $summary = $review->describe($filingGroup);
        $updated = $review->reject($filingGroup, $request->user(), $validated['review_remarks']);

        return $this->respond(
            $request,
            $updated,
            $updated > 0
                ? "Rejected {$summary}."
                : 'That request has already been reviewed.'
        );
    }

    protected function respond(Request $request, int $updated, string $message): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message, 'updated' => $updated]);
        }

        return back()->with('success', [
            'message' => $message,
            'id' => Str::uuid(),
        ]);
    }
}
