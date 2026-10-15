import { useAppearance } from '@/hooks/use-appearance';
import { compactName, cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import '@schedule-x/theme-default/dist/index.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import getCalendarEventsOption from '@/queries/fetchCalendarEvents';
import type { EventProp, CalendarEvent, User } from '@/types';
import 'temporal-polyfill/global';
import { calendarConfig, calendarThemeFor } from './config/colors';
import CustomEventModal from './CustomEventModal';
import LeaveFormDialog from './LeaveFormDialog';
import { monthGridContent } from './LeaveStatus';

type PageProps = {
    users: User[];
};

export default function LeaveCalendar({ users }: PageProps) {
    const { data: calendarEvents, isFetching } = useQuery(
        getCalendarEventsOption(),
    );

    const eventService = useState(() => createEventsServicePlugin())[0];

    const [open, setOpen] = useState(false);

    const [event, setEvent] = useState<CalendarEvent | null>(null);

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
                    id: String(event.id),
                    title: event.calendarTitle ?? '',
                    start: event.start.toString(),
                    end: event.end.toString(),
                    employee_id: event.employee_id,
                    user: event.user,
                    status: Boolean(event.status),
                    calendarTitle: event.calendarTitle,
                    calendarTheme: calendarThemeFor(event.calendarId),
                    // Carried from the event the grid is holding, which is what
                    // the dialog needs to decide whether to offer a decision.
                    approval_state: event.approval_state,
                    filing_group_id: event.filing_group_id,
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
                // The compact name keeps the compact name fitting a cell, and the
                // month grid is handed its own content markup so the decision
                // marker can be a Lucide icon rather than a character jammed
                // into the title — otherwise a month view would show an
                // undecided filing exactly like an approved one.
                _customContent: {
                    monthGrid: monthGridContent(
                        event.calendarId === 'holiday'
                            ? event.title
                            : compactName(event.title),
                        event.approval_state,
                    ),
                },
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
