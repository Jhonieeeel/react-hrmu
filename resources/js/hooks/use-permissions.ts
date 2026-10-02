import { usePage } from '@inertiajs/react';
import { Permissions, Roles   } from '@/types/auth';
import type {Permission, Role} from '@/types/auth';

/**
 * Client-side view of the permissions the server shares on every page.
 *
 * This is a convenience for hiding UI the backend would reject anyway — it is
 * never the security boundary. Every route and controller is independently
 * authorised server-side.
 */
export function usePermissions() {
    const auth = usePage().props.auth as
        | { user?: { id?: number }; permissions: string[]; roles: string[] }
        | undefined;

    const permissions = auth?.permissions ?? [];
    const roles = auth?.roles ?? [];

    return {
        permissions,
        roles,
        currentUserId: auth?.user?.id ?? null,
        can: (permission: Permission | string) => permissions.includes(permission),
        hasRole: (role: Role | string) => roles.includes(role),
        isSuperAdmin: roles.includes(Roles.SuperAdmin),
        canReviewLeave: permissions.includes(Permissions.ReviewLeave),
        canManageEmployees: permissions.includes(Permissions.ViewAllEmployees),
    };
}
