import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRightIcon,
    CalendarOffIcon,
    CircleAlertIcon,
    Clock3Icon,
    FileCheck2Icon,
    PlaneIcon,
    Users2,
} from 'lucide-react';
import { useState } from 'react';
import DashboardCard from '@/components/Dashboard/DashboardCard';
import { event_types } from '@/components/Leave/constants/constants';
import FilterButton from '@/components/Leave/FilterButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import leaves from '@/routes/leaves';

type FilingSummary = {
    employee_id: number;
    employee_name: string;
    leave_type: string;
    filing_count: number;
    completed_count: number;
    pending_count: number;
    latest_filed_at: string;
};

type DashboardProps = {
    summary: {
        employees: number;
        leave_filings: number;
        filers: number;
        pending_filings: number;
        holidays: number;
    };
    filingSummaries: FilingSummary[];
    recentEmployees: Array<{
        id: number;
        name: string;
        created_at: string;
    }>;
    filingPeriod: {
        month: number;
        year: number;
        leave_type: string;
    };
};

const formatPeriod = (month: number, year: number) =>
    new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
        new Date(year, month - 1, 1),
    );

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));

const formatLeaveType = (leaveType: string) =>
    leaveType
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

export default function Dashboard({
    summary,
    filingSummaries,
    recentEmployees,
    filingPeriod,
}: DashboardProps) {
    const [date, setDate] = useState({
        month: String(filingPeriod.month),
        year: String(filingPeriod.year),
    });
    const [leaveType, setLeaveType] = useState(filingPeriod.leave_type);
    const period = formatPeriod(Number(date.month), Number(date.year));
    const leaveTypeLabel = formatLeaveType(leaveType);

    function handleFilter(key: 'month' | 'year', value: string) {
        const nextDate = { ...date, [key]: value };
        setDate(nextDate);

        router.visit(
            dashboard({
                query: {
                    month: nextDate.month,
                    year: nextDate.year,
                    leave_type: leaveType,
                },
            }),
            {
                only: [
                    'summary',
                    'filingSummaries',
                    'recentEmployees',
                    'filingPeriod',
                ],
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function handleLeaveTypeChange(value: string) {
        setLeaveType(value);

        router.visit(
            dashboard({
                query: {
                    month: date.month,
                    year: date.year,
                    leave_type: value,
                },
            }),
            {
                only: [
                    'summary',
                    'filingSummaries',
                    'recentEmployees',
                    'filingPeriod',
                ],
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Dashboard
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Track your people and {period.toLowerCase()}{' '}
                            {leaveTypeLabel.toLowerCase()} records.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={leaveType}
                            onChange={(event) =>
                                handleLeaveTypeChange(event.target.value)
                            }
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                            aria-label="Filter by leave type"
                        >
                            <option value="monthly filing">
                                Monthly filing
                            </option>
                            {event_types.map((event) => (
                                <option
                                    key={event.id}
                                    value={event.leave_type.toLowerCase()}
                                >
                                    {event.leave_type}
                                </option>
                            ))}
                        </select>
                        <FilterButton
                            key={`${date.month}-${date.year}`}
                            handleFilter={handleFilter}
                            date={date}
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardCard
                        cardColor="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300"
                        label="Employees"
                        value={summary.employees}
                        description="People in the organization"
                        icon={Users2}
                    />
                    <DashboardCard
                        cardColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                        label="Leave records"
                        value={summary.leave_filings}
                        description={`Filed in ${period}`}
                        icon={PlaneIcon}
                    />
                    <DashboardCard
                        cardColor="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"
                        label="Pending"
                        value={summary.pending_filings}
                        description="Need review"
                        icon={Clock3Icon}
                    />
                    <DashboardCard
                        cardColor="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300"
                        label="Holidays"
                        value={summary.holidays}
                        description="Configured holidays"
                        icon={CalendarOffIcon}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    <section className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-semibold text-foreground">
                                    {leaveTypeLabel} records
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    One overview for every employee with a
                                    {leaveTypeLabel.toLowerCase()} record in
                                    this period.
                                </p>
                            </div>
                            <Badge variant="secondary" className="w-fit">
                                {summary.filers}{' '}
                                {summary.filers === 1
                                    ? 'employee'
                                    : 'employees'}
                            </Badge>
                        </div>

                        {filingSummaries.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 text-center">
                                <div className="rounded-full bg-muted p-3">
                                    <FileCheck2Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="font-medium">
                                    No {leaveTypeLabel.toLowerCase()} records
                                    yet
                                </p>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {leaveTypeLabel} records will appear here
                                    once a record is available for {period}.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[30rem] divide-y divide-border overflow-y-auto">
                                {filingSummaries.map((filing) => (
                                    <div
                                        key={filing.employee_id}
                                        className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                                    >
                                        <Avatar className="size-9">
                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                {filing.employee_name
                                                    .split(' ')
                                                    .map((part) => part[0])
                                                    .join('')
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {filing.employee_name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Last filed{' '}
                                                {formatDate(
                                                    filing.latest_filed_at,
                                                )}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-5 text-left sm:flex sm:items-center sm:gap-8">
                                            <div>
                                                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    Requests
                                                </p>
                                                <p className="mt-0.5 text-sm font-semibold">
                                                    {filing.filing_count}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    Status
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        filing.pending_count > 0
                                                            ? 'mt-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                                            : 'mt-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                                    }
                                                >
                                                    {filing.pending_count >
                                                    0 ? (
                                                        <CircleAlertIcon />
                                                    ) : (
                                                        <FileCheck2Icon />
                                                    )}
                                                    {filing.pending_count > 0
                                                        ? `${filing.pending_count} pending`
                                                        : 'Completed'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="self-end sm:self-auto"
                                        >
                                            <Link
                                                href={leaves.show(
                                                    filing.employee_id,
                                                    {
                                                        query: {
                                                            month: filingPeriod.month,
                                                            year: filingPeriod.year,
                                                        },
                                                    },
                                                )}
                                                aria-label={`View ${filing.employee_name}'s balance`}
                                            >
                                                <ArrowRightIcon />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border px-5 py-4">
                            <h3 className="font-semibold text-foreground">
                                Recently added employees
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                The newest people in your organization.
                            </p>
                        </div>
                        <div className="divide-y divide-border">
                            {recentEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center gap-3 px-5 py-3"
                                >
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-sky-50 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                            {employee.name
                                                .split(' ')
                                                .map((part) => part[0])
                                                .join('')
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {employee.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Added{' '}
                                            {formatDate(employee.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
