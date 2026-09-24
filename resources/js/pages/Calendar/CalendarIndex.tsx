import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Calendar1,
    CalendarOff,
    CalendarRange,
    CheckCircle2,
    Clock3,
    Plane,
    UsersRound,
} from 'lucide-react';
import AddHolidayDialog from '@/components/Calendar/AddHolidayDialog';
import { HolidayColumns } from '@/components/Calendar/columns/HolidayColumns';
import LeaveCalendar from '@/components/Calendar/LeaveCalendar';
import { DataTable } from '@/components/Leave/table/DataTable';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFlashToast from '@/components/useFlashToast';
import calendar from '@/routes/calendar';
import leaves from '@/routes/leaves';
import type { FlashMessageProp, Holiday, User } from '@/types';

type UpcomingLeave = {
    id: number;
    employee_id: number;
    employee_name: string;
    leave_type: string;
    starts_at: string;
    ends_at: string;
    status: boolean;
};

type PageProps = {
    users: User[];
    upcomingLeaves: UpcomingLeave[];
    holidays: Holiday[];
    flash: { success: FlashMessageProp | null };
};

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
        new Date(`${date}T00:00:00`),
    );

export default function CalendarIndex({
    users,
    upcomingLeaves,
    holidays,
    flash,
}: PageProps) {
    useFlashToast(flash);

    return (
        <>
            <Head title="Calendar" />
            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-300">
                            <CalendarRange className="size-4" />
                            Workforce schedule
                        </div>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Calendar
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            See approved leave, holidays, and upcoming employee
                            absences in one place.
                        </p>
                    </div>
                    <AddHolidayDialog />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="gap-0 border-0 border-t-4 border-t-sky-500 bg-sky-500/5 py-0 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-300">
                                <UsersRound className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Employees
                                </p>
                                <p className="text-xl font-bold">
                                    {users.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 border-0 border-t-4 border-t-violet-500 bg-violet-500/5 py-0 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-300">
                                <Calendar1 className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Upcoming leaves
                                </p>
                                <p className="text-xl font-bold">
                                    {upcomingLeaves.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 border-0 border-t-4 border-t-amber-500 bg-amber-500/5 py-0 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300">
                                <CalendarOff className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Calendar view
                                </p>
                                <p className="text-xl font-bold">Monthly</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="min-w-0 gap-0 overflow-hidden py-0 shadow-sm">
                        <CardHeader className="border-b bg-muted/20 px-5 py-4">
                            <CardTitle className="text-base">
                                Schedule overview
                            </CardTitle>
                            <CardDescription>
                                Browse leave events by month and select a date
                                to file leave.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[42rem] p-4 md:p-5">
                            <Tabs defaultValue="calendar">
                                <TabsList variant="line" className="mb-4">
                                    <TabsTrigger value="calendar">
                                        <Calendar1 className="mr-2 size-4" />{' '}
                                        Calendar
                                    </TabsTrigger>
                                    <TabsTrigger value="holiday">
                                        <CalendarOff className="mr-2 size-4" />{' '}
                                        Holiday list
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="calendar">
                                    <LeaveCalendar users={users} />
                                </TabsContent>
                                <TabsContent value="holiday">
                                    <DataTable
                                        data={holidays}
                                        columns={HolidayColumns}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card className="h-fit gap-0 overflow-hidden py-0 shadow-sm">
                        <CardHeader className="border-b bg-emerald-500/5 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <Plane className="size-4 text-emerald-600 dark:text-emerald-300" />
                                <CardTitle className="text-base">
                                    Upcoming leaves
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Next filed employee absences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {upcomingLeaves.length === 0 ? (
                                <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 text-center">
                                    <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                    <p className="text-sm font-medium">
                                        No upcoming leaves
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Future filed leaves will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {upcomingLeaves.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="group p-4 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                                                    <Plane className="size-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="truncate text-sm font-semibold">
                                                            {
                                                                leave.employee_name
                                                            }
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                leave.status
                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                                                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                                            }
                                                        >
                                                            {leave.status
                                                                ? 'Approved'
                                                                : 'Pending'}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground capitalize">
                                                        {leave.leave_type}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock3 className="size-3.5" />
                                                        {leave.starts_at ===
                                                        leave.ends_at
                                                            ? formatDate(
                                                                  leave.starts_at,
                                                              )
                                                            : `${formatDate(leave.starts_at)} – ${formatDate(leave.ends_at)}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="border-t p-3">
                                <Link
                                    href={leaves.index()}
                                    className="flex w-full items-center justify-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-300"
                                >
                                    View all leave records{' '}
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: [{ title: 'Calendar', href: calendar.index() }],
};
