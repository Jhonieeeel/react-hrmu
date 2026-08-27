'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import leaves from '@/routes/leaves';
import users_info from '@/routes/users_info';
import { Holiday, User } from '@/types';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

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
            const month = row.original.month;

            return <div>{month}</div>;
        },
    },
    // {
    //     id: 'actions',
    //     cell: ({ row }) => {
    //         const user = row.original;
    //         const leave = row.original;

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal className="h-4 w-4" />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuSeparator />
    //                     <DropdownMenuItem asChild>
    //                         <Link
    //                             href={users_info.show(user)}
    //                             target="_blank"
    //                             rel="noopener noreferrer"
    //                             prefetch
    //                         >
    //                             View User
    //                         </Link>
    //                     </DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         );
    //     },
    // },
];
