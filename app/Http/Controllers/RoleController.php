<?php

namespace App\Http\Controllers;

use App\Actions\User\UpdateUserRolesAction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Assigning roles to users. Every route requires the AssignRoles permission,
 * which the HR role deliberately lacks — only a super admin can escalate.
 */
class RoleController extends Controller
{
    public function update(
        Request $request,
        User $user,
        UpdateUserRolesAction $action
    ): RedirectResponse {
        $validated = $request->validate([
            'roles' => ['present', 'array'],
            'roles.*' => ['string'],
        ]);

        $action->execute($user, $validated['roles'], $request->user());

        return back()->with('success', [
            'message' => "Roles updated for {$user->name}.",
            'id' => Str::uuid(),
        ]);
    }

    /**
     * The role catalogue, for populating the assignment UI.
     */
    public function options(Request $request, UpdateUserRolesAction $action): JsonResponse
    {
        return response()->json([
            'roles' => $action->options(),
            'permissions' => $action->assignablePermissions($request->user()),
        ]);
    }
}
