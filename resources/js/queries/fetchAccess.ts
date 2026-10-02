import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import roles from '@/routes/roles';

export type RoleOption = {
    name: string;
    label: string;
    description: string;
    permission_count: number;
};

export type UserAccess = {
    id: number;
    name: string;
    email: string;
    /** Roles the user holds. */
    roles: string[];
    /** Permissions granted directly to the user, not via a role. */
    permissions: string[];
    /** Everything the user can actually do, roles and direct grants combined. */
    effective: string[];
};

export type AccessCatalogue = {
    roles: RoleOption[];
    /** Permission names bucketed by section, for rendering grouped checkboxes. */
    permissions: Record<string, string[]>;
    counts: { roles: number; permissions: number };
};

/**
 * The role/permission catalogue. Static for the life of the page, so it is
 * fetched once and never invalidated — an admin editing access should not have
 * the option list reshuffle underneath them.
 */
export function getAccessCatalogue() {
    return queryOptions({
        queryKey: ['accessCatalogue'],
        queryFn: async (): Promise<AccessCatalogue> => {
            const res = await axios.get(roles.data().url);

            return res.data;
        },
        staleTime: Infinity,
    });
}

/**
 * The user picker, optionally narrowed by a name/email search.
 */
export function getUserAccess(search = '') {
    return queryOptions({
        queryKey: ['userAccess', search],
        queryFn: async (): Promise<UserAccess[]> => {
            const res = await axios.get(roles.users().url, {
                params: search ? { search } : {},
            });

            return res.data.users;
        },
    });
}