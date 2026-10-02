import { Head, Link, router } from '@inertiajs/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Info,
    KeyRound,
    Save,
    Search,
    ShieldCheck,
    UserCog,
    Users2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/use-permissions';
import {
    getAccessCatalogue,
    getUserAccess
    
    
    
} from '@/queries/fetchAccess';
import type {AccessCatalogue, RoleOption, UserAccess} from '@/queries/fetchAccess';
import roleRoutes from '@/routes/roles';
import userRoles from '@/routes/users/roles';
import usersInfo from '@/routes/users_info';

export default function RoleManager() {
    const { can } = usePermissions();

    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(search.trim()), 250);

        return () => clearTimeout(timer);
    }, [search]);

    const { data: catalogue } = useQuery(getAccessCatalogue());
    const { data: userList, isFetching } = useQuery(getUserAccess(debounced));

    const selected =
        userList?.find((candidate) => candidate.id === selectedId) ?? null;

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <div className="space-y-1.5">
                    <h4 className="text-md flex items-center gap-1 font-bold">
                        <UserCog className="size-4" />
                        Access control
                    </h4>
                    <h1 className="text-4xl font-bold dark:text-accent">
                        Roles &amp; Permissions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pick a user, then decide what they may reach. A role
                        bundles permissions; a direct grant adds a single extra
                        ability on top of it.
                    </p>
                </div>

                <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3">
                    <StatCard
                        icon={<ShieldCheck />}
                        label="Roles defined"
                        value={catalogue?.counts.roles ?? 0}
                        tone="sky"
                    />
                    <StatCard
                        icon={<KeyRound />}
                        label="Assignable permissions"
                        value={catalogue?.counts.permissions ?? 0}
                        tone="violet"
                    />
                    <StatCard
                        icon={<Users2 />}
                        label="Users listed"
                        value={userList?.length ?? 0}
                        tone="emerald"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <Card className="h-fit gap-0 overflow-hidden py-0 shadow-sm">
                        <CardHeader className="border-b bg-muted/20 px-5 py-4">
                            <CardTitle className="text-base">
                                Select a user
                            </CardTitle>
                            <CardDescription>
                                Search by name or email address.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 p-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search users"
                                    className="pl-9"
                                />
                            </div>

                            {isFetching && userList === undefined ? (
                                <div className="space-y-2">
                                    {[0, 1, 2, 3].map((row) => (
                                        <Skeleton
                                            key={row}
                                            className="h-14 w-full"
                                        />
                                    ))}
                                </div>
                            ) : userList?.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No users match that search.
                                </p>
                            ) : (
                                <div className="max-h-[32rem] space-y-1 overflow-y-auto">
                                    {userList?.map((candidate) => (
                                        <button
                                            key={candidate.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedId(candidate.id)
                                            }
                                            className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                                                candidate.id === selectedId
                                                    ? 'border-sky-500 bg-sky-500/10'
                                                    : 'border-transparent hover:bg-muted/60'
                                            }`}
                                        >
                                            <span className="block truncate text-sm font-medium">
                                                {candidate.name}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {candidate.email}
                                            </span>
                                            {candidate.roles.length > 0 && (
                                                <span className="mt-1.5 flex flex-wrap gap-1">
                                                    {candidate.roles.map(
                                                        (role) => (
                                                            <Badge
                                                                key={role}
                                                                variant="secondary"
                                                                className="text-[10px]"
                                                            >
                                                                {role}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="min-w-0 gap-0 overflow-hidden py-0 shadow-sm">
                        <CardHeader className="border-b bg-muted/20 px-5 py-4">
                            <CardTitle className="text-base">
                                {selected ? selected.name : 'Nothing selected'}
                            </CardTitle>
                            <CardDescription>
                                {selected
                                    ? selected.email
                                    : 'Choose a user on the left to edit their access.'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-5">
                            {selected ? (
                                // Keyed on the id so switching users remounts the
                                // editor with that person's saved access, instead
                                // of syncing draft state through an effect.
                                <AccessEditor
                                    key={selected.id}
                                    user={selected}
                                    catalogue={catalogue}
                                    canAssign={can('assign roles')}
                                />
                            ) : (
                                <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
                                    <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                        <UserCog className="size-5" />
                                    </div>
                                    <p className="text-sm font-medium">
                                        No user selected
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Their roles and permissions will appear
                                        here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

type AccessEditorProps = {
    user: UserAccess;
    catalogue: AccessCatalogue | undefined;
    canAssign: boolean;
};

/**
 * Edits one user's access.
 *
 * Mounted with a `key` of the user id, so its draft state is seeded from props
 * once on mount and a failed save leaves the admin's unsaved choices intact.
 */
function AccessEditor({ user, catalogue, canAssign }: AccessEditorProps) {
    const queryClient = useQueryClient();
    const { isSuperAdmin, currentUserId } = usePermissions();

    const [draftRoles, setDraftRoles] = useState<string[]>(user.roles);
    const [draftPermissions, setDraftPermissions] = useState<string[]>(
        user.permissions,
    );

    const dirty =
        !sameSet(draftRoles, user.roles) ||
        !sameSet(draftPermissions, user.permissions);

    function toggle(
        value: string,
        list: string[],
        setter: (next: string[]) => void,
    ) {
        setter(
            list.includes(value)
                ? list.filter((item) => item !== value)
                : [...list, value],
        );
    }

    function save() {
        router.put(
            userRoles.update({ user: user.id }).url,
            { roles: draftRoles, permissions: draftPermissions },
            {
                preserveScroll: true,
                onSuccess: () =>
                    // The picker rows carry the saved state, so both have to be
                    // refetched for the badge and "via role" hints to catch up.
                    queryClient.invalidateQueries({ queryKey: ['userAccess'] }),
            },
        );
    }

    return (
        <div className="space-y-6">
            <section className="space-y-3">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400" />
                        Roles
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        A role grants the whole set of permissions it bundles.
                    </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    {(catalogue?.roles ?? []).map((role: RoleOption) => (
                        <label
                            key={role.name}
                            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                                draftRoles.includes(role.name)
                                    ? 'border-sky-500 bg-sky-500/5'
                                    : 'hover:bg-muted/40'
                            } ${canAssign ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                        >
                            <Checkbox
                                checked={draftRoles.includes(role.name)}
                                disabled={!canAssign}
                                onCheckedChange={() =>
                                    toggle(
                                        role.name,
                                        draftRoles,
                                        setDraftRoles,
                                    )
                                }
                                className="mt-0.5"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-medium">
                                    {role.label}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    {role.description}
                                </span>
                                <span className="mt-1 block text-[11px] text-muted-foreground">
                                    {role.permission_count} permissions
                                </span>
                            </span>
                        </label>
                    ))}
                </div>
            </section>

            <Separator />

            <section className="space-y-4">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <KeyRound className="size-4 text-violet-600 dark:text-violet-400" />
                        Direct permissions
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Granted straight to this user, on top of whatever their
                        roles already give them.
                    </p>
                </div>

                {Object.entries(catalogue?.permissions ?? {}).map(
                    ([group, permissions]) => (
                        <div key={group} className="space-y-2">
                            <Label className="text-xs tracking-wide uppercase">
                                {group}
                            </Label>

                            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                {permissions.map((permission) => {
                                    const granted =
                                        draftPermissions.includes(permission);

                                    // Active via a role rather than a direct
                                    // grant, so the row says where it comes from.
                                    const inherited =
                                        !granted &&
                                        user.effective.includes(permission);

                                    return (
                                        <label
                                            key={permission}
                                            className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors ${
                                                granted
                                                    ? 'border-violet-500 bg-violet-500/5'
                                                    : 'hover:bg-muted/40'
                                            } ${canAssign ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                                        >
                                            <Checkbox
                                                checked={granted}
                                                disabled={!canAssign}
                                                onCheckedChange={() =>
                                                    toggle(
                                                        permission,
                                                        draftPermissions,
                                                        setDraftPermissions,
                                                    )
                                                }
                                            />
                                            <span className="min-w-0 flex-1 truncate">
                                                {permission}
                                            </span>
                                            {inherited && (
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 text-[10px]"
                                                >
                                                    via role
                                                </Badge>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ),
                )}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <p className="flex max-w-md items-start gap-2 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                        Baseline self-service permissions are granted to every
                        signed-in user and cannot be revoked here.
                    </span>
                </p>

                <div className="flex shrink-0 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={!dirty}
                        onClick={() => {
                            setDraftRoles(user.roles);
                            setDraftPermissions(user.permissions);
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        type="button"
                        disabled={!dirty || !canAssign}
                        onClick={save}
                    >
                        <Save className="size-4" />
                        Save access
                    </Button>
                </div>
            </div>

            {isSuperAdmin && user.id !== currentUserId && (
                <p className="text-xs text-muted-foreground">
                    <Link
                        href={usersInfo.show(user.id)}
                        className="underline underline-offset-2"
                    >
                        View {user.name}&rsquo;s employee record
                    </Link>
                </p>
            )}
        </div>
    );
}

function sameSet(a: string[], b: string[]) {
    return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

function StatCard({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    tone: 'sky' | 'violet' | 'emerald';
}) {
    const tones = {
        sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    };

    return (
        <div className="flex items-center gap-3 rounded-lg bg-background/60 p-3">
            <div className={`rounded-md p-2 [&>svg]:size-4 ${tones[tone]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="text-sm font-semibold tabular-nums">{value}</p>
            </div>
        </div>
    );
}

RoleManager.layout = {
    breadcrumbs: [{ title: 'Roles & Permissions', href: roleRoutes.index() }],
};