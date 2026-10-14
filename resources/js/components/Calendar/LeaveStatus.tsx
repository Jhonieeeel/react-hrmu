import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Mirrors Leave::approvalState(). */
export type LeaveApprovalState = 'pending' | 'approved' | 'rejected';

type StatusMeta = {
    label: string;
    /**
     * A text glyph rather than a component.
     *
     * The month grid paints nothing but the event title — there is no slot for
     * an icon node — so the marker has to survive being rendered as a string.
     * The React icon below is for everywhere else.
     */
    glyph: string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
};

/**
 * How each decision reads at a glance.
 *
 * The calendar is not filtered by status, so an officer looking at a month sees
 * approved leave, leave nobody has answered yet, and leave that was turned down
 * rendered identically. Colour already separates leave types; this separates
 * decisions from each other.
 */
export const LEAVE_STATUS: Record<LeaveApprovalState, StatusMeta> = {
    pending: {
        label: 'Awaiting approval',
        glyph: '⏳',
        icon: Clock,
        tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    },
    approved: {
        label: 'Approved',
        glyph: '✅',
        icon: CheckCircle2,
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    },
    rejected: {
        label: 'Rejected',
        glyph: '⛔',
        icon: XCircle,
        tone: 'border-destructive/30 bg-destructive/10 text-destructive',
    },
};

/**
 * A filing row the calendar shows. Holidays carry no approval state — they were
 * never filed — and are treated as approved so nothing claims they are pending.
 */
export function resolveStatus(state?: LeaveApprovalState): LeaveApprovalState {
    return state ?? 'approved';
}

/**
 * The title as the grid has to render it.
 *
 * Prefixed rather than suffixed because a month grid truncates from the right,
 * so a trailing marker is the first thing to be cut off — which would defeat
 * the point of adding it.
 */
export function withStatusMarker(title: string, state?: LeaveApprovalState) {
    return `${LEAVE_STATUS[resolveStatus(state)].glyph} ${title}`;
}

/**
 * The status badge, for the dialogs and the lists beside the calendar.
 */
export function LeaveStatusBadge({
    state,
    className,
}: {
    state?: LeaveApprovalState;
    className?: string;
}) {
    const meta = LEAVE_STATUS[resolveStatus(state)];
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={cn('gap-1', meta.tone, className)}>
            <Icon className="size-3" />
            {meta.label}
        </Badge>
    );
}
