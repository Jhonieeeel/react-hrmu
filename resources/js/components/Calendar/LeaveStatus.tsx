import { Check, CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Mirrors Leave::approvalState(). */
export type LeaveApprovalState = 'pending' | 'approved' | 'rejected';

type StatusMeta = {
    label: string;
    /**
     * Two icons, not one.
     *
     * `icon` is the badge-sized one, drawn inside an outlined pill next to a
     * label. `markerIcon` is the one that goes in a month cell, where the whole
     * event is about 12px tall: at that size a circled variant closes up into a
     * blob and the distinction between "approved" and "rejected" is lost, so the
     * bare strokes read better.
     */
    icon: ComponentType<LucideProps>;
    markerIcon: ComponentType<LucideProps>;
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
        icon: Clock,
        markerIcon: Clock,
        tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle2,
        markerIcon: Check,
        tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        markerIcon: X,
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
 * The Lucide icon, rendered once per status to static markup.
 *
 * The month grid takes its event content as an HTML string, not as React nodes,
 * so an icon component cannot be handed to it directly. Rendering the real
 * Lucide component to markup rather than hand-copying its path data means the
 * glyph here is the same glyph the badges use, and stays that way across a
 * Lucide upgrade.
 *
 * Memoised because the same three strings are asked for on every render of the
 * event list, and the result is constant for the life of the page.
 */
const MARKER_MARKUP: Record<LeaveApprovalState, string> = {
    pending: markerFor('pending'),
    approved: markerFor('approved'),
    rejected: markerFor('rejected'),
};

function markerFor(state: LeaveApprovalState): string {
    const Icon = LEAVE_STATUS[state].markerIcon;

    return renderToStaticMarkup(
        <Icon
            className="shrink-0"
            // Month cells run at 12–14px; the icon is sized against the text so
            // it keeps the same optical weight in both themes.
            size={14}
            strokeWidth={2.5}
            aria-hidden
        />,
    );
}

/**
 * The month grid's contents for one event: a Lucide status icon, then the title.
 *
 * Supplying this replaces the grid's own rendering entirely (see ScheduleX's
 * month grid event, which skips its default title when custom content is set),
 * * so the layout has to be rebuilt here* — the same row-flex, the same clipping
 * at the right edge, or the title would wrap and push the event out of its cell.
 *
 * The title is escaped: this string reaches the grid through `innerHTML`, and
 * it carries personnel names and leave purposes straight from the database.
 */
export function monthGridContent(
    title: string,
    state?: LeaveApprovalState,
): string {
    const markup = MARKER_MARKUP[resolveStatus(state)];

    return [
        '<div class="flex min-w-0 items-center gap-1">',
        // Slightly transparent so the icon reads as a marker beside the name
        // rather than as the first character of it.
        `<span class="flex shrink-0 opacity-70">${markup}</span>`,
        `<span class="truncate">${escapeHtml(title)}</span>`,
        '</div>',
    ].join('');
}

/**
 * Escapes the five characters that can break out of text content or an
 * attribute. Ampersand first, or it would double-escape the entities produced
 * after it.
 */
function escapeHtml(value: string): string {
    return value.replace(
        /[&<>"']/g,
        (char) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[char] ?? char,
    );
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