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

/**
 * Tints for the org-unit chips. Keyed by a hash of the unit's own name/code, so
 * a given section or unit keeps the same colour on every row, every page load,
 * and across users — while two different units are unlikely to collide.
 *
 * Each entry is a full light/dark pair because the table is used in both
 * themes; a single bg-* class would be unreadable in one of them.
 */
const UNIT_TINTS = [
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
    'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300',
    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300',
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
];

/**
 * Employee status has a fixed, semantic colour per type — unlike the org-unit
 * chips, where the tint is decorative and derived from the value. Keep the keys
 * in step with the Rule::in() allow-list in UserController::store.
 */
const EMPLOYEE_STATUS: Record<string, { label: string; css: string }> = {
    'new employee': {
        label: 'New Employee',
        css: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    },
    transferee: {
        label: 'Transferee',
        css: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
    },
    old: {
        label: 'Old Employee',
        css: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
    },
};

/**
 * One shape for every chip in this table — border, radius, padding and type
 * scale all come from the Badge variant, and CHIP_TEXT adds the mono 11px
 * treatment the org-code chips were using.
 *
 * Without this the columns each picked their own typography: the code chips
 * rendered as `font-mono text-[11px]` while position and employee status fell
 * back to the Badge default of `text-xs font-medium`. Same colours, two
 * different looking chips — the row read as if it came from two tables. Only
 * the colour (tint vs. semantic) now varies per cell; the shape does not.
 */
const CHIP_TEXT = 'font-mono text-[11px] leading-none';

/**
 * Stable string hash (djb2). Deliberately not array index or row order: the
 * colour has to survive re-sorting, filtering and pagination.
 */
function hashTint(value: string): number {
    let hash = 5381;

    for (let i = 0; i < value.length; i++) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }

    return Math.abs(hash) % UNIT_TINTS.length;
}

/**
 * The "nothing assigned" state, shared by every optional column.
 *
 * A chip rather than plain text so absence reads as a deliberate state of the
 * cell rather than an unstyled value that failed to load. Dashed border plus
 * muted colour keeps it visually distinct from a real assigned value, so it
 * never gets skimmed past as data.
 */
function NotAssignedBadge({ title }: { title: string }) {
    return (
        <Badge
            variant="outline"
            className={`${CHIP_TEXT} border-dashed text-muted-foreground`}
            title={title}
        >
            N/A
        </Badge>
    );
}

/**
 * Division/Section/Unit are shown as their short code in a chip, tinted by the
 * unit itself so the org structure is readable at a glance.
 *
 * The full "CODE — Name" string made every row several times wider than the
 * code alone warranted and wrapped badly on narrow screens, so the name is kept
 * as the tooltip and as the visible label when a record has no code yet.
 */
function CodeBadge({ code, fallback }: { code?: string; fallback?: string }) {
    const label = code || fallback;

    if (!label) {
        return <NotAssignedBadge title="No unit assigned" />;
    }

    return (
        <Badge
            className={`${CHIP_TEXT} ${UNIT_TINTS[hashTint(label)]}`}
            title={fallback}
        >
            {label}
        </Badge>
    );
}

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
                <CodeBadge
                    code={division?.division_code}
                    fallback={division?.division_name}
                />
            );
        },
    },
    {
        accessorKey: 'section',
        header: () => <div className="text-left">Section</div>,
        cell: ({ row }) => {
            const section = row.original.section;

            return (
                <CodeBadge
                    code={section?.section_code}
                    fallback={section?.section_name}
                />
            );
        },
    },
    {
        accessorKey: 'position',
        header: () => <div className="text-left">Position</div>,
        cell: ({ row }) => {
            const position = row.original.position;

            if (!position) {
                return <NotAssignedBadge title="No position assigned" />;
            }

            // Tinted by the job title itself, so "Programmer" is the same colour
            // in every row and the column scans as a set rather than a wall of
            // identical grey chips.
            return (
                <Badge
                    className={`${CHIP_TEXT} max-w-[16rem] truncate ${UNIT_TINTS[hashTint(position)]}`}
                >
                    {position}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'unit',
        header: () => <div className="text-left">Unit</div>,
        cell: ({ row }) => {
            const unit = row.original.unit;

            return (
                <CodeBadge code={unit?.unit_code} fallback={unit?.unit_name} />
            );
        },
    },
    {
        accessorKey: 'employee_type',
        header: () => <div className="text-left">Employee Status</div>,
        cell: ({ row }) => {
            const employeeType = row.original.employee_type;

            // Status colours are semantic, not decorative: each type has one
            // fixed meaning, so this is an explicit map rather than a hash.
            // Mirrors the Rule::in() allow-list in UserController.
            const status = EMPLOYEE_STATUS[employeeType ?? ''];

            if (!status) {
                // The previous ternary chain fell through to "Old Employee" for
                // anything unrecognised — including a null type — so an employee
                // with no status recorded was reported as a legacy one.
                return <NotAssignedBadge title="No employee status recorded" />;
            }

            return (
                <Badge className={`${CHIP_TEXT} ${status.css}`}>
                    {status.label}
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
