import { format, parseISO } from 'date-fns';
import type { ReactNode } from 'react';

/** The three buckets a pass slip can be in, mirroring PassSlip::approvalState(). */
export type PassSlipStatus = 'pending' | 'approved' | 'declined';

/**
 * The shape both pass slip screens read.
 *
 * Kept in one place because the review queue and "my slips" render the same
 * record from two very different angles — HR deciding on it, the personnel
 * watching it — and the two drifting apart is what would make the same slip look
 * like two different things.
 */
export type PassSlipView = {
    id: number;
    printed_name: string | null;
    position: string | null;
    usd: string | null;
    request_type: string;
    date_accomplished: string | null;
    date_requested: string | null;
    expected_departure: string | null;
    expected_arrival: string | null;
    actual_arrival: string | null;
    destination: string;
    purpose: string;
    status: PassSlipStatus;
    recommended_by: number | null;
    recommended_by_name: string | null;
    assigned_to: number | null;
    assigned_to_name: string | null;
    reviewed_at: string | null;
    review_remarks: string | null;
    reviewer_name: string | null;
};

export function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return format(parseISO(value), 'MMM d, yyyy h:mm a');
}

export function formatDate(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return format(parseISO(value), 'MMM d, yyyy');
}

/**
 * Tailwind classes for a status pill.
 *
 * Kept as class strings rather than Badge variants because the tone has to be
 * applied to more than the pill — the card's left border and the icon circle
 * share it, which is what stops a list of cards reading as a wall of grey.
 */
export const STATUS_TONE: Record<PassSlipStatus, string> = {
    pending: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    approved: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    declined: 'text-destructive bg-destructive/10',
};

export const STATUS_BORDER: Record<PassSlipStatus, string> = {
    pending: 'border-l-amber-400',
    approved: 'border-l-emerald-500',
    declined: 'border-l-destructive',
};

/**
 * One labelled fact in a detail grid.
 *
 * A `—` is rendered explicitly rather than omitted so the grid keeps its shape
 * and a personnel can see that a field exists but has not been filled in,
 * which is different from the field not applying.
 */
export function DetailField({
    label,
    value,
    icon,
}: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
                {icon}
                {label}
            </span>
            <span className="text-sm">{value}</span>
        </div>
    );
}

/**
 * The planned-vs-actual pair.
 *
 * The filer states when they expect to leave and return; HR records the actual
 * moment of return. Shown as one comparable unit rather than three loose values,
 * so the gap between planned and actual reads at a glance — and an arrival that
 * has not been recorded yet reads as a deliberate gap rather than a blank cell
 * nobody thought to fill.
 */
export function TravelTimes({
    expectedDeparture,
    expectedArrival,
    actualArrival,
    actions,
}: {
    expectedDeparture: string | null;
    expectedArrival: string | null;
    actualArrival: string | null;
    /** HR correction controls, rendered inside the panel. */
    actions?: ReactNode;
}) {
    return (
        <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <DetailField
                    label="Expected departure"
                    value={formatDateTime(expectedDeparture)}
                />

                <DetailField
                    label="Expected arrival"
                    value={
                        expectedArrival ? (
                            formatDateTime(expectedArrival)
                        ) : (
                            // Not a gap — an early-out slip has no planned
                            // return by design, and saying so stops a reviewer
                            // reading it as an unfilled field.
                            <span className="text-muted-foreground text-xs italic">
                                Early out — no return expected
                            </span>
                        )
                    }
                />

                <DetailField
                    label="Actual arrival"
                    value={
                        actualArrival ? (
                            formatDateTime(actualArrival)
                        ) : (
                            <span className="text-muted-foreground text-xs italic">
                                Not yet recorded
                            </span>
                        )
                    }
                />
            </div>

            {actions}
        </div>
    );
}