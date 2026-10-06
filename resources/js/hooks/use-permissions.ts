import { usePage } from '@inertiajs/react';
import { Permissions, Roles } from '@/types/auth';
import type { Permission, Role } from '@/types/auth';

/**
 * Client-side view of the permissions the server shares on every page.
 *
 * This is a convenience for hiding UI the backend would reject anyway — it is
 * never the security boundary. Every route and controller is independently
 * authorised server-side.
 */
export function usePermissions() {
    const auth = usePage().props.auth as
        | {
              user?: { id?: number; name?: string };
              permissions: string[];
              roles: string[];
              employee_id?: number | null;
          }
        | undefined;

    const permissions = auth?.permissions ?? [];
    const roles = auth?.roles ?? [];

    return {
        permissions,
        roles,
        currentUserId: auth?.user?.id ?? null,
        currentUserName: auth?.user?.name ?? null,
        /**
         * The caller's own personnel record id. Leave filing is keyed by
         * employees.id, not users.id, so self-service forms need this to
         * submit against themselves.
         */
        currentEmployeeId: auth?.employee_id ?? null,
        can: (permission: Permission | string) =>
            permissions.includes(permission),
        hasRole: (role: Role | string) => roles.includes(role),
        isSuperAdmin: roles.includes(Roles.SuperAdmin),
        canReviewLeave: permissions.includes(Permissions.ReviewLeave),
        canManageEmployees: permissions.includes(Permissions.ViewAllEmployees),
        /**
         * Whether the caller may file leave against someone other than
         * themselves. Mirrors LeaveController::resolveEmployee, which only
         * honours a submitted employee_id for holders of ViewAllBalances.
         */
        canFileForOthers: permissions.includes(Permissions.ViewAllBalances),
    };
}
