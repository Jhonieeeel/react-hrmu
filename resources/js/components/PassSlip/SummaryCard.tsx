import {
    BadgeCheck,
    BriefcaseBusiness,
    CalendarClock,
    CheckCircle2,
    Clock,
    FileText,
    House,
    LogIn,
    MapPin,
    PenLine,
    Stamp,
    Ticket,
    UserRound,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
    DetailField,
    formatDate,
    formatDateTime,
    formatTime,
    slipVisualState,
    TravelTimes,
    VISUAL_BORDER,
    VISUAL_TONE,
} from './fields';
import type { PassSlipView } from './fields';
import type { ComponentType } from 'react';

/**
 * The read view of a single pass slip, shared by both screens.
 *
 * The full form fields are always in the DOM and simply clipped by
 * CollapsibleContent rather than mounted conditionally, so a card expands
 * without the record re-rendering from scratch.
 *
 * `highlight` decides which line leads. On the review queue that is the
 * destination and purpose, because that is what HR is deciding on. On "my
 * slips" it is the outcome, because that is what the personnel came to see.
 */
export function SummaryCard({
    slip,
    leading = 'request',
    travelTimesActions,
    arrivalActions,
    children,
    className,
}: {
    slip: PassSlipView;
    /**
     * What the collapsed card leads with. The request itself is what an HR
     * officer is deciding on; the outcome is what the filer came back to read.
     */
    leading?: 'request' | 'outcome';
    /**
     * Rendered inside the travel times panel.
     *
     * Passed in rather than hardcoded so the correction UI stays an HR concern:
     * the card itself has no opinion about who may amend what, and the employee
     * screen simply omits this.
     */
    travelTimesActions?: React.ReactNode;
    /**
     * The "record the return" controls, handed straight to the arrival strip.
     * Omitted on the employee's own screen — see ArrivalControl for why the
     * read-only version is rendered there but the gesture is not.
     */
    arrivalActions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}) {
    const showOutcomeFirst = leading === 'outcome';
    const visualState = slipVisualState(slip);

    return (
        <Collapsible
            className={cn(
                'overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
                VISUAL_BORDER[visualState],
                'border-l-4',
                className,
            )}
        >
            <CollapsibleTrigger
                className="w-full px-5 py-4 text-left transition-colors hover:bg-muted/40"
                aria-label="Toggle slip details"
            >
                {showOutcomeFirst ? (
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-col gap-1">
                            <OutcomeLead slip={slip} />
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <TypeBadge slip={slip} />
                            <StatusPill slip={slip} />
                        </div>
                    </div>
                ) : (
                    <RequestLead slip={slip} />
                )}
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t">
                <CardContent className="space-y-5 px-5 py-4">
                    {/* The detail grid mirrors the physical form's field order,
                        so what HR reads here is the form in the same sequence. */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <DetailField
                            label="Date accomplished"
                            value={formatDate(slip.date_accomplished)}
                            icon={<Stamp className="size-3" />}
                        />

                        <DetailField
                            label="Date requested"
                            value={formatDate(slip.date_requested)}
                            icon={<CalendarClock className="size-3" />}
                        />

                        <DetailField
                            label="Destination"
                            value={slip.destination}
                            icon={<MapPin className="size-3" />}
                        />

                        <DetailField
                            label="Personnel"
                            value={
                                <span className="flex flex-col">
                                    <span>
                                        {slip.printed_name ?? 'Unknown'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {[slip.position, slip.usd]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </span>
                                </span>
                            }
                            icon={<UserRound className="size-3" />}
                        />
                    </div>

                    <DetailField
                        label="Purpose"
                        value={
                            <span className="text-sm text-muted-foreground">
                                {slip.purpose}
                            </span>
                        }
                        icon={<FileText className="size-3" />}
                    />

                    <TravelTimes
                        expectedDeparture={slip.expected_departure}
                        expectedArrival={slip.expected_arrival}
                        actualArrival={slip.actual_arrival}
                        actions={travelTimesActions}
                    />

                    {/* Sits below the panel rather than inside it: the panel is
                        the record of what was filed, this is the answer to
                        "are they back yet" and deserves its own block. */}
                    {arrivalActions}

                    {children}
                </CardContent>
            </CollapsibleContent>
        </Collapsible>
    );
}

/**
 * The review queue's collapsed header.
 *
 * A labelled two-column field grid rather than the three stacked lines the
 * employee's screen uses, because the two are answering different questions.
 * "My slips" is read by one person who wants the answer — the destination, then
 * what happened. The queue is scanned by an officer comparing twenty slips at
 * once, who needs to pick out *which* rows to open: who it is, when they are
 * leaving, whether it is already decided. Without labels that comparison is a
 * guessing game, because a bare "8:30 AM" in a stack of prose is not findable by
 * the eye.
 *
 * Reading order is row-wise — name against departure, purpose against type,
 * destination against status — so each pair answers one question about one slip.
 */
function RequestLead({ slip }: { slip: PassSlipView }) {
    return (
        <div className="w-full space-y-3">
            <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                <HeaderField label="Name" icon={UserRound}>
                    <span className="flex flex-col">
                        <span className="truncate">
                            {slip.printed_name ?? 'Unknown'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            {[slip.position, slip.usd]
                                .filter(Boolean)
                                .join(' · ') || '—'}
                        </span>
                    </span>
                </HeaderField>

                <HeaderField label="Departure time" icon={Clock}>
                    <span title={formatDateTime(slip.expected_departure)}>
                        {formatTime(slip.expected_departure)}
                    </span>
                </HeaderField>

                <HeaderField label="Purpose" icon={FileText}>
                    <span
                        className="line-clamp-1"
                        title={slip.purpose}
                    >
                        {slip.purpose}
                    </span>
                </HeaderField>

                <HeaderField label="Request type" icon={Ticket}>
                    <TypeBadge slip={slip} />
                </HeaderField>

                <HeaderField label="Destination" icon={MapPin}>
                    <span className="line-clamp-1" title={slip.destination}>
                        {slip.destination}
                    </span>
                </HeaderField>

                <HeaderField label="Status" icon={BadgeCheck}>
                    <StatusPill slip={slip} />
                </HeaderField>
            </div>

            {/* The filed date is metadata, not something to decide on, so it sits
                under the grid as a footnote rather than taking a cell that a
                decision-maker would scan past. "Date requested" is the filed
                date; "Date accomplished" stays in the panel below, since two
                dates side by side in a header would invite reading the wrong one
                as the departure. */}
            <p className="text-xs text-muted-foreground">
                Filed {formatDate(slip.date_requested)}
            </p>
        </div>
    );
}

/**
 * One labelled cell of the review header.
 *
 * A plain label above a value rather than the icon-led layout `DetailField`
 * uses: the icons already repeat between the six cells and at this density they
 * turn into noise, whereas the label is the thing being scanned for.
 */
function HeaderField({
    label,
    icon: Icon,
    children,
}: {
    label: string;
    icon: ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                <Icon className="size-3" />
                {label}
            </span>

            <span className="min-w-0 text-sm font-medium">{children}</span>
        </div>
    );
}

/**
 * Leads with the outcome and the decision note, because on "my slips" that is
 * the answer the personnel is looking for — the reason they clicked.
 */
function OutcomeLead({ slip }: { slip: PassSlipView }) {
    return (
        <>
            <span className="truncate font-medium">{slip.destination}</span>

            {slip.status === 'pending' ? (
                <span className="line-clamp-1 text-xs text-muted-foreground">
                    Awaiting approval · filed{' '}
                    {formatDate(slip.date_accomplished)}
                </span>
            ) : (
                <span className="line-clamp-1 text-xs text-muted-foreground">
                    {slip.status === 'approved' ? 'Approved' : 'Declined'}
                    {slip.reviewed_at
                        ? ` on ${formatDate(slip.reviewed_at)}`
                        : ''}
                    {slip.reviewer_name ? ` by ${slip.reviewer_name}` : ''}
                </span>
            )}

            {/* The return is a separate fact from the decision, so it gets its own
                line rather than being folded into the outcome text above. */}
            {slip.actual_arrival && (
                <span className="line-clamp-1 text-xs text-muted-foreground">
                    Arrived {formatDateTime(slip.actual_arrival)}
                </span>
            )}

            {slip.review_remarks && (
                <span className="line-clamp-2 text-xs text-muted-foreground italic">
                    “{slip.review_remarks}”
                </span>
            )}
        </>
    );
}

function TypeBadge({ slip }: { slip: PassSlipView }) {
    const official = slip.request_type === 'official';

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1',
                official
                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground',
            )}
        >
            {official ? (
                <BriefcaseBusiness className="size-3" />
            ) : (
                <House className="size-3" />
            )}
            {slip.request_type}
        </Badge>
    );
}

/**
 * The collapsed status pill.
 *
 * Reads the derived visual state rather than the raw decision, so an approved
 * slip whose personnel is already back is labelled "arrived" instead of
 * repeating "approved" on a card that is otherwise green like every other
 * approved one — the colour was already telling the story, the pill now agrees
 * with it.
 */
function StatusPill({ slip }: { slip: PassSlipView }) {
    const visualState = slipVisualState(slip);

    const Icon =
        visualState === 'arrived'
            ? LogIn
            : visualState === 'approved'
              ? CheckCircle2
              : visualState === 'declined'
                ? XCircle
                : Clock;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                VISUAL_TONE[visualState],
            )}
        >
            <Icon className="size-3" />
            {visualState}
        </span>
    );
}

/**
 * The two signature lines.
 *
 * Rendered as a labelled pair rather than two bare names, because on the form
 * these are not "assigned to" fields — they are two distinct signatories with
 * different roles, and the order matters.
 */
export function SignatoryLines({
    recommendedBy,
    assignedTo,
    children,
}: {
    recommendedBy: string | null;
    assignedTo: string | null;
    children?: React.ReactNode;
}) {
    return (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <DetailField
                    label="Recommending approval"
                    value={recommendedBy ?? 'Not assigned'}
                    icon={<PenLine className="size-3" />}
                />

                <DetailField
                    label="Approved by"
                    value={assignedTo ?? 'Not assigned'}
                    icon={<Stamp className="size-3" />}
                />
            </div>

            {children}
        </div>
    );
}
