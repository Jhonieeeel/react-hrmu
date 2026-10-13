<?php

namespace App\Http\Controllers;

use App\Actions\PassSlip\CreatePassSlipAction;
use App\Actions\PassSlip\PendingPassSlipAction;
use App\Data\PassSlipDTO;
use App\Http\Requests\PassSlipRequest;
use App\Models\Employee;
use App\Models\PassSlip;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Self-service pass slip filing, plus the personnel's own slip history.
 *
 * Filing is open to every employee; the review queue lives in
 * PassSlipReviewController because approving is HR-only and is protected
 * separately at the route level.
 */
class PassSlipController extends Controller
{
    /**
     * The file form, plus the caller's own slips so they can see the outcome of
     * what they filed without switching pages.
     */
    public function index(PendingPassSlipAction $pending): Response
    {
        $user = request()->user();

        return Inertia::render('PassSlip/Index', [
            // Who the slip is for. Ordinary employees get an empty list and the
            // form locks the personnel fields to themselves; HR gets the roster.
            'personnel' => $user->can('view all pass slips')
                ? $this->roster()
                : [],
            'supervisors' => $this->approverOptions(),
            'mySlips' => $pending->forUser($user->id)->values(),
            'canFileForOthers' => $user->can('view all pass slips'),
        ]);
    }

    /**
     * Persists a newly filed slip.
     */
    public function store(PassSlipRequest $request, CreatePassSlipAction $create): RedirectResponse
    {
        $create->execute(
            PassSlipDTO::fromPayload($request->payload()),
            $request->user()
        );

        return back()->with('success', [
            'message' => 'Pass slip filed and awaiting approval.',
            'id' => Str::uuid(),
        ]);
    }

    /**
     * Withdraws a slip that has not been decided yet.
     */
    public function destroy(PassSlip $passSlip): RedirectResponse
    {
        $this->authorize('delete', $passSlip);

        $passSlip->delete();

        return back()->with('success', [
            'message' => 'Pass slip withdrawn.',
            'id' => Str::uuid(),
        ]);
    }

    /**
     * The roster HR picks from when filing on someone else's behalf.
     *
     * Only the fields the form auto-fills are returned, so the client never has
     * to guess how to render a personnel's designation.
     *
     * @return Collection<int, array<string, mixed>>
     */
    protected function roster()
    {
        return Employee::query()
            ->with(['user:id,name', 'unit:id,unit_name', 'section:id,section_name,head_id', 'division:id,division_name'])
            ->get()
            ->map(fn (Employee $employee) => [
                'id' => $employee->user_id,
                'name' => $employee->user?->name ?? 'Unknown',
                'position' => $employee->position,
                'usd' => $employee->unitSectionDivisionLabel(),
                // Pre-resolved so the form can show who will recommend without a
                // second round trip.
                'supervisor_id' => $employee->supervisor()?->id,
                'supervisor_name' => $employee->supervisor()?->name,
            ]);
    }

    /**
     * Everyone who could be named as a signatory.
     *
     * @return Collection<int, array{id: int, name: string}>
     */
    protected function approverOptions()
    {
        return User::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
            ]);
    }
}
