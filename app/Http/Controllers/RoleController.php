<?php

namespace App\Http\Controllers;

use App\Actions\User\UpdateUserRolesAction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Assigning roles and permissions to users. Every route requires the AssignRoles
 * permission, which the HR role deliberately lacks — only a super admin can
 * escalate.
 */
class RoleController extends Controller
{
    /**
     * The access management screen: pick a user, then assign roles and
     * permissions. Super-admin only via the AssignRoles middleware.
     */
    public function index(): Response
    {
        return Inertia::render('User/RoleManager');
    }

    public function update(
        Request $request,
        User $user,
        UpdateUserRolesAction $action
    ): RedirectResponse {
        $validated = $request->validate([
            'roles' => ['present', 'array'],
            'roles.*' => ['string'],
            // Optional so a caller that only wants to change roles does not have
            // to send the key — otherwise omitting it would clear direct grants.
            'permissions' => ['sometimes', 'nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $action->execute(
            $user,
            $validated['roles'],
            $request->user(),
            $validated['permissions'] ?? null,
        );

        return back()->with('success', [
            'message' => "Access updated for {$user->name}.",
            'id' => Str::uuid(),
        ]);
    }

    /**
     * The role and permission catalogue, for populating the assignment UI.
     */
    public function options(Request $request, UpdateUserRolesAction $action): JsonResponse
    {
        return response()->json([
            'roles' => $action->options(),
            'permissions' => $action->assignablePermissions($request->user()),
            'counts' => $action->catalogueCounts(),
        ]);
    }

    /**
     * The user picker, with each user's current access already resolved.
     *
     * Returns the access inline rather than making the UI fetch it per row: the
     * picker is the only consumer, and one round trip keeps the dialog from
     * flickering while the admin scrolls.
     */
    public function users(Request $request, UpdateUserRolesAction $action): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));

        $users = User::query()
            ->with(['roles:id,name', 'permissions:id,name'])
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
            ))
            ->orderBy('name')
            ->limit(50)
            ->get();

        return response()->json([
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                ...$action->accessFor($user),
            ]),
        ]);
    }

    /**
     * One user's access, for when the editor is opened directly.
     */
    public function show(User $user, UpdateUserRolesAction $action): JsonResponse
    {
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                ...$action->accessFor($user),
            ],
        ]);
    }
}
