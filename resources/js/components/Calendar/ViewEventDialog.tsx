import { router } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    BadgeCheck,
    CalendarCheck,
    CalendarDays,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import calendar from '@/routes/calendar';
import leaveReviews from '@/routes/leave-reviews';
import type { CalendarEvent } from '@/types';
import { LeaveStatusBadge, resolveStatus } from './LeaveStatus';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setMode: (mode: string) => void;
    calendarEvent: CalendarEvent;
};

function formatDate(dateStr: string) {
    const date = new Date(dateStr);

    return {
        date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }),
        time: date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}

function useIsDarkMode() {
    const [isDark, setIsDark] = useState(
        () =>
            typeof document !== 'undefined' &&
            document.documentElement.classList.contains('dark'),
    );

    useEffect(() => {
        const root = document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDark(root.classList.contains('dark'));
        });
        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return isDark;
}

export default function ViewEventDialog({
    open,
    onOpenChange,
    calendarEvent,
    setMode,
}: Props) {
    const start = formatDate(calendarEvent.start);
    const end = formatDate(calendarEvent.end);
    const isDark = useIsDarkMode();
    const queryClient = useQueryClient();
    const { canReviewLeave } = usePermissions();

    const theme = isDark
        ? calendarEvent.calendarTheme?.darkColors
        : calendarEvent.calendarTheme?.lightColors;

    /**
     * Whether this is a filing somebody still has to answer.
     *
     * `filing_group_id` is what the decision acts on, so its absence means the
     * row cannot be decided from here — the button is withheld rather than
     * offered and quietly refused. Holidays never open this dialog at all.
     */
    const canDecide =
        canReviewLeave &&
        resolveStatus(calendarEvent.approval_state) === 'pending' &&
        Boolean(calendarEvent.filing_group_id);

    const [approving, setApproving] = useState(false);

    function handleDelete() {
        router.delete(
            calendar.destroy({ leave: Number(calendarEvent.id) }).url,
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ['calendarEvents'],
                    });
                    onOpenChange(false);
                },
            },
        );
    }

    /**
     * Approves the whole filing this event is part of, then refetches the
     * events so the grid re-renders with the marker and badge that say it was
     * approved — the dialog's own state is not enough, because the reason the
     * calendar needed the decision in the first place is that it shows
     * undecided filings too.
     */
    function handleApprove() {
        setApproving(true);

        router.post(
            leaveReviews.approve(calendarEvent.filing_group_id as string).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ['calendarEvents'],
                    });
                    onOpenChange(false);
                },
                onFinish: () => setApproving(false),
            },
        );
    }

    return (
        <>
            {/* Title badge */}
            <div className="border-b px-5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                    <span
                        className="tracking inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase"
                        style={{
                            backgroundColor: theme?.container,
                            color: theme?.onContainer,
                        }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                                backgroundColor: theme?.main,
                            }}
                        />
                        {calendarEvent.calendarTitle}
                    </span>

                    <LeaveStatusBadge state={calendarEvent.approval_state} />
                </div>
            </div>

            {/* Date range */}
            <div className="mx-5 my-4 grid grid-cols-2 rounded-md border">
                <div className="border-r px-4 py-3">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        <CalendarDays size={11} /> Starts at
                    </p>
                    <p className="text-[15px] font-medium">{start.date}</p>
                    <p className="text-xs text-muted-foreground">
                        {start.time}
                    </p>
                </div>
                <div className="px-4 py-3">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        <CalendarCheck size={11} /> Ends at
                    </p>
                    <p className="text-[15px] font-medium">{end.date}</p>
                    <p className="text-xs text-muted-foreground">{end.time}</p>
                </div>
            </div>

            {/* The decision, for whoever has the permission and nobody else.
                Approving here acts on the entire filing, so it cannot leave a
                multi-day request half-decided the way deciding one visible
                segment would. */}
            {canDecide && (
                <div className="mx-5 mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        Filed and not yet reviewed.
                    </p>

                    <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={approving}
                    >
                        {approving ? (
                            'Approving...'
                        ) : (
                            <>
                                <BadgeCheck size={13} className="mr-1" />{' '}
                                Approve
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-5 py-3.5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </Button>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 size={13} className="mr-1" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete this event?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this event.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => setMode('edit')} size="sm">
                        <Pencil size={13} className="mr-1" /> Edit event
                    </Button>
                </div>
            </div>
        </>
    );
}
