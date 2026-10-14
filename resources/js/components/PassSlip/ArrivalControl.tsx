import { CheckCircle2, Clock, LogIn, MoveRight } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    canRecordArrival,
    describeArrivalDelta,
    formatDateTime,
} from './fields';
import type { PassSlipView } from './fields';

/**
 * How far the handle has to travel before releasing counts as "they are back".
 *
 * Deliberately short of a full swipe: this is a one-word confirmation, so a
 * near-miss while scrolling past should cost nothing. Past the threshold the
 * gesture is committed and no longer cancelable — an officer who has dragged
 * this far has said what they meant.
 */
const COMMIT_AT = 0.8;

/**
 * The "they are back" control.
 *
 * HR's answer to a single question — is this person back yet — asked dozens of
 * times a day in a corridor, not at a desk. Two affordances, same outcome:
 *
 *  - Drag the handle to the right and release, which is one motion and needs no
 *    aiming.
 *  - Press the button, which is the same thing for a touch screen, a keyboard,
 *    or anyone who would rather not commit to a drag. It is always rendered
 *    rather than being a drag-only affordance, because a control that only
 *    exists for the gesture is a control half the users cannot reach.
 *
 * The recorded time comes from the server at the moment of the request, so
 * neither path asks the browser to vouch for a clock. The strip shows what
 * was recorded afterwards, against what was expected, so a slip that was
 * marked back an hour late says so without anyone re-opening it.
 *
 * The read-only states matter as much as the actionable one: a personnel
 * opening "my slips" sees the same strip and learns that nobody has confirmed
 * their return yet, which is the question they actually have.
 */
export function ArrivalControl({
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
    const actionable = canRecord && canRecordArrival(slip) && !pending;

    return (
        <div
            className={cn(
                'rounded-lg border p-3 transition-colors',
                slip.actual_arrival
                    ? 'border-sky-500/30 bg-sky-500/5'
                    : 'border-dashed',
            )}
        >
            {slip.actual_arrival ? (
                <ArrivedReadout slip={slip} />
            ) : actionable ? (
                <DragToArrive
                    onCommit={() => onRecordArrival?.()}
                    pending={pending}
                />
            ) : (
                <AwaitingReadout slip={slip} />
            )}
        </div>
    );
}

/**
 * Already back: the recorded time, and how that compared to the plan.
 */
function ArrivedReadout({ slip }: { slip: PassSlipView }) {
    const delta = describeArrivalDelta(
        slip.expected_arrival,
        slip.actual_arrival,
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-sky-600 dark:text-sky-400" />
                Arrived {formatDateTime(slip.actual_arrival)}
            </span>

            {delta && (
                <span
                    className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        delta.late
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    )}
                >
                    {delta.label}
                </span>
            )}
        </div>
    );
}

/**
 * Nothing recorded yet. Says which of the two reasons applies instead of
 * rendering a dead control, because "not yet approved" and "no return expected"
 * need different people to do something.
 */
function AwaitingReadout({ slip }: { slip: PassSlipView }) {
    const message = !slip.expected_arrival
        ? 'Early out — no return expected.'
        : slip.status === 'pending'
          ? 'Awaiting approval. HR can record the return once it is approved.'
          : slip.status === 'declined'
            ? 'Declined — there is no return to record.'
            : 'No return recorded yet.';

    return (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {message}
        </span>
    );
}

/**
 * The drag strip and its button fallback.
 *
 * Pointer events rather than HTML5 drag-and-drop: the latter cannot show
 * progress while dragging, drags a transparent image instead of the handle, and
 * is unavailable to touch. Here the fill *is* the feedback — the officer can see
 * how close they are to committing and back out by dragging back.
 */
function DragToArrive({
    onCommit,
    pending,
}: {
    onCommit: () => void;
    pending: boolean;
}) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);

    /**
     * Called on every move with the pointer position, so the fill tracks the
     * finger rather than a fixed animation.
     */
    const measure = useCallback((clientX: number) => {
        const track = trackRef.current;

        if (!track) {
            return 0;
        }

        const bounds = track.getBoundingClientRect();
        const travel = Math.max(1, bounds.width - HANDLE_WIDTH);
        const dragged = clientX - bounds.left - HANDLE_WIDTH / 2;

        return Math.min(1, Math.max(0, dragged / travel));
    }, []);

    const reset = () => {
        setDragging(false);
        setProgress(0);
    };

    function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        // Primary button / single touch only, so a right-click does not record
        // somebody's return.
        if (event.button !== 0) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        setProgress(measure(event.clientX));
    }

    function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
        if (!dragging) {
            return;
        }

        setProgress(measure(event.clientX));
    }

    function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
        if (!dragging) {
            return;
        }

        const travelled = measure(event.clientX);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        setDragging(false);

        // Past the threshold the gesture is spent: recording twice from one
        // drag would be a data entry nobody asked for.
        if (travelled >= COMMIT_AT) {
            setProgress(0);
            onCommit();

            return;
        }

        setProgress(0);
    }

    const armed = progress >= COMMIT_AT;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Not yet back</span>

                <span className="text-xs text-muted-foreground">
                    {dragging
                        ? 'Release to record the return'
                        : 'Drag right, or use the button'}
                </span>
            </div>

            <div
                ref={trackRef}
                onPointerCancel={reset}
                className={cn(
                    'relative h-12 touch-none overflow-hidden rounded-full border bg-muted/40',
                    dragging ? 'border-sky-500/60' : 'border-border',
                )}
            >
                {/* The fill. Its width is the only progress indicator, which is
                    why it is a bar and not a number. */}
                <div
                    className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-colors',
                        armed ? 'bg-sky-500/30' : 'bg-sky-500/15',
                    )}
                    style={{ width: `${progress * 100}%` }}
                />

                {/* Where the release counts. Marked on the track rather than left
                    for the officer to discover by nearly overshooting it. */}
                <div
                    aria-hidden
                    className="absolute inset-y-0 w-px border-l border-dashed border-sky-500/40"
                    style={{ left: `${COMMIT_AT * 100}%` }}
                />

                <button
                    type="button"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    disabled={pending}
                    aria-label="Drag right to record arrival"
                    className={cn(
                        'absolute top-1 left-1 flex h-10 items-center gap-1.5 rounded-full bg-sky-600 pr-3 pl-2.5 text-xs font-medium text-white shadow-sm transition-shadow dark:bg-sky-500',
                        dragging ? 'cursor-grabbing' : 'cursor-grab',
                        'disabled:opacity-60',
                    )}
                    style={{ width: HANDLE_WIDTH }}
                >
                    <MoveRight className="size-4" />
                    <span className="hidden sm:inline">Drag</span>
                </button>
            </div>

            <div className="flex justify-end">
                <Button
                    size="sm"
                    onClick={onCommit}
                    disabled={pending}
                    className="w-full sm:w-auto"
                >
                    <LogIn className="mr-1 size-3.5" />
                    Mark as arrived
                </Button>
            </div>
        </div>
    );
}

/**
 * Width of the drag handle, in pixels. Fixed rather than a percentage so the
 * travel distance is the same on a phone and on a desktop, and so the button's
 * label has room to stay on one line.
 */
const HANDLE_WIDTH = 88;
