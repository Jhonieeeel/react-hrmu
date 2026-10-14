import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { BriefcaseBusiness, House, Stamp } from 'lucide-react';
import { useMemo, useState } from 'react';
import SelectCombobox from '@/components/Leave/SelectCombobox';
import { ArrivalControl } from '@/components/PassSlip/ArrivalControl';
import type { PassSlipView } from '@/components/PassSlip/fields';
import { SignatoryLines, SummaryCard } from '@/components/PassSlip/SummaryCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import slip from '@/routes/slip';

/**
 * The personnel's own slips.
 *
 * Typed as the shared PassSlipView rather than a page-local shape so this screen
 * and the HR review queue render the same record from one definition — the two
 * used to have separate types for the same columns, which is how they would
 * have drifted.
 */
type MySlip = PassSlipView;

/** A person HR may file on behalf of, with the fields the form auto-fills. */
type Personnel = {
    id: number;
    name: string;
    position: string | null;
    usd: string;
    supervisor_id: number | null;
    supervisor_name: string | null;
};

type Signatory = { id: number; name: string };

type PageProp = {
    personnel: Personnel[];
    supervisors: Signatory[];
    mySlips: MySlip[];
    canFileForOthers: boolean;
};

/**
 * Counts per bucket, used for the "my slips" filter chips.
 *
 * Computed client-side because the whole history is already in props — there is
 * no page to count across, so a round trip would be pure overhead.
 */
function countByStatus(slips: MySlip[]) {
    return {
        all: slips.length,
        pending: slips.filter((s) => s.status === 'pending').length,
        approved: slips.filter((s) => s.status === 'approved').length,
        declined: slips.filter((s) => s.status === 'declined').length,
    };
}

export default function PassSlips({
    personnel,
    supervisors,
    mySlips,
    canFileForOthers,
}: PageProp) {
    const [tab, setTab] = useState('file');

    /**
     * Which bucket of the personnel's own history is on screen.
     *
     * A separate filter from the File/My tabs rather than reusing those: the tabs
     * answer "what am I doing" (filing vs. reviewing), this answers "which of my
     * slips" — collapsing them would hide half the history behind a click.
     */
    const [myStatusFilter, setMyStatusFilter] = useState('all');

    const form = useForm({
        user_id: '' as number | '',
        request_type: 'official',
        date_requested: format(new Date(), 'yyyy-MM-dd'),
        expected_departure: '',
        expected_arrival: '',
        destination: '',
        purpose: '',
        recommended_by: '' as number | '',
        assigned_to: '' as number | '',
        date_accomplished: format(new Date(), 'yyyy-MM-dd'),
    });

    /**
     * The personnel the slip is being filed for.
     *
     * An ordinary employee has no roster, so this resolves to themselves and the
     * name/position/unit fields lock. HR picks from the roster and the derived
     * fields follow the selection.
     */
    const selected = canFileForOthers
        ? personnel.find((person) => person.id === form.data.user_id)
        : undefined;

    const displayName = selected?.name ?? 'Your name';
    const displayPosition = selected?.position ?? 'From your personnel record';
    const displayUsd = selected?.usd ?? 'From your personnel record';
    const displaySupervisor =
        supervisors.find((person) => person.id === selected?.supervisor_id)
            ?.name ?? 'Section head';

    function submit(event: React.FormEvent) {
        event.preventDefault();

        form.post(slip.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData(
                    'date_requested',
                    format(new Date(), 'yyyy-MM-dd'),
                );
                form.setData(
                    'date_accomplished',
                    format(new Date(), 'yyyy-MM-dd'),
                );
            },
        });
    }

    function withdraw(id: number) {
        router.delete(slip.destroy(id).url, { preserveScroll: true });
    }

    const statusCounts = useMemo(() => countByStatus(mySlips), [mySlips]);

    const visibleSlips = useMemo(
        () =>
            myStatusFilter === 'all'
                ? mySlips
                : mySlips.filter((s) => s.status === myStatusFilter),
        [mySlips, myStatusFilter],
    );

    return (
        <>
            <Head title="Pass Slips" />

            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <div className="space-y-1.5">
                    <h1 className="text-4xl font-bold dark:text-accent">
                        Pass Slips
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Request permission to leave the office. A slip is
                        reviewed by HR before it counts.
                    </p>
                </div>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList variant="line">
                        <TabsTrigger value="file">File a slip</TabsTrigger>
                        <TabsTrigger value="mine">
                            My slips
                            <Badge
                                variant="secondary"
                                className="ml-2 rounded-full px-1.5 py-0 text-[10px]"
                            >
                                {mySlips.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {tab === 'file' ? (
                    <form onSubmit={submit}>
                        <FieldSet className="w-full space-y-6">
                            {/* ================================== */}
                            {/* Personnel */}
                            {/* ================================== */}
                            <Card className="gap-0 py-0 shadow-sm">
                                <CardHeader className="border-b bg-muted/20 px-5 py-4">
                                    <CardTitle className="text-base">
                                        Personnel
                                    </CardTitle>
                                    <CardDescription>
                                        Taken from the personnel record. Only HR
                                        can file on someone&apos;s behalf.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="px-5 py-5">
                                    <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel>
                                                Printed name
                                            </FieldLabel>
                                            <Input
                                                value={displayName}
                                                readOnly
                                                className="bg-muted/40"
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel>Position</FieldLabel>
                                            <Input
                                                value={displayPosition}
                                                readOnly
                                                className="bg-muted/40"
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Unit / Section / Division
                                            </FieldLabel>
                                            <Input
                                                value={displayUsd}
                                                readOnly
                                                className="bg-muted/40"
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Recommending approval
                                            </FieldLabel>
                                            <Input
                                                value={displaySupervisor}
                                                readOnly
                                                className="bg-muted/40"
                                            />
                                            <FieldDescription>
                                                The head of your section. HR can
                                                change this when filing.
                                            </FieldDescription>
                                        </Field>

                                        {canFileForOthers && (
                                            <Field className="md:col-span-2">
                                                <FieldLabel>
                                                    File on behalf of
                                                </FieldLabel>
                                                <SelectCombobox
                                                    items={personnel.map(
                                                        (person) => ({
                                                            value: person.id,
                                                            label:
                                                                person.position ??
                                                                person.name,
                                                        }),
                                                    )}
                                                    value={
                                                        form.data.user_id ||
                                                        null
                                                    }
                                                    onValueChange={(value) =>
                                                        form.setData(
                                                            'user_id',
                                                            Number(value),
                                                        )
                                                    }
                                                    placeholder="Select a personnel"
                                                />
                                            </Field>
                                        )}

                                        {canFileForOthers && (
                                            <>
                                                <Field>
                                                    <FieldLabel>
                                                        Recommending approval
                                                        (override)
                                                    </FieldLabel>
                                                    <SelectCombobox
                                                        items={supervisors.map(
                                                            (person) => ({
                                                                value: person.id,
                                                                label: person.name,
                                                            }),
                                                        )}
                                                        value={
                                                            form.data
                                                                .recommended_by ||
                                                            null
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            form.setData(
                                                                'recommended_by',
                                                                Number(value),
                                                            )
                                                        }
                                                        placeholder="Section head"
                                                    />
                                                </Field>

                                                <Field>
                                                    <FieldLabel>
                                                        Approving official
                                                    </FieldLabel>
                                                    <SelectCombobox
                                                        items={supervisors.map(
                                                            (person) => ({
                                                                value: person.id,
                                                                label: person.name,
                                                            }),
                                                        )}
                                                        value={
                                                            form.data
                                                                .assigned_to ||
                                                            null
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            form.setData(
                                                                'assigned_to',
                                                                Number(value),
                                                            )
                                                        }
                                                        placeholder="Next higher official"
                                                    />
                                                    <FieldDescription>
                                                        Optional — HR can assign
                                                        one later.
                                                    </FieldDescription>
                                                </Field>
                                            </>
                                        )}
                                    </FieldGroup>
                                </CardContent>
                            </Card>

                            {/* ================================== */}
                            {/* Request */}
                            {/* ================================== */}
                            <Card className="gap-0 py-0 shadow-sm">
                                <CardHeader className="border-b bg-muted/20 px-5 py-4">
                                    <CardTitle className="text-base">
                                        Request
                                    </CardTitle>
                                    <CardDescription>
                                        When you are leaving, where you are
                                        going, and why.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="px-5 py-5">
                                    <FieldGroup className="space-y-5">
                                        <Field>
                                            <FieldLabel>
                                                Type of request
                                            </FieldLabel>
                                            <ToggleGroup
                                                type="single"
                                                value={form.data.request_type}
                                                onValueChange={(value) => {
                                                    if (!value) {
                                                        return;
                                                    }

                                                    form.setData(
                                                        'request_type',
                                                        value,
                                                    );
                                                }}
                                                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                                            >
                                                <ToggleGroupItem
                                                    value="official"
                                                    className="h-11 justify-center gap-2 rounded-xl border border-emerald-500/30 text-emerald-600 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/10 data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white dark:text-emerald-400"
                                                >
                                                    <BriefcaseBusiness className="size-4" />
                                                    <span className="font-medium">
                                                        Official
                                                    </span>
                                                </ToggleGroupItem>

                                                <ToggleGroupItem
                                                    value="personal"
                                                    className="h-11 justify-center gap-2 rounded-xl border border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive/60 hover:bg-destructive/10 data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
                                                >
                                                    <House className="size-4" />
                                                    <span className="font-medium">
                                                        Personal
                                                    </span>
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </Field>

                                        <FieldGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            <Field>
                                                <FieldLabel>
                                                    Date requested
                                                </FieldLabel>
                                                <Input
                                                    type="date"
                                                    value={
                                                        form.data.date_requested
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'date_requested',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>

                                            {canFileForOthers && (
                                                <Field>
                                                    <FieldLabel>
                                                        Date accomplished
                                                    </FieldLabel>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            form.data
                                                                .date_accomplished
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'date_accomplished',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    <FieldDescription>
                                                        Back-fill only — this is
                                                        today by default.
                                                    </FieldDescription>
                                                </Field>
                                            )}
                                        </FieldGroup>

                                        <FieldGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            <Field>
                                                <FieldLabel>
                                                    Expected departure
                                                </FieldLabel>
                                                <Input
                                                    type="datetime-local"
                                                    value={
                                                        form.data
                                                            .expected_departure
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'expected_departure',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {form.errors
                                                    .expected_departure && (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .expected_departure
                                                        }
                                                    </p>
                                                )}
                                            </Field>

                                            <Field>
                                                <FieldLabel>
                                                    Expected arrival{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        (optional)
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    type="datetime-local"
                                                    value={
                                                        form.data
                                                            .expected_arrival
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'expected_arrival',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <FieldDescription>
                                                    Leave blank if you are just
                                                    leaving early.
                                                </FieldDescription>
                                                {form.errors
                                                    .expected_arrival && (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .expected_arrival
                                                        }
                                                    </p>
                                                )}
                                            </Field>
                                        </FieldGroup>

                                        <Field>
                                            <FieldLabel>Destination</FieldLabel>
                                            <Input
                                                placeholder="Pavilion / Office / Etc."
                                                value={form.data.destination}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'destination',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.destination && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.destination}
                                                </p>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Purpose</FieldLabel>
                                            <Textarea
                                                placeholder="Briefly describe why you need to be out..."
                                                className="min-h-28 resize-none"
                                                value={form.data.purpose}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'purpose',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.purpose && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.purpose}
                                                </p>
                                            )}
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="h-10 w-full rounded-lg px-5 sm:w-auto"
                                >
                                    {form.processing
                                        ? 'Submitting...'
                                        : 'File pass slip'}
                                </Button>
                            </div>
                        </FieldSet>
                    </form>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Status chips rather than another tab strip: these
                            filter an already-open view, and a second set of
                            underlined tabs next to the File/My tabs above reads
                            as two competing navigations. */}
                        {mySlips.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {(
                                    [
                                        ['all', 'All'],
                                        ['pending', 'Pending'],
                                        ['approved', 'Approved'],
                                        ['declined', 'Declined'],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setMyStatusFilter(value)}
                                        className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                                            myStatusFilter === value
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                    >
                                        {label}
                                        <span className="ml-1.5 tabular-nums opacity-70">
                                            {
                                                statusCounts[
                                                    value as keyof typeof statusCounts
                                                ]
                                            }
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {visibleSlips.length === 0 ? (
                            <EmptyMySlips
                                filtering={myStatusFilter !== 'all'}
                            />
                        ) : (
                            visibleSlips.map((row) => (
                                <MySlipCard
                                    key={row.id}
                                    slip={row}
                                    onWithdraw={withdraw}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

/**
 * One of the personnel's own slips.
 *
 * Leads with the outcome and the decision note, because that is what someone
 * opening "my slips" is looking for — the request they filed is the part they
 * remember. Actions sit inside the expanded card rather than on the collapsed
 * row so a stray click cannot withdraw a request.
 *
 * The arrival strip is here read-only. Recording the actual arrival is HR's
 * record, not the filer's claim — but the personnel is entitled to see whether
 * anybody has confirmed they came back, and silence reads as "nobody noticed".
 */
function MySlipCard({
    slip,
    onWithdraw,
}: {
    slip: MySlip;
    onWithdraw: (id: number) => void;
}) {
    return (
        <SummaryCard
            slip={slip}
            leading="outcome"
            arrivalActions={<ArrivalControl slip={slip} />}
        >
            <SignatoryLines
                recommendedBy={slip.recommended_by_name}
                assignedTo={slip.assigned_to_name}
            />

            {slip.status === 'pending' && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onWithdraw(slip.id)}
                    >
                        Withdraw request
                    </Button>
                </div>
            )}
        </SummaryCard>
    );
}

function EmptyMySlips({ filtering }: { filtering: boolean }) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-5 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <Stamp className="size-5" />
            </div>
            <p className="text-sm font-medium">
                {filtering ? 'Nothing in this bucket' : 'Nothing filed yet'}
            </p>
            <p className="text-xs text-muted-foreground">
                {filtering
                    ? 'Try another status filter.'
                    : 'Slips you file will appear here.'}
            </p>
        </div>
    );
}

PassSlips.layout = {
    breadcrumbs: [{ title: 'Pass Slips', href: slip.index() }],
};
