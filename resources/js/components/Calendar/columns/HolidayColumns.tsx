'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { monthName } from '@/lib/utils';
import type { Holiday } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import holidays from '@/routes/holidays';

export const HolidayColumns: ColumnDef<Holiday>[] = [
    {
        accessorKey: 'holiday_name',
        header: () => <div className="text-left">Holiday Name</div>,
        cell: ({ row }) => {
            const name = row.original.holiday_name;

            return <div className="text-left font-medium">{name}</div>;
        },
    },
    {
        accessorKey: 'day',
        header: () => <div className="text-left">Day</div>,
        cell: ({ row }) => {
            const day = row.original.day;

            return <div className="text-left font-medium">{day}</div>;
        },
    },
    {
        accessorKey: 'month',
        header: () => <div className="text-left">Month</div>,
        cell: ({ row }) => {
            const month = monthName(row.original.month);

            return <div>{month}</div>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const holiday = row.original;

            function handleDelete() {
                router.delete(holidays.destroy({ holiday: holiday.id! }).url);
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];