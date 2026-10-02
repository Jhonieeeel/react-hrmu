import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    ChevronRight,
    Clock3,
    History,
    NotebookPen,
    Plane,
    Scale,
    TimerOffIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AccrualButton from '@/components/Leave/AccrualButton';
import AccrualDialog from '@/components/Leave/AccrualDialog';
import BalanceCard from '@/components/Leave/BalanceCard';
import type { Balance } from '@/components/Leave/BalanceCard';
import { HistoryColumns } from '@/components/Leave/columns/HistoryColumn';
import FilterButton from '@/components/Leave/FilterButton';
import LeaveForm from '@/components/Leave/LeaveForm';
import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import UndertimeForm from '@/components/Leave/UndertimeForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/use-permissions';
import { filteredDateName, readFiltersFromUrl } from '@/lib/utils';
import getEmployeeBalanceOption from '@/queries/fetchEmployeeBalance';
import type { EmployeeSummary } from '@/types';
import { Permissions } from '@/types/auth';

type PageProp = {
    user: EmployeeSummary;
    filters: { month: string; year: string };
};

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export default function EmployeeBalance({ user, filters }: PageProp) {
    const { can } = usePermissions();

    // Recording undertime/tardiness is an HR data-entry action, not employee
    // self-service. The route is already permission-gated, so this only keeps
    // the form from being shown to someone who cannot submit it.
    const canRecordUndertime = can(Permissions.RecordAdjustments);

    const [date, setDate] = useState(
        filters?.month && filters?.year
            ? { month: String(filters.month), year: String(filters.year) }
            : readFiltersFromUrl(),
    );
    const [page, setPage] = useState(1);
    const [openLeave, setOpenLeave] = useState(false);
    const [openUndertime, setOpenUndertime] = useState(false);

    function handleFilter(key: 'month' | 'year', value: string) {
        setDate((current) => ({ ...current, [key]: value }));
        setPage(1);
    }

    const { data: userData, isFetching } = useQuery(
        getEmployeeBalanceOption(date.month, date.year, user.id, page),
    );

    const balances = useMemo(
        () => userData?.balances ?? [],
        [userData?.balances],
    );
    const transactions = userData?.transactions;
    // Leave filed but not yet approved. Held out of `balances` server-side, so
    // this is purely informational.
    const pending = useMemo<Record<string, number>>(
        () => (userData?.pending as Record<string, number>) ?? {},
        [userData?.pending],
    );
    const pendingTotal = useMemo(
        () =>
            Object.values(pending).reduce(
                (total: number, days: number) => total + Number(days),
                0,
            ),
        [pending],
    );
    const needsInitialAccrual = ['new employee', 'transferee'].includes(
        user.employee_type ?? '',
    );

    const summary = useMemo(
        () => ({
            available: balances.reduce(
                (total: number, item: Balance) => total + Number(item.current),
                0,
            ),
            used: balances.reduce(
                (total: number, item: Balance) => total + Number(item.used),
                0,
            ),
            monthly: balances.reduce(
                (total: number, item: Balance) =>
                    total + Number(item.monthly_accrual),
                0,
            ),
        }),
        [balances],
    );

    return (
        <>
            <Head title={`${user.name} - Leave Balance`} />
            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-sky-500/10 via-card to-emerald-500/5 shadow-sm">
                    <CardHeader className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16 border-4 border-background shadow-sm">
                                <AvatarFallback className="bg-sky-100 text-lg font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        {user.name}
                                    </h1>
                                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 capitalize dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                                        Active employee
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Employee #{user.id} · Leave management
                                    center
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {userData?.hasAccrual &&
                                (needsInitialAccrual ? (
                                    <AccrualDialog
                                        filters={date}
                                        employee_id={user.id}
                                    />
                                ) : (
                                    <AccrualButton
                                        filters={date}
                                        employee_id={user.id}
                                    />
                                ))}
                            <FilterButton
                                key={`${date.month}-${date.year}`}
                                handleFilter={handleFilter}
                                date={date}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 border-t border-border/60 p-4 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-lg bg-background/60 p-3">
                            <div className="rounded-md bg-sky-500/10 p-2 text-sky-600 dark:text-sky-300">
                                <Calendar className="size-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Viewing period
                                </p>
                                <p className="text-sm font-semibold">
                                    {filteredDateName(date.month, date.year)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-background/60 p-3">
                            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                                <Scale className="size-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Available balance
                                </p>
                                <p className="text-sm font-semibold">
                                    {summary.available.toFixed(3)} days
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-background/60 p-3">
                            <div className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300">
                                <Clock3 className="size-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Used this period
                                </p>
                                <p className="text-sm font-semibold">
                                    {summary.used.toFixed(3)} days
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="balance" className="space-y-5">
                    <TabsList
                        variant="line"
                        className="w-fit max-w-full overflow-x-auto"
                    >
                        <TabsTrigger value="balance">
                            <Scale className="mr-2 size-4" /> Balances
                        </TabsTrigger>
                        <TabsTrigger value="table">
                            <History className="mr-2 size-4" /> History
                        </TabsTrigger>
                        <TabsTrigger value="form">
                            <NotebookPen className="mr-2 size-4" /> Actions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="balance" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Leave balances
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Available, used, and estimated leave for
                                    this period.
                                </p>
                            </div>
                            <Badge
                                variant="secondary"
                                className="hidden sm:inline-flex"
                            >
                                Monthly accrual: {summary.monthly.toFixed(3)}{' '}
                                days
                            </Badge>
                        </div>

                        {pendingTotal > 0 && (
                            <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
                                <Clock3 className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="font-medium">
                                        {pendingTotal.toFixed(3)} day
                                        {pendingTotal === 1 ? '' : 's'} awaiting
                                        approval
                                    </p>
                                    <p className="text-muted-foreground">
                                        Not deducted from the balances above
                                        until a reviewer approves the request.
                                    </p>
                                    <ul className="mt-1 text-muted-foreground">
                                        {Object.entries(pending).map(
                                            ([type, days]) => (
                                                <li key={type}>
                                                    {type}: {Number(days).toFixed(3)}{' '}
                                                    days
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {balances.map((balance: Balance) => (
                                <BalanceCard
                                    key={balance.leave_type}
                                    balance={balance}
                                    isFetching={isFetching}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="space-y-4">
                        <div>
                            <h2 className="font-semibold">Leave history</h2>
                            <p className="text-sm text-muted-foreground">
                                Review accruals, deductions, and filed
                                transactions.
                            </p>
                        </div>
                        <DataTable
                            data={transactions?.data}
                            columns={HistoryColumns}
                        />
                        <PaginationButton
                            currentPage={transactions?.current_page ?? 1}
                            lastPage={transactions?.last_page ?? 1}
                            onPageChange={setPage}
                            isLoading={isFetching}
                        />
                    </TabsContent>

                    <TabsContent
                        value="form"
                        className="grid gap-4 lg:grid-cols-2"
                    >
                        <Collapsible
                            open={openLeave}
                            onOpenChange={setOpenLeave}
                            className="rounded-xl border bg-card shadow-sm"
                        >
                            <CollapsibleTrigger className="flex w-full items-center justify-between p-5 text-left">
                                <span className="flex items-center gap-3">
                                    <span className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-300">
                                        <Plane className="size-4" />
                                    </span>
                                    <span>
                                        <span className="block font-semibold">
                                            File leave
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Create a new leave transaction
                                        </span>
                                    </span>
                                </span>
                                <ChevronRight
                                    className={`size-4 text-muted-foreground transition-transform ${openLeave ? 'rotate-90' : ''}`}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="border-t p-5">
                                <LeaveForm
                                    key={`leave-${date.month}-${date.year}`}
                                    user={user}
                                    date={date}
                                />
                            </CollapsibleContent>
                        </Collapsible>
                        {canRecordUndertime && (
                            <Collapsible
                                open={openUndertime}
                                onOpenChange={setOpenUndertime}
                                className="rounded-xl border bg-card shadow-sm"
                            >
                                <CollapsibleTrigger className="flex w-full items-center justify-between p-5 text-left">
                                    <span className="flex items-center gap-3">
                                        <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300">
                                            <TimerOffIcon className="size-4" />
                                        </span>
                                        <span>
                                            <span className="block font-semibold">
                                                Record undertime
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Log tardiness or undertime
                                            </span>
                                        </span>
                                    </span>
                                    <ChevronRight
                                        className={`size-4 text-muted-foreground transition-transform ${openUndertime ? 'rotate-90' : ''}`}
                                    />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="border-t p-5">
                                    <UndertimeForm
                                        key={`undertime-${date.month}-${date.year}`}
                                        user={user}
                                        date={date}
                                    />
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

EmployeeBalance.layout = {
    breadcrumbs: [{ title: 'My Balance' }],
};
