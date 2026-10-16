import { CheckCircle2, Clock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    canRecordArrival,
    describeArrivalDelta,
    formatDateTime,
} from './fields';
import type { PassSlipView } from './fields';

/**
 * The arrival readout for the collapsed review card.
 *
 * ArrivalControl answers "are they back yet?" for somebody standing at a desk
 * with the card open. This answers the same question for somebody scrolling a
 * list of twenty: the single most common thing an officer does with this queue
 * is tick people off as they walk back in, and making them expand every card to
 * do it is what turns the queue into twenty open forms.
 *
 * Three states, and each one says something different rather than rendering a
 * dead control:
 *
 *  - recorded: the time they came back, and how that compared to the plan.
 *  - actionable: a button that records the return at the server's clock.
 *  - not yet: why nothing can be recorded — not approved, or no return expected.
 *
 * The timestamp comes from the server at the moment of the request, so the
 * browser is never asked to vouch for a clock. `canRecord` is only about not
 * offering a control that would bounce; the server authorises independently.
 */
export function ArrivalSummary({
    slip,
    onRecordArrival,
    canRecord = false,
    pending = false,
}: {
    slip: PassSlipView;
    /** Called with no arguments; the server decides the timestamp. */
    onRecordArrival?: () => void;
    canRecord?: boolean;
    pending?: boolean;
}) {
    if (slip.actual_arrival) {
        return <ArrivedReadout slip={slip} />;
    }

    if (canRecord && canRecordArrival(slip) && !pending) {
        return (
            <Button
                size="sm"
                onClick={() => onRecordArrival?.()}
                disabled={pending}
                title="Record the return at the current time"
            >
                <LogIn className="mr-1 size-3.5" />
                Mark as arrived
            </Button>
        );
    }

    return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock className="size-3.5" />
            {awaitingMessage(slip)}
        </span>
    );
}

/**
 * Already back: the recorded time, and how that compared to what was planned.
 *
 * Reuses the wording of the arrival strip so the two places the fact appears
 * cannot disagree about it.
 */
function ArrivedReadout({ slip }: { slip: PassSlipView }) {
    const delta = describeArrivalDelta(
        slip.expected_arrival,
        slip.actual_arrival,
    );

    return (
        <span className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-foreground flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-3.5 text-sky-600 dark:text-sky-400" />
                Arrived {formatDateTime(slip.actual_arrival)}
            </span>

            {delta && (
                <span
                    className={cn(
                        'rounded-full px-2 py-0.5 font-medium',
                        delta.late
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    )}
                >
                    {delta.label}
                </span>
            )}
        </span>
    );
}

/**
 * Which of the reasons applies, rather than a control nobody can use.
 */
function awaitingMessage(slip: PassSlipView): string {
    if (!slip.expected_arrival) {
        return 'Early out — no return expected';
    }

    if (slip.status === 'pending') {
        return 'Awaiting approval';
    }

    if (slip.status === 'declined') {
        return 'Declined';
    }

    return 'Not yet arrived';
}