import { ArrowRight, CheckCircle2, Clock, LogIn, XCircle } from 'lucide-react';
import { slipVisualState } from '@/components/PassSlip/fields';
import type { PassSlipView } from '@/components/PassSlip/fields';
import { formatDateTime, formatTime, Tag } from './fields';
import { ListingCard, SaveToggle } from './ListingCard';

/**
 * A filed pass slip, as a listing card.
 *
 * Same shell as the leave card, but the figure is a *time* rather than a day
 * count — on a slip the thing a reviewer compares across twenty rows is when the
 * person is leaving, not how long they are away, so the departure clock takes the
 * footer's headline slot and the destination drops to the secondary line.
 */

const REQUEST_TYPE_LABELS: Record<string, string> = {
    official: 'Official Business',
    personal: 'Personal Business',
};

/** Mirrors `slipVisualState`, widened to the raw decision for the icon. */
const DECISION_ICON = {
    pending: Clock,
    approved: CheckCircle2,
    declined: XCircle,
    arrived: LogIn,
} as const;

const DECISION_TONE = {
    pending: 'pending',
    approved: 'approved',
    declined: 'declined',
    arrived: 'neutral',
} as const;

const DECISION_LABEL = {
    pending: 'Pending',
    approved: 'Approved',
    declined: 'Declined',
    arrived: 'Arrived',
} as const;

export function PassSlipListingCard({
    slip,
    saved,
    onToggleSave,
    onOpen,
}: {
    slip: PassSlipView;
    saved?: boolean;
    onToggleSave?: () => void;
    onOpen?: () => void;
}) {
    const state = slipVisualState(slip);
    const Icon = DECISION_ICON[state];
    const departed = Boolean(slip.actual_arrival);

    return (
        <ListingCard
            icon={Icon}
            tone={DECISION_TONE[state]}
            eyebrow={
                <>
                    <span className="font-medium text-foreground/80">
                        {slip.printed_name ?? 'Unknown'}
                    </span>
                    <span aria-hidden>·</span>
                    {/* The clock time only: the slip's own date is the
                        figure's secondary line, so printing it here too would
                        say the same thing twice in one card. */}
                    <span title={formatDateTime(slip.expected_departure)}>
                        {slip.date_requested
                            ? `filed ${formatTime(slip.date_requested)}`
                            : 'undated'}
                    </span>
                </>
            }
            title={slip.destination}
            titleHint={`${slip.destination} — ${slip.purpose}`}
            tags={
                <>
                    <Tag>
                        {REQUEST_TYPE_LABELS[slip.request_type] ??
                            slip.request_type}
                    </Tag>
                    <Tag>{DECISION_LABEL[state]}</Tag>
                </>
            }
            trailing={
                saved !== undefined && (
                    <SaveToggle saved={saved} onToggle={onToggleSave} />
                )
            }
            figure={formatTime(slip.expected_departure)}
            figureDetail={formatDateTime(slip.expected_departure)}
            footerExtra={
                <span className="mt-1 line-clamp-1 text-xs text-muted-foreground italic">
                    {departed
                        ? `Returned ${formatDateTime(slip.actual_arrival)}`
                        : slip.purpose}
                </span>
            }
            actionLabel="Open"
            actionIcon={ArrowRight}
            onAction={onOpen}
        />
    );
}
