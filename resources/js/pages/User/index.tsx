import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Building2, UserPlus, Users2, UserSquare } from 'lucide-react';
import { useState } from 'react';
import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useFlashToast from '@/components/useFlashToast';
import AddUserBalance from '@/components/User/AddUserBalance';
import { UserColumns } from '@/components/User/columns/UserColumns';
import CreateUserForm from '@/components/User/CreateUserForm';
import OrganizationManager from '@/components/User/OrganizationManager';
import UserMonthlyFilingForm from '@/components/User/UserMonthlyFilingForm';
import getUsers from '@/queries/fetchUsers';
import users from '@/routes/users';
import type { EmployeeSummary, FlashMessageProp } from '@/types';

type PageProp = {
    users_data: EmployeeSummary[];
    divisions: Array<{
        id: number;
        division_name: string;
        division_code: string;
    }>;
    sections: Array<{
        id: number;
        division_id: number | null;
        section_name: string;
        section_code: string;
    }>;
    units: Array<{
        id: number;
        section_id: number;
        unit_name: string;
        unit_code: string;
    }>;
    flash: {
        success: FlashMessageProp | null;
    };
};

export default function User({
    users_data,
    divisions,
    sections,
    units,
    flash,
}: PageProp) {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        section_id: '',
        unit_id: '',
        position: '',
    });

    const { data: users, isFetching } = useQuery(getUsers(page, filters));

    useFlashToast(flash);

    return (
        <>
            <Head title="User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto px-4 py-6 md:px-8 md:py-8">
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
                    <Tabs defaultValue="users" className="space-y-6">
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
                            <TabsTrigger value="organization">
                                <Building2 className="mr-2 h-4 w-4" />
                                Organization
                            </TabsTrigger>
                        </TabsList>

                        {/* Users */}
                        <TabsContent value="users" className="space-y-4">
                            <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3">
                                <label className="space-y-1.5 text-sm font-medium">
                                    Position
                                    <input
                                        value={filters.position}
                                        onChange={(event) => {
                                            setPage(1);
                                            setFilters((current) => ({
                                                ...current,
                                                position: event.target.value,
                                            }));
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                setPage(1);
                                            }
                                        }}
                                        placeholder="Search position"
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/50"
                                    />
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Section
                                    <select
                                        value={filters.section_id}
                                        onChange={(event) => {
                                            setPage(1);
                                            setFilters((current) => ({
                                                ...current,
                                                section_id: event.target.value,
                                                unit_id: '',
                                            }));
                                        }}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/50"
                                    >
                                        <option value="">All sections</option>
                                        {sections.map((section) => (
                                            <option
                                                key={section.id}
                                                value={section.id}
                                            >
                                                {section.section_code} —{' '}
                                                {section.section_name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-1.5 text-sm font-medium">
                                    Unit
                                    <select
                                        value={filters.unit_id}
                                        onChange={(event) => {
                                            setPage(1);
                                            setFilters((current) => ({
                                                ...current,
                                                unit_id: event.target.value,
                                            }));
                                        }}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/50"
                                    >
                                        <option value="">All units</option>
                                        {units
                                            .filter(
                                                (unit) =>
                                                    !filters.section_id ||
                                                    unit.section_id ===
                                                        Number(
                                                            filters.section_id,
                                                        ),
                                            )
                                            .map((unit) => (
                                                <option
                                                    key={unit.id}
                                                    value={unit.id}
                                                >
                                                    {unit.unit_code} —{' '}
                                                    {unit.unit_name}
                                                </option>
                                            ))}
                                    </select>
                                </label>
                            </div>
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
                            <CreateUserForm
                                divisions={divisions}
                                sections={sections}
                                units={units}
                            />
                        </TabsContent>

                        <TabsContent value="organization">
                            <OrganizationManager
                                divisions={divisions}
                                sections={sections}
                                units={units}
                            />
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
