import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import getCalendarEventsOption from '@/queries/fetchCalendarEvents';
import { EventProp, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import '@schedule-x/theme-default/dist/index.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import 'temporal-polyfill/global';
import { calendarConfig } from './config/colors';
import CustomEventModal from './CustomEventModal';
import LeaveFormDialog from './LeaveFormDialog';

type PageProps = {
    users: User[];
};

export default function LeaveCalendar({ users }: PageProps) {
    const { data: calendarEvents, isFetching } = useQuery(
        getCalendarEventsOption(),
    );

    const eventService = useState(() => createEventsServicePlugin())[0];

    const [open, setOpen] = useState(false);

    const [event, setEvent] = useState<EventProp>({
        id: 0,
        title: '',
        start: '',
        end: '',
        user: [],
        status: false,
        user_id: 0,
        calendarTitle: '',
        calendarTheme: '',
    });

    const [openDialog, setOpenDialog] = useState(false);

    const [selectedDate, setSelectedDate] = useState('');

    const calendar = useCalendarApp({
        views: [createViewMonthGrid()],
        events: [],
        calendars: calendarConfig,
        theme: 'shadcn',
        monthGridOptions: {
            nEventsPerDay: 50,
        },
        isDark: useAppearance().appearance === 'dark',
        callbacks: {
            onEventClick(event) {
                if (event.calendarId === 'holiday') {
                    return;
                }
                setEvent({
                    id: event.id,
                    title: event.calendarTitle ?? '',
                    start: event.start.toString(),
                    end: event.end.toString(),
                    user_id: event.user_id,
                    user: event.user,
                    calendarTitle: event.calendarTitle,
                    calendarTheme: calendarConfig[event.calendarId],
                });

                setOpen(true);
            },
            onClickDate(date) {
                setOpenDialog((value) => !value);
                setSelectedDate(date.toString());
            },
        },
        plugins: [eventService],
    });

    useEffect(() => {
        if (calendarEvents && calendarEvents.length > 0) {
            const formatted = calendarEvents.map((event: EventProp) => ({
                ...event,
                start: Temporal.PlainDate.from(event.start),
                end: Temporal.PlainDate.from(event.end),
            }));
            eventService.set(formatted);
        }
    }, [calendarEvents]);

    return (
        <div
            className={cn(
                'max-w-auto mx-auto transition-opacity duration-200',
                openDialog && 'pointer-events-none opacity-40',
            )}
        >
            <div>
                <ScheduleXCalendar calendarApp={calendar} />
            </div>
            {event && (
                <CustomEventModal
                    tModal
                    open={open}
                    onOpenChange={setOpen}
                    calendarEvent={event}
                />
            )}
            {users && openDialog && (
                <LeaveFormDialog
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    date={selectedDate}
                    users={users}
                />
            )}
        </div>
    );
}
