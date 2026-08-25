import AddHolidayDialog from '@/components/Calendar/AddHolidayDialog';
import LeaveCalendar from '@/components/Calendar/LeaveCalendar';
import useFlashToast from '@/components/useFlashToast';
import calendar from '@/routes/calendar';
import { FlashMessageProp, User } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type PageProps = {
    users: User;
    flash: {
        success: FlashMessageProp | null;
    };
};

export default function CalendarIndex({ users, flash }: PageProps) {
    useFlashToast(flash);

    return (
        <>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold dark:text-accent">
                            Calendar
                        </h1>
                        <p className="text-sm">
                            View all approved leave schedules and see who is on
                            leave for specific dates.
                        </p>
                    </div>
                    <AddHolidayDialog />
                </div>
                <div className="relative min-h-screen flex-1 space-y-4 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Calendar Here */}
                    <LeaveCalendar users={users} />
                </div>
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: [
        {
            title: 'Calendar',
            href: calendar.index(),
        },
    ],
};
