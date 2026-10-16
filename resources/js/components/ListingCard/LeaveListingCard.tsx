import { ArrowRight, CalendarRange, FileCheck2 } from 'lucide-react';
import { formatDate, formatRange, relativeDate, Tag } from './fields';
import { ListingCard, SaveToggle } from './ListingCard';

/**
 * The subject a leave card leads with.
 *
 * A leave's `leave_type` is already a short noun ("VL", "SL", "OB") that says
 * nothing to somebody scanning the grid, so the title is the *coverage* — the
 * dates — and the type moves down into a tag. Inverting the usual filing order
 * is what makes a grid of leave cards scannable: the eye lands on a range of
 * dates rather than on nine identical two-letter codes.
 */

/** Stored leave codes, spelled out for the tag row. */
const LEAVE_TYPE_LABELS: Record<string, string> = {
    vl: 'Vacation Leave',
    sl: 'Sick Leave',
    ob: 'Official Business',
    obd: 'Official Business',
    to: 'Time Off',
    pl: 'Personal Leave',
    cl: 'Compensatory Leave',
    dl: 'Department Leave',
    maternity: 'Maternity Leave',
    'maternity-leave': 'Maternity Leave',
};

const STATUS_TONE_MAP = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'declined',
} as const;

/**
 * A filed leave, as a listing card.
 *
 * `total_days` is passed separately from the record because the review queue
 * works on *filings* — one request spanning several ranges — where the day count
 * is a computed aggregate that does not exist on any single `Leave` row. Taking
 * it as a prop keeps this card usable from both screens.
 */
export function LeaveListingCard({
    employeeName,
    leaveType,
    startsAt,
    endsAt,
    totalDays,
    filedAt,
    status = 'pending',
    remarks,
    saved,
    onToggleSave,
    onOpen,
}: {
    employeeName: string;
    leaveType: string;
    startsAt: string | null;
    endsAt: string | null;
    /** Total across every range in the filing, not just this one. */
    totalDays: number;
    filedAt: string | null;
    status?: 'pending' | 'approved' | 'rejected';
    /** Shown as a second tag when present — a leave filed for a reason. */
    remarks?: string | null;
    saved?: boolean;
    onToggleSave?: () => void;
    onOpen?: () => void;
}) {
    const typeLabel = LEAVE_TYPE_LABELS[leaveType.toLowerCase()] ?? leaveType;
    const singleDay = startsAt === endsAt;

    return (
        <ListingCard
            icon={status === 'approved' ? FileCheck2 : CalendarRange}
            tone={STATUS_TONE_MAP[status]}
            eyebrow={
                <>
                    <span className="font-medium text-foreground/80">
                        {employeeName}
                    </span>
                    {filedAt && (
                        <>
                            <span aria-hidden>·</span>
                            <span>{relativeDate(filedAt)}</span>
                        </>
                    )}
                </>
            }
            title={formatRange(startsAt, endsAt)}
            titleHint={`${typeLabel} · ${formatRange(startsAt, endsAt)}`}
            tags={
                <>
                    <Tag>{typeLabel}</Tag>
                    <Tag>{singleDay ? 'Single day' : 'Multi-day'}</Tag>
                    {remarks && (
                        <Tag className="max-w-40 truncate">{remarks}</Tag>
                    )}
                </>
            }
            trailing={
                saved !== undefined && (
                    <SaveToggle saved={saved} onToggle={onToggleSave} />
                )
            }
            figure={`${totalDays} ${totalDays === 1 ? 'day' : 'days'}`}
            figureDetail={startsAt ? `From ${formatDate(startsAt)}` : undefined}
            footerExtra={
                endsAt &&
                !singleDay && (
                    <span className="mt-1 text-xs text-muted-foreground">
                        Until {formatDate(endsAt)}
                    </span>
                )
            }
            actionLabel="Review"
            actionIcon={ArrowRight}
            onAction={onOpen}
        />
    );
}
