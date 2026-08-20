import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddUserBalance from '@/components/User/AddUserBalance';
import { UserColumns } from '@/components/User/columns/UserColumns';
import CreateUserForm from '@/components/User/CreateUserForm';
import UserMonthlyFilingForm from '@/components/User/UserMonthlyFilingForm';
import getUsers from '@/queries/fetchUsers';
import users from '@/routes/users';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users2, UserSquare } from 'lucide-react';
import { useState } from 'react';

type PageProp = {
    users_data: [];
};

export default function User({ users_data }: PageProp) {
    const [page, setPage] = useState(1);

    const { data: users, isFetching } = useQuery(getUsers(page));

    return (
        <>
            <Head title="User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold dark:text-accent">
                            OCD Caraga Employees
                        </h1>
                        <p className="text-sm">
                            Review and manage leave applications for the current
                            period.
                        </p>
                    </div>
                </div>

                <div className="relative min-h-screen flex-1 space-y-4 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <Tabs defaultValue="balance" className="space-y-6">
                        <TabsList variant="line">
                            <TabsTrigger value="users">
                                <Users2 className="mr-2 h-4 w-4" />
                                Users
                            </TabsTrigger>
                            <TabsTrigger value="create">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Create
                            </TabsTrigger>
                            <TabsTrigger value="balance">
                                <UserSquare className="mr-2 h-4 w-4" />
                                Add Balance
                            </TabsTrigger>
                        </TabsList>

                        {/* Users */}
                        <TabsContent value="users">
                            <DataTable
                                data={users?.data ?? []}
                                columns={UserColumns}
                            />
                            <PaginationButton
                                currentPage={users?.current_page ?? 1}
                                lastPage={users?.last_page ?? 1}
                                onPageChange={setPage}
                                isLoading={isFetching}
                            />
                        </TabsContent>

                        {/* Create User */}
                        <TabsContent value="create">
                            <CreateUserForm />
                        </TabsContent>

                        {/* Create User */}
                        <TabsContent value="balance">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                {/* Add Balance */}
                                <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold tracking-tight">
                                            Add Balance
                                        </h2>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Create a new employee account and
                                            assign their initial balance.
                                        </p>
                                    </div>

                                    <AddUserBalance users_data={users_data} />
                                </section>

                                {/* Monthly Filing */}
                                <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                                    <div className="mb-6">
                                        <h2 className="text-lg font-semibold tracking-tight">
                                            Monthly Filing Form
                                        </h2>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Record an employee's leave type,
                                            balance, and filing period.
                                        </p>
                                    </div>

                                    <UserMonthlyFilingForm
                                        users_data={users_data}
                                    />
                                </section>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

User.layout = {
    breadcrumbs: [
        {
            title: 'User',
            href: users.index(),
        },
    ],
};
