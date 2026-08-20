import AccrualButton from '@/components/Leave/AccrualButton';
import BalanceCard from '@/components/Leave/BalanceCard';
import { HistoryColumns } from '@/components/Leave/columns/HistoryColumn';
import FilterButton from '@/components/Leave/FilterButton';
import LeaveForm from '@/components/Leave/LeaveForm';
import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import UndertimeForm from '@/components/Leave/UndertimeForm';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { readFiltersFromUrl } from '@/lib/utils';
import getUserBalanceOption from '@/queries/fetchUserBalance';
import leaves from '@/routes/leaves';
import { User } from '@/types';
import { Head, router, useRemember } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    NotebookPen,
    Plane,
    Scale,
    TableCellsMerge,
    TimerOffIcon,
} from 'lucide-react';
import { useState } from 'react';

type PageProp = {
    user: User;
};

export default function UserBalance({ user }: PageProp) {
    // const [date, setDate] = useState({
    //     month: String(new Date().getMonth() + 1),
    //     year: String(new Date().getFullYear()),
    // });

    const [date, setDate] = useRemember(readFiltersFromUrl(), 'Filing:filters');

    const [page, setPage] = useState(1);

    const [openLeave, setOpenLeave] = useState(false);

    const [openUndertime, setOpenUndertime] = useState(false);

    function handleFilter(key: 'month' | 'year', value: string) {
        setDate((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    const { data: userData, isFetching } = useQuery(
        getUserBalanceOption(date.month, date.year, user.id, page),
    );

    const transactions = userData?.transactions;

    return (
        <>
            <Head title="Leaves" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold dark:text-accent">
                            {user.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {userData?.hasAccrual && (
                            <AccrualButton filters={date} user_id={user?.id} />
                        )}
                        <FilterButton handleFilter={handleFilter} date={date} />
                    </div>
                </div>
                <Tabs defaultValue="balance" className="space-y-6">
                    <TabsList variant="line">
                        <TabsTrigger value="balance">
                            <Scale className="mr-2 h-4 w-4" />
                            Balances
                        </TabsTrigger>

                        <TabsTrigger value="table">
                            <TableCellsMerge className="mr-2 h-4 w-4" />
                            History
                        </TabsTrigger>

                        <TabsTrigger value="form">
                            <NotebookPen className="mr-2 h-4 w-4" />
                            Form
                        </TabsTrigger>
                    </TabsList>

                    {/* Balance */}
                    <TabsContent value="balance">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {userData?.balances?.map((balance) => (
                                <BalanceCard
                                    key={balance.leave_type}
                                    balance={balance}
                                    isFetching={isFetching}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {/* History */}
                    <TabsContent value="table" className="space-y-4">
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

                    {/* Form */}
                    <TabsContent value="form">
                        <Collapsible
                            className={`max-w-5xl rounded-lg bg-background/20 p-8 ${openLeave ? 'border shadow-md' : ''} md:col-span-1 dark:border-accent/40`}
                            open={openLeave}
                            onOpenChange={setOpenLeave}
                        >
                            <CollapsibleTrigger className="flex items-center gap-2">
                                <p className="text-md mb-4 inline-flex items-center gap-2 font-semibold dark:text-accent">
                                    <Plane />
                                    Leave Form
                                </p>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <LeaveForm user={user} />
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible
                            className={`max-w-5xl rounded-lg bg-background/20 p-8 ${openUndertime ? 'border shadow-md' : ''} md:col-span-1 dark:border-accent/40`}
                            open={openUndertime}
                            onOpenChange={setOpenUndertime}
                        >
                            <CollapsibleTrigger>
                                <p className="text-md mb-4 inline-flex items-center gap-2 font-semibold dark:text-accent">
                                    <TimerOffIcon />
                                    Undertime Form
                                </p>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <UndertimeForm user={user} />
                            </CollapsibleContent>
                        </Collapsible>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

UserBalance.layout = {
    breadcrumbs: [
        {
            title: 'Users Filing',
            href: leaves.data(),
        },
        {
            title: 'User Balance',
        },
    ],
};
