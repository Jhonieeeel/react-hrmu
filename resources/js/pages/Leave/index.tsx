import { FilingColumns } from '@/components/Leave/columns/FilingColumns';
import DownloadButton from '@/components/Leave/ExportButton';
import FilterButton from '@/components/Leave/FilterButton';
import PaginationButton from '@/components/Leave/PaginationButton';
import { DataTable } from '@/components/Leave/table/DataTable';
import getFilingOption from '@/queries/fetchMonthlyFiling';
import { dashboard } from '@/routes';
import { Head, router, useRemember } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

type PageProp = {
    flash: {
        downloadUrl: string;
    };
};

function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const now = new Date();

    return {
        month: params.get('month') ?? String(now.getMonth() + 1),
        year: params.get('year') ?? String(now.getFullYear()),
    };
}

export default function Leaves({ flash }: PageProp) {
    const [date, setDate] = useRemember(readFiltersFromUrl(), 'Filing:filters');

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

    const columns = useMemo(
        () => FilingColumns({ month: date.month, year: date.year }),
        [date.month, date.year],
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
                    <div className="flex items-center gap-3">
                        <DownloadButton flash={flash} date={date} />
                        <FilterButton handleFilter={handleFilter} date={date} />
                    </div>
                </div>
                <div className="relative min-h-screen flex-1 space-y-4 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <DataTable data={filing?.data ?? []} columns={columns} />
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
