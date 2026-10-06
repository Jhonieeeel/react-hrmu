<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                // Effective permissions (baseline + role-derived) and role names
                // so the UI can hide what the server would refuse anyway.
                'permissions' => $user?->effectivePermissions() ?? [],
                'roles' => $user?->roleNames() ?? [],
                // The personnel record behind this login. Shared so self-service
                // screens (e.g. the calendar's file-leave dialog) can lock the
                // employee field to the caller instead of offering the roster.
                'employee_id' => $user?->employee()?->id,
            ],
            'flash' => [
                'downloadUrl' => fn () => session('downloadUrl'),
                // Normalised to a single shape. Controllers flash either a bare
                // string or a ['message' => ..., 'id' => ...] array, and the
                // frontend reads `.message` — so every controller that flashed a
                // plain string (both undertime endpoints, all of organisation,
                // pass slips, calendar filing) was silently producing no
                // confirmation at all.
                'success' => fn () => $this->normaliseFlash(session('success')),
                // Failure channel, so a rejected action reports itself in the
                // same place a confirmation does.
                'error' => fn () => $this->normaliseFlash(session('error')),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Flattens a flash value into the shape the notification layer expects.
     *
     * Controllers are inconsistent here — some flash a bare string, others an
     * array — and the frontend reads `.message`. Normalising in one place means
     * a new controller cannot reintroduce the silent-failure case by picking
     * the wrong shape.
     *
     * The id exists so the notification layer can tell a genuinely new response
     * from a re-render of the one it is already showing. Flash data is consumed
     * after a single request, so the fallback uuid is minted at most once.
     *
     * @return array{message: string, id: string}|null
     */
    protected function normaliseFlash(mixed $flash): ?array
    {
        if (is_string($flash) && $flash !== '') {
            return ['message' => $flash, 'id' => (string) Str::uuid()];
        }

        if (is_array($flash) && isset($flash['message'])) {
            return [
                'message' => (string) $flash['message'],
                'id' => (string) ($flash['id'] ?? Str::uuid()),
            ];
        }

        return null;
    }
}
