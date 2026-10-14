import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    ClipboardCheck,
    Filter,
    PencilLine,
    Search,
    Stamp,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import PaginationButton from '@/components/Leave/PaginationButton';
import SelectCombobox from '@/components/Leave/SelectCombobox';
import { ArrivalControl } from '@/components/PassSlip/ArrivalControl';
import type { PassSlipView } from '@/components/PassSlip/fields';
import { SignatoryLines, SummaryCard } from '@/components/PassSlip/SummaryCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import slipReviews from '@/routes/slip-reviews';
import { Permissions } from '@/types/auth';

type RequestsPage = {
    data: PassSlipView[];
    current_page: number;
    last_page: number;
    total: number;
};

type Signatory = { id: number; name: string };

type Props = {
    requests: RequestsPage;
    counts: Record<string, number>;
    filters: { status: string };
    signatories: Signatory[];
};

const QUEUE_PROPS = ['requests', 'counts', 'filters'];

/**
 * A decision also flashes "Approved …", and `flash` is a shared prop — so it
 * has to be named explicitly or the partial reload would leave it out and the
 * notification would silently disappear.
 */
const DECISION_PROPS = [...QUEUE_PROPS, 'flash'];

const STATUS_TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
] as const;

export default function PassSlipReviewQueue({
    requests,
    counts,
    filters,
    signatories,
}: Props) {
    const { can } = usePermissions();
    const canReview = can(Permissions.ReviewPassSlips);
    const canEditTravelTimes = can(Permissions.ManagePassSlips);

    const [notes, setNotes] = useState<Record<number, string>>({});
    const [processing, setProcessing] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const status = filters.status ?? 'pending';
    const total = requests.total ?? 0;

    /**
     * Client-side search over the current page only.
     *
     * Deliberately not server-side: it narrows what's already on screen to help
     * an officer scan a page of slips, and the counts and pagination deliberately
     * keep reflecting the full result set — so the header never claims "3 slips"
     * while showing one of eight. A search that silently disagrees with the
     * pagination is worse than no search.
     */
    const visible = useMemo(() => {
        // Read inside the callback rather than depending on the `rows` fallback
        // above, which is a fresh array on every render and would defeat the
        // memo entirely.
        const all = requests.data ?? [];
        const term = search.trim().toLowerCase();

        if (!term) {
            return all;
        }

        return all.filter((row) =>
            [
                row.printed_name,
                row.position,
                row.usd,
                row.destination,
                row.purpose,
            ]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(term)),
        );
    }, [requests.data, search]);

    function decide(id: number, decision: 'approve' | 'decline') {
        const note = notes[id] ?? '';

        // Mirrors the server rule in PassSlipReviewRequest: declining without a
        // reason leaves the personnel unable to tell what to do next, so it is
        // refused here rather than bounced back as a validation error.
        if (decision === 'decline' && note.trim() === '') {
            setError('A reason is required to decline a pass slip.');

            return;
        }

        setProcessing(id);
        setError(null);

        const url =
            decision === 'approve'
                ? slipReviews.approve(id).url
                : slipReviews.decline(id).url;

        router.post(
            url,
            { review_remarks: note || null },
            {
                preserveState: true,
                preserveScroll: true,
                only: DECISION_PROPS,
                onSuccess: () =>
                    setNotes((prev) => {
                        const next = { ...prev };
                        delete next[id];

                        return next;
                    }),
                onFinish: () => setProcessing(null),
            },
        );
    }

    function reassign(
        id: number,
        field: 'recommended_by' | 'assigned_to',
        userId: number,
    ) {
        setProcessing(id);

        router.patch(
            slipReviews.signatories(id).url,
            { [field]: userId },
            {
                preserveState: true,
                preserveScroll: true,
                only: QUEUE_PROPS,
                onFinish: () => setProcessing(null),
            },
        );
    }

    /**
     * Saves HR's correction of the expected departure and the actual arrival.
     *
     * Only the two editable fields are sent. Sending the whole slip back would
     * hand the endpoint everything it does not need to accept, and the route
     * rejects anything beyond those two anyway.
     */
    function saveTravelTimes(
        id: number,
        expectedDeparture: string,
        actualArrival: string,
    ) {
        setProcessing(id);
        setError(null);

        router.patch(
            slipReviews.travel_times(id).url,
            {
                expected_departure: expectedDeparture,
                actual_arrival: actualArrival || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: DECISION_PROPS,
                onFinish: () => setProcessing(null),
            },
        );
    }

    /**
     * Records that the personnel is back, at whatever time the server says it is.
     *
     * Shares the travel-times reload because it changes the same record: the
     * card's border, its pill and the arrival strip all depend on
     * `actual_arrival`, and a partial reload of only the queue props would leave
     * them stale.
     */
    function recordArrival(id: number) {
        setProcessing(id);
        setError(null);

        router.post(
            slipReviews.arrival(id).url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: DECISION_PROPS,
                onFinish: () => setProcessing(null),
            },
        );
    }

    function goToPage(page: number) {
        router.get(slipReviews.index({ query: { status, page } }).url, {
            preserveState: true,
            preserveScroll: true,
            only: QUEUE_PROPS,
            replace: true,
        });
    }

    function switchStatus(next: string) {
        if (next === status) {
            return;
        }

        setError(null);
        router.get(
            slipReviews.index({ query: { status: next, page: 1 } }).url,
            {
                preserveState: true,
                preserveScroll: true,
                only: QUEUE_PROPS,
                replace: true,
            },
        );
    }

    const items = signatories.map((person) => ({
        value: person.id,
        label: person.name,
    }));

    return (
        <>
            <Head title="Pass Slip Reviews" />

            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <div className="space-y-1.5">
                    <h1 className="text-md flex items-center gap-1 font-bold">
                        <ClipboardCheck className="size-4" />
                        Pass slips
                    </h1>
                    <h2 className="text-4xl font-bold dark:text-accent">
                        {status === 'pending'
                            ? 'Awaiting decision'
                            : status === 'approved'
                              ? 'Approved slips'
                              : 'Declined slips'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Pass slips filed by personnel. Only admin and HR can
                        approve or decline.
                    </p>
                </div>

                <Tabs value={status} onValueChange={switchStatus}>
                    <TabsList variant="line">
                        {STATUS_TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                                <Badge
                                    variant="secondary"
                                    className="ml-2 rounded-full px-1.5 py-0 text-[10px]"
                                >
                                    {counts?.[tab.value] ?? 0}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {error && (
                    <p className="text-sm font-medium text-destructive">
                        {error}
                    </p>
                )}

                {/* Search sits above the results rather than in a toolbar card:
                    the cards below are the tool, and a framed search box above a
                    frameless list just adds a seam to scan past. */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search this page by name, destination or purpose"
                            className="pl-9"
                        />
                    </div>

                    {search && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearch('')}
                        >
                            <X className="size-4" />
                            Clear
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="size-3.5" />
                    {search
                        ? `Showing ${visible.length} of ${total} on this page`
                        : `${total} ${total === 1 ? 'pass slip' : 'pass slips'}`}
                </div>

                {visible.length === 0 ? (
                    <EmptyState searching={Boolean(search)} />
                ) : (
                    // A single column, not a grid: each card carries a decision
                    // panel with two comboboxes and a note field, so two across
                    // would halve the width of every control inside.
                    <div className="flex flex-col gap-4">
                        {visible.map((row) => (
                            <SummaryCard
                                key={row.id}
                                slip={row}
                                leading="request"
                                travelTimesActions={
                                    canEditTravelTimes ? (
                                        <TravelTimesEditor
                                            slip={row}
                                            onSave={saveTravelTimes}
                                        />
                                    ) : undefined
                                }
                                arrivalActions={
                                    // Only on the decided tabs: a slip still awaiting a
                                    // decision has no return to record yet, and the
                                    // strip would only repeat that back.
                                    canEditTravelTimes &&
                                    row.status !== 'pending' ? (
                                        <ArrivalControl
                                            slip={row}
                                            canRecord
                                            pending={processing === row.id}
                                            onRecordArrival={() =>
                                                recordArrival(row.id)
                                            }
                                        />
                                    ) : undefined
                                }
                            >
                                <SignatoryLines
                                    recommendedBy={row.recommended_by_name}
                                    assignedTo={row.assigned_to_name}
                                >
                                    {/* Both signature lines are editable:
                                        a section may have no head appointed, or
                                        the named official may have been away. */}
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <SelectCombobox
                                            items={items}
                                            value={row.recommended_by ?? null}
                                            onValueChange={(value) =>
                                                reassign(
                                                    row.id,
                                                    'recommended_by',
                                                    Number(value),
                                                )
                                            }
                                            placeholder="Recommending approval"
                                            emptyText="No signatories."
                                        />

                                        <SelectCombobox
                                            items={items}
                                            value={row.assigned_to ?? null}
                                            onValueChange={(value) =>
                                                reassign(
                                                    row.id,
                                                    'assigned_to',
                                                    Number(value),
                                                )
                                            }
                                            placeholder="Approved by"
                                            emptyText="No signatories."
                                        />
                                    </div>
                                </SignatoryLines>

                                {status === 'pending' ? (
                                    <div className="flex flex-col gap-3 border-t pt-4">
                                        <Textarea
                                            value={notes[row.id] ?? ''}
                                            onChange={(event) =>
                                                setNotes((prev) => ({
                                                    ...prev,
                                                    [row.id]:
                                                        event.target.value,
                                                }))
                                            }
                                            placeholder="Note (required to decline)"
                                            className="min-h-20 text-sm"
                                            disabled={!canReview}
                                        />

                                        <div className="flex flex-wrap justify-end gap-2">
                                            <Button
                                                onClick={() =>
                                                    decide(row.id, 'decline')
                                                }
                                                variant="destructive"
                                                disabled={
                                                    processing === row.id ||
                                                    !canReview
                                                }
                                            >
                                                Decline
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    decide(row.id, 'approve')
                                                }
                                                disabled={
                                                    processing === row.id ||
                                                    !canReview
                                                }
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <DecisionOutcome slip={row} />
                                )}
                            </SummaryCard>
                        ))}
                    </div>
                )}

                {(requests.last_page ?? 1) > 1 && (
                    <PaginationButton
                        currentPage={requests.current_page ?? 1}
                        lastPage={requests.last_page ?? 1}
                        onPageChange={goToPage}
                    />
                )}
            </div>
        </>
    );
}

/**
 * HR's correction form for the two fields HR owns.
 *
 * The Expected Departure is the filer's to state, but HR corrects it when it was
 * recorded wrongly. The Actual Arrival is HR's alone — the filer never enters
 * it, so this is the only place it can be set. The Expected Arrival is shown in
 * the read-only panel above and cannot be changed here.
 *
 * Collapsed by default so twenty cards are not twenty open forms.
 */
function TravelTimesEditor({
    slip,
    onSave,
}: {
    slip: PassSlipView;
    onSave: (
        id: number,
        expectedDeparture: string,
        actualArrival: string,
    ) => void;
}) {
    const [open, setOpen] = useState(false);

    // Seeded from the stored values so "Save" without an edit is a no-op rather
    // than a silent rewrite, and so datetime-local gets the format it expects.
    const [departure, setDeparture] = useState(() =>
        toDatetimeLocal(slip.expected_departure),
    );
    const [arrival, setArrival] = useState(() =>
        toDatetimeLocal(slip.actual_arrival),
    );

    if (!open) {
        return (
            <div className="flex items-center justify-between gap-2 border-t pt-3">
                <span className="text-xs text-muted-foreground">
                    Expected departure is the filer&apos;s; the actual arrival
                    is recorded by HR.
                </span>

                <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
                    <PencilLine className="size-3.5" />
                    {slip.actual_arrival ? 'Correct times' : 'Record arrival'}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3 border-t pt-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">
                        Expected time of departure
                    </label>
                    <Input
                        type="datetime-local"
                        value={departure}
                        onChange={(event) => setDeparture(event.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">
                        Actual time of arrival
                    </label>
                    <Input
                        type="datetime-local"
                        value={arrival}
                        onChange={(event) => setArrival(event.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                        setDeparture(toDatetimeLocal(slip.expected_departure));
                        setArrival(toDatetimeLocal(slip.actual_arrival));
                        setOpen(false);
                    }}
                >
                    Cancel
                </Button>

                <Button
                    size="sm"
                    onClick={() => onSave(slip.id, departure, arrival)}
                >
                    Save
                </Button>
            </div>
        </div>
    );
}

/**
 * `YYYY-MM-DDTHH:mm` for a datetime-local input.
 *
 * The values arrive as ISO datetimes from the server, which already parses;
 * slicing to 16 characters avoids a needless format/reparse round trip.
 */
function toDatetimeLocal(value: string | null) {
    return value ? value.slice(0, 16) : '';
}

function EmptyState({ searching }: { searching: boolean }) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-5 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <Stamp className="size-5" />
            </div>
            <p className="text-sm font-medium">
                {searching
                    ? 'No slips match that search'
                    : 'Nothing here right now'}
            </p>
            <p className="text-xs text-muted-foreground">
                {searching
                    ? 'Try a different name, destination or purpose.'
                    : 'Newly filed slips will appear here for a decision.'}
            </p>
        </div>
    );
}

/**
 * Read-only decision trail for a slip that has already been decided.
 */
function DecisionOutcome({ slip }: { slip: PassSlipView }) {
    const approved = slip.status === 'approved';

    return (
        <div
            className={`rounded-lg border p-4 text-sm ${
                approved
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-destructive/30 bg-destructive/5'
            }`}
        >
            <span className="font-medium capitalize">{slip.status}</span>

            {slip.reviewed_at && (
                <span className="ml-2 text-xs text-muted-foreground">
                    {format(parseISO(slip.reviewed_at), 'MMM d, yyyy h:mm a')}
                    {slip.reviewer_name ? ` · ${slip.reviewer_name}` : ''}
                </span>
            )}

            {slip.review_remarks && (
                <p className="mt-1.5 text-xs text-muted-foreground italic">
                    “{slip.review_remarks}”
                </p>
            )}
        </div>
    );
}

PassSlipReviewQueue.layout = {
    breadcrumbs: [{ title: 'Pass Slip Reviews', href: slipReviews.index() }],
};
