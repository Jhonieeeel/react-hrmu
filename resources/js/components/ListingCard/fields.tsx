import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * Shared vocabulary for the listing cards.
 *
 * The cards in this folder are a *shape*, not a screen: leaves, pass slips and
 * whatever else fits a "a thing was filed, here is who and here is when" record
 * all render through the same shell. Everything that differs between them is a
 * fact passed in here — the accent colour, the icon, the primary figure, the
 * tags — so a new kind of filing is a mapping, not a new card.
 */

/**
 * Accent palette, keyed by the record's state.
 *
 * Not the same set as `STATUS_TONE` in the pass slip fields: those tints a pill
 * *and* a left border on a card that already has a coloured icon, whereas these
 * have to survive being used three ways (icon ring, icon glyph, focus ring) on
 * a white card, so they are built a shade darker to hold up at 32px.
 */
export type ListingTone = 'neutral' | 'pending' | 'approved' | 'declined';

export const TONE_RING: Record<ListingTone, string> = {
    neutral: 'ring-slate-500/15 text-slate-600 dark:text-slate-300',
    pending: 'ring-amber-500/20 text-amber-600 dark:text-amber-400',
    approved: 'ring-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    declined: 'ring-destructive/20 text-destructive',
};

export const TONE_LABEL: Record<ListingTone, string> = {
    neutral: 'text-foreground',
    pending: 'text-amber-600 dark:text-amber-400',
    approved: 'text-emerald-600 dark:text-emerald-400',
    declined: 'text-destructive',
};

/**
 * How long ago something was filed, in the flat form the eyebrow line uses.
 *
 * `formatDistanceToNowStrict` rather than the loose variant because the card is
 * scanned against other cards, and "a day" beside "30 days" beside "5 days" is a
 * consistent column — "a day"/"a month"/"a year" is not, and the whole point of
 * the eyebrow is being comparable at a glance.
 *
 * Anything within the day reads as "just now" because "0 days" on a card filed
 * this morning is noise, not information.
 */
export function relativeDate(value: string | Date | null | undefined) {
    if (!value) {
        return null;
    }

    const date = typeof value === 'string' ? parseISO(value) : value;
    const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);

    if (days < 1) {
        return 'just now';
    }

    return `${formatDistanceToNowStrict(date)} ago`;
}

export function formatDate(value: string | null | undefined) {
    return value ? format(parseISO(value), 'MMM d, yyyy') : '—';
}

export function formatDateTime(value: string | null | undefined) {
    return value ? format(parseISO(value), 'MMM d, yyyy · h:mm a') : '—';
}

/** The clock time alone, for the footer's figure slot. */
export function formatTime(value: string | null | undefined) {
    return value ? format(parseISO(value), 'h:mm a') : '—';
}

/**
 * `Nov 3 – 7, 2026`, collapsing the year when both ends share it.
 *
 * The cross-year case keeps both years because `Nov 28 – Dec 2` read on its own
 * is ambiguous, and a leave spanning new year is exactly when guessing wrong
 * costs somebody a day of leave.
 */
export function formatRange(
    start: string | null | undefined,
    end: string | null | undefined,
) {
    if (!start) {
        return '—';
    }

    const from = parseISO(start);

    if (!end) {
        return format(from, 'MMM d, yyyy');
    }

    const to = parseISO(end);

    return format(from, 'yyyy') === format(to, 'yyyy')
        ? `${format(from, 'MMM d')} – ${format(to, 'd, yyyy')}`
        : `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
}

/**
 * A neutral metadata tag.
 *
 * `bg-muted` rather than a status colour on purpose: tags describe the *kind* of
 * record ("Part-time", "Official Business") and there are always several of
 * them, so tinting them would put six competing colours on a card whose one
 * colour is meant to carry the status. The status lives in the eyebrow line and
 * the action button instead.
 */
export function Tag({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground',
                className,
            )}
        >
            {children}
        </span>
    );
}
