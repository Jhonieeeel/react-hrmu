import AddHolidayDialog from '@/components/Calendar/AddHolidayDialog';
import { HolidayColumns } from '@/components/Calendar/columns/HolidayColumns';
import LeaveCalendar from '@/components/Calendar/LeaveCalendar';
import { DataTable } from '@/components/Leave/table/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFlashToast from '@/components/useFlashToast';
import calendar from '@/routes/calendar';
import { FlashMessageProp, User } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar1, CalendarOff } from 'lucide-react';

type PageProps = {
    users: User[];
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
                    <Tabs defaultValue="calendar" className="w-full">
                        <TabsList variant="line">
                            <TabsTrigger value="calendar">
                                <Calendar1 />
                                Calendar
                            </TabsTrigger>
                            <TabsTrigger value="holiday">
                                <CalendarOff />
                                Holiday List
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="calendar">
                            <LeaveCalendar users={users} />
                        </TabsContent>
                        <TabsContent value="holiday">
                            <DataTable data={[]} columns={HolidayColumns} />
                        </TabsContent>
                    </Tabs>
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
