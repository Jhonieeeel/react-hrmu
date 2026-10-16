import { Bookmark } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TONE_RING } from './fields';
import type { ListingTone } from './fields';

/**
 * The card shell every filing renders in.
 *
 * The layout is a fixed three-part vertical rhythm, and the parts are not
 * optional — a card is either the full shape or it is not a listing card:
 *
 *   1. crest    icon disc, left; the trailing slot on the same row
 *   2. body     eyebrow (who, when), title, tags — then flexible whitespace
 *   3. footer   primary figure + secondary line, rule, primary action
 *
 * The body grows to fill and the footer is pinned to the bottom (`mt-auto`) so
 * that in a grid row, a card with two tags and a card with none still have their
 * footers on the same baseline. That alignment is most of what makes a grid of
 * these read as a set rather than as eight separate objects.
 *
 * Typography carries the hierarchy without a single heading tag: the eyebrow is
 * small and muted, the title is the only `text-lg font-medium` on the card, and
 * the footer's figure is set at `text-sm font-semibold` above a muted line. The
 * title is a real `<h3>` so the grid is navigable, but everything else is
 * deliberately not a heading — a card is one thing, not five.
 */
export function ListingCard({
    icon: Icon,
    tone = 'neutral',
    eyebrow,
    title,
    titleHint,
    tags,
    trailing,
    figure,
    figureDetail,
    actionLabel,
    onAction,
    actionIcon,
    footerExtra,
    className,
}: {
    /** Crest glyph. Sized by the card, not by the caller. */
    icon: ComponentType<{ className?: string }>;
    tone?: ListingTone;
    /**
     * The `who · when` line above the title.
     *
     * A fragment so the caller decides the separator and can drop the date when
     * there is nothing truthful to put there — an undated filing shows the name
     * alone rather than an "Unknown".
     */
    eyebrow?: ReactNode;
    /**
     * The card's subject — what was filed, in the filer's own words.
     *
     * Left-truncated at one line with the full value on `titleHint`: a grid cell
     * is narrow, and a half-shown title that widens the card is worse than an
     * elided one, since every card in the row has to agree on width.
     */
    title: string;
    titleHint?: string;
    /** Metadata chips. Rendered in a wrapping row; omit entirely if there are none. */
    tags?: ReactNode;
    /**
     * The crest-row trailing slot — a save toggle, a status pill, whatever the
     * record needs beside the icon.
     */
    trailing?: ReactNode;
    /**
     * The footer's headline number or range.
     *
     * The strongest figure on the card, and deliberately not the title: the
     * title says *what* was filed and the figure says *how much*, so a scanner
     * picking cards out of a grid is reading days and dates, not titles.
     */
    figure: ReactNode;
    /** Second footer line, muted. Where, or by whom, or for what. */
    figureDetail?: ReactNode;
    /** Rendered left of the action in the footer, for counts and notes. */
    footerExtra?: ReactNode;
    actionLabel: string;
    actionIcon?: ComponentType<{ className?: string }>;
    onAction?: () => void;
    className?: string;
}) {
    const ActionIcon = actionIcon;

    return (
        <article
            className={cn(
                'flex min-w-0 flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow',
                'focus-within:border-primary/40 hover:shadow-md',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full ring-1',
                        TONE_RING[tone],
                    )}
                >
                    <Icon className="size-4" />
                </span>

                {trailing}
            </div>

            <div className="mt-4 flex min-w-0 flex-1 flex-col">
                {eyebrow && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        {eyebrow}
                    </div>
                )}

                <h3
                    title={titleHint ?? title}
                    className="mt-1 truncate text-lg font-medium tracking-tight text-balance"
                >
                    {title}
                </h3>

                {tags && (
                    <div className="mt-3 flex flex-wrap gap-1.5">{tags}</div>
                )}
            </div>

            <div className="mt-6 flex items-end justify-between gap-3 border-t pt-4">
                <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold tabular-nums">
                        {figure}
                    </span>

                    {figureDetail && (
                        <span className="truncate text-xs text-muted-foreground">
                            {figureDetail}
                        </span>
                    )}

                    {footerExtra}
                </div>

                <Button
                    size="sm"
                    className="shrink-0"
                    onClick={onAction}
                    aria-label={actionLabel}
                >
                    {ActionIcon && <ActionIcon className="size-3.5" />}
                    {actionLabel}
                </Button>
            </div>
        </article>
    );
}

/**
 * The save toggle that sits in the crest row.
 *
 * Separate from the shell because "save" is a verb the filer uses on their own
 * records and never one HR uses on the queue, so the state and its handler are
 * the caller's — the shell only fixes where the control lives, which is the part
 * that has to be identical everywhere for the grid to line up.
 *
 * Pressed state swaps the label rather than only the fill: the two words are
 * different instructions, and a colour change alone leaves a screen reader
 * announcing the same thing twice.
 */
export function SaveToggle({
    saved,
    onToggle,
}: {
    saved: boolean;
    onToggle?: () => void;
}) {
    return (
        <Button
            variant="outline"
            size="xs"
            aria-pressed={saved}
            onClick={onToggle}
            className={cn('gap-1.5', saved && 'bg-muted text-foreground')}
        >
            {saved ? (
                <Bookmark className="size-3 fill-current" />
            ) : (
                <Bookmark className="size-3" />
            )}
            {saved ? 'Saved' : 'Save'}
        </Button>
    );
}
