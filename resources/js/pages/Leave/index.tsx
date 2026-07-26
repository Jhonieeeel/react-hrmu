import { FilingColumns } from '@/components/Leave/columns/FilingColumns';
import FilterButton from '@/components/Leave/FilterButton';
import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import getFilingOption from '@/queries/fetchMonthlyFiling';
import { dashboard } from '@/routes';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function Leaves() {
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

    const { data: filing, isFetching } = useQuery(
        getFilingOption(date.month, date.year, page),
    );

    return (
        <>
            <Head title="Leaves" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold dark:text-accent">
                            Monthly Filing Overview
                        </h1>
                        <p className="text-sm">
                            Review and manage leave applications for the current
                            period.
                        </p>
                    </div>
                    <div>
                        <FilterButton handleFilter={handleFilter} date={date} />
                    </div>
                </div>
                <div className="relative min-h-screen flex-1 space-y-4 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <DataTable
                        data={filing?.data ?? []}
                        columns={FilingColumns}
                    />
                    <PaginationButton
                        currentPage={filing?.current_page ?? 1}
                        lastPage={filing?.last_page ?? 1}
                        onPageChange={setPage}
                        isLoading={isFetching}
                    />
                </div>
            </div>
        </>
    );
}

Leaves.layout = {
    breadcrumbs: [
        {
            title: 'Leaves',
            href: dashboard(),
        },
    ],
};
