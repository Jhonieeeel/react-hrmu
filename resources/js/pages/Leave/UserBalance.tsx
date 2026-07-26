import BalanceCard from '@/components/Leave/BalanceCard';
import { HistoryColumns } from '@/components/Leave/columns/HistoryColumn';
import FilterButton from '@/components/Leave/FilterButton';
import LeaveForm from '@/components/Leave/LeaveForm';
import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import UndertimeForm from '@/components/Leave/UndertimeForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import getUserBalanceOption from '@/queries/fetchUserBalance';
import leaves from '@/routes/leaves';
import { User } from '@/types';
import { Head } from '@inertiajs/react';
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
    const [date, setDate] = useState({
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
    });

    const [page, setPage] = useState(1);

    function handleFilter(key: 'month' | 'year', value: string) {
        setDate((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    const { data: userData, isFetching } = useQuery(
        getUserBalanceOption(date.month, date.year, user.id),
    );

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
                    <div>
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
                        {userData?.transactions && (
                            <>
                                <DataTable
                                    data={userData.transactions.data}
                                    columns={HistoryColumns}
                                />

                                <PaginationButton
                                    currentPage={
                                        userData.transactions.current_page
                                    }
                                    lastPage={userData.transactions.last_page}
                                    onPageChange={setPage}
                                    isLoading={isFetching}
                                />
                            </>
                        )}
                    </TabsContent>
                    <TabsContent
                        value="form"
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="col-span-2 w-full rounded-lg border bg-background/20 p-8 shadow-md md:col-span-1 dark:border-accent/40">
                            <h1 className="mb-4 inline-flex items-center gap-2 text-2xl font-semibold dark:text-accent">
                                <Plane />
                                Leave Form
                            </h1>
                            <LeaveForm user={user} />
                        </div>
                        <div className="col-span-2 w-full rounded-lg border bg-background/20 p-8 shadow-md md:col-span-1 dark:border-accent/40">
                            <h1 className="mb-4 inline-flex items-center gap-2 text-2xl font-semibold dark:text-accent">
                                <TimerOffIcon />
                                Undertime Form
                            </h1>
                            <UndertimeForm user={user} />
                        </div>
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
