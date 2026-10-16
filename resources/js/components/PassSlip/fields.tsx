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
 * The clock time alone, for the review card header.
 *
 * A full timestamp there would repeat the slip's own date on every row of a
 * page of cards, so the header shows only the hour and minute and puts the exact
 * datetime in the field's tooltip — the date is a few pixels away in the panel
 * below for anyone who needs it.
 */
export function formatTime(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return format(parseISO(value), 'h:mm a');
}

/**
 * How far off the planned return an actual return was.
 *
 * The two times are the whole point of the travel panel, and a bare pair of
 * timestamps makes the reader do the subtraction. Rounded to the minute
 * because nobody is reporting a return to the second.
 */
export function describeArrivalDelta(
    expected: string | null,
    actual: string | null,
) {
    if (!expected || !actual) {
        return null;
    }

    const minutes = Math.round(
        (parseISO(actual).getTime() - parseISO(expected).getTime()) / 60000,
    );

    if (minutes === 0) {
        return { late: false, label: 'on time' };
    }

    const span =
        Math.abs(minutes) < 60
            ? `${Math.abs(minutes)} min`
            : `${(Math.abs(minutes) / 60).toFixed(
                  Math.abs(minutes) % 60 === 0 ? 0 : 1,
              )} hr`;

    return minutes > 0
        ? { late: true, label: `${span} late` }
        : { late: false, label: `${span} early` };
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
 * What a slip looks like, which is not quite what it is.
 *
 * A slip is decided in one axis (pending/approved/declined) and completes its
 * life in another (did the person come back). Both matter to somebody scanning
 * a list, so the colour is derived from the pair rather than from the decision
 * alone — an approved slip that is still out is a different thing from one whose
 * personnel is back at their desk, and both are "approved" in the queue's
 * filter.
 */
export type PassSlipVisualState = PassSlipStatus | 'arrived';

export function slipVisualState(slip: PassSlipView): PassSlipVisualState {
    // A declined slip keeps its rejection colour whatever `actual_arrival` says:
    // a return time on a slip that was never granted is a correction, not a
    // completed trip.
    if (slip.status === 'approved' && slip.actual_arrival) {
        return 'arrived';
    }

    return slip.status;
}

export const VISUAL_TONE: Record<PassSlipVisualState, string> = {
    ...STATUS_TONE,
    arrived: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
};

export const VISUAL_BORDER: Record<PassSlipVisualState, string> = {
    ...STATUS_BORDER,
    arrived: 'border-l-sky-500',
};

/**
 * Whether a return can still be recorded against this slip.
 *
 * Deliberately narrower than "the officer has permission": a slip only has a
 * return to record once it has been approved (the trip was allowed), while an
 * expected return exists (an early-out slip is not coming back), and while one
 * has not already been recorded. Hiding the control otherwise is better than
 * showing a gesture that can only ever be refused.
 */
export function canRecordArrival(slip: PassSlipView) {
    return (
        slip.status === 'approved' &&
        !slip.actual_arrival &&
        Boolean(slip.expected_arrival)
    );
}

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
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
    showExpectedDeparture = true,
    actions,
}: {
    expectedDeparture: string | null;
    expectedArrival: string | null;
    actualArrival: string | null;
    /**
     * Whether to render the departure readout.
     *
     * Off where the surrounding card header already states the departure time —
     * the field is not removed from the correction form, only from this readout,
     * so HR can still amend it without seeing the same value printed twice.
     */
    showExpectedDeparture?: boolean;
    /** HR correction controls, rendered inside the panel. */
    actions?: ReactNode;
}) {
    return (
        <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                {showExpectedDeparture && (
                    <DetailField
                        label="Expected departure"
                        value={formatDateTime(expectedDeparture)}
                    />
                )}

                <DetailField
                    label="Expected arrival"
                    value={
                        expectedArrival ? (
                            formatDateTime(expectedArrival)
                        ) : (
                            // Not a gap — an early-out slip has no planned
                            // return by design, and saying so stops a reviewer
                            // reading it as an unfilled field.
                            <span className="text-xs text-muted-foreground italic">
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
                            <span className="text-xs text-muted-foreground italic">
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
