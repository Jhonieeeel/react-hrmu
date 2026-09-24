'use client';

import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
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
import users_info from '@/routes/users_info';
import type { EmployeeRecord } from '@/types';

export const UserColumns: ColumnDef<EmployeeRecord>[] = [
    {
        accessorKey: 'name',
        header: () => <div className="text-left">Employee Name</div>,
        cell: ({ row }) => {
            const name = row.original.name;

            return <div className="text-left font-medium">{name}</div>;
        },
    },
    {
        accessorKey: 'division',
        header: () => <div className="text-left">Division</div>,
        cell: ({ row }) => {
            const division = row.original.division;

            return (
                <div className="text-left font-medium">
                    {division
                        ? `${division.division_code} — ${division.division_name}`
                        : 'Unassigned'}
                </div>
            );
        },
    },
    {
        accessorKey: 'section',
        header: () => <div className="text-left">Section</div>,
        cell: ({ row }) => {
            const section = row.original.section;

            return (
                <div className="text-left font-medium">
                    {section
                        ? `${section.section_code} — ${section.section_name}`
                        : 'Unassigned'}
                </div>
            );
        },
    },
    {
        accessorKey: 'position',
        header: () => <div className="text-left">Position</div>,
        cell: ({ row }) => (
            <div className="text-left font-medium">
                {row.original.position || 'Unassigned'}
            </div>
        ),
    },
    {
        accessorKey: 'unit',
        header: () => <div className="text-left">Unit</div>,
        cell: ({ row }) => {
            const unit = row.original.unit;

            return (
                <div className="text-left font-medium">
                    {unit
                        ? `${unit.unit_code} — ${unit.unit_name}`
                        : 'Unassigned'}
                </div>
            );
        },
    },
    {
        accessorKey: 'employee_type',
        header: () => <div className="text-left">Employee Status</div>,
        cell: ({ row }) => {
            const employeeType = row.original.employee_type;

            const styles = {
                'new employee':
                    'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
                transferee:
                    'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
                old: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
            };

            const css =
                styles[employeeType as keyof typeof styles] ??
                'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';

            return (
                <Badge className={css}>
                    {employeeType === 'new employee'
                        ? 'New Employee'
                        : employeeType === 'transferee'
                          ? 'Transferee'
                          : 'Old Employee'}
                </Badge>
            );
        },
    },

    {
        id: 'actions',
        cell: ({ row }) => {
            const employee = row.original;

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
                        <DropdownMenuItem asChild>
                            <Link
                                href={users_info.show(employee.user_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                prefetch
                            >
                                View User
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
