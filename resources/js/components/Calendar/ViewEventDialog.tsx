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
import calendar from '@/routes/calendar';
import { CalendarEvent, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { CalendarCheck, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

    const theme = isDark
        ? calendarEvent.calendarTheme?.darkColors
        : calendarEvent.calendarTheme?.lightColors;

    const deleteForm = useForm({
        id: Number(calendarEvent?.id),
    });

    function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
    }

    return (
        <>
            {/* Title badge */}
            <div className="border-b px-5 py-3.5">
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
                    {/* <AlertDialog>
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
                    </AlertDialog> */}
                    <Button onClick={() => setMode('edit')} size="sm">
                        <Pencil size={13} className="mr-1" /> Edit event
                    </Button>
                </div>
            </div>
        </>
    );
}
