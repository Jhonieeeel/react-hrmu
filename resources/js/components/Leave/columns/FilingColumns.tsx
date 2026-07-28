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
import { Leave, User } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { FilingDialog } from '../FilingDialog';
import { Link } from '@inertiajs/react';
import leaves from '@/routes/leaves';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const FilingColumns: ColumnDef<Leave>[] = [
    {
        accessorKey: 'user.name',
        header: () => <div className="text-left">Employee Name</div>,
        cell: ({ row }) => {
            const name = row.original.user?.name;

            return <div className="text-left font-medium">{name}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: () => <div className="text-left">Filing Status</div>,
        cell: ({ row }) => {
            const status = row.original.status;

            const css = status
                ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';

            return (
                <Badge className={`${css}`}>
                    {status ? 'Completed' : 'Pending'}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original.user;
            const leave = row.original;

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
                        <FilingDialog leave={leave}>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                            >
                                Filing
                            </DropdownMenuItem>
                        </FilingDialog>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href={leaves.show(user?.id)}>
                                View Balance
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
