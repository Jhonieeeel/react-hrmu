import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Leave } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format, isSameDay } from 'date-fns';

import {
    Accessibility,
    Anvil,
    ArrowLeftRight,
    Baby,
    BadgeCheck,
    BriefcaseMedical,
    Clock3,
    ClockArrowDown,
    CloudRain,
    GraduationCap,
    HeartHandshake,
    HeartPulse,
    LucideIcon,
    MoreHorizontal,
    Plane,
    ShieldAlert,
    Snail,
    Users,
} from 'lucide-react';

import { FilingDialog } from '../FilingDialog';
import { EditHistoryDialog } from '../EditHistoryDialog';

const badgeType: Record<string, LucideIcon> = {
    'vacation leave': Plane,
    'sick leave': BriefcaseMedical,
    'force leave': Anvil,
    'wellness leave': HeartPulse,
    'paternity leave': Baby,
    'special privilege leave': BadgeCheck,
    'solo parent leave': Users,
    '10-day vawc leave': ShieldAlert,
    'special emergency (calamity) leave': CloudRain,
    'maternity leave': Baby,
    'study leave': GraduationCap,
    'rehabilitation leave': Accessibility,
    'adoption leave': HeartHandshake,
    cto: Clock3,
    offset: ArrowLeftRight,

    // Non-leave events
    undertime: ClockArrowDown,
    tardiness: Snail,
};
export const HistoryColumns: ColumnDef<Leave>[] = [
    {
        accessorKey: 'leave_type',
        header: () => <div className="text-left">Leave type</div>,
        cell: ({ row }) => {
            const { event_tag, leave_type, event_type } = row.original;

            const leaveName = ['undertime', 'tardiness'].includes(event_tag)
                ? event_tag
                : leave_type.toLowerCase();

            const Icon = badgeType[leaveName];

            const isAccrual = event_type === 'accrual';

            // bg-green-500/10
            // bg-destructive/10

            return (
                <div
                    className={`flex items-center ${
                        isAccrual
                            ? `gap-1 border-green-500/30 text-green-600 dark:text-green-400`
                            : `gap-1 border-destructive/30 text-destructive`
                    }`}
                >
                    {Icon && <Icon className="size-3.5" />}

                    <span className="capitalize">{leaveName}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'balance',
        header: () => <div className="text-left">Balance</div>,
        cell: ({ row }) => {
            const { event_type, balance } = row.original;

            const isAccrual = event_type === 'accrual';
            const sign = isAccrual ? '+' : '';

            return (
                <div
                    className={
                        isAccrual
                            ? `gap-1 border-green-500/30 text-green-600 dark:text-green-400`
                            : `gap-1 border-destructive/30 text-destructive`
                    }
                >
                    {sign}
                    {balance.toFixed(3)}
                </div>
            );
        },
    },
    {
        accessorKey: 'starts_at',
        header: () => <div className="text-left">Date</div>,
        cell: ({ row }) => {
            const { starts_at, ends_at } = row.original;

            const start = new Date(starts_at);
            const end = new Date(ends_at);

            const date = isSameDay(start, end)
                ? format(start, 'MMM d, yyyy')
                : `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;

            return <span className="font-medium">{date}</span>;
        },
    },
    {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
            const { event_tag, starts_at, ends_at } = row.original;

            const start = new Date(starts_at);
            const end = new Date(ends_at);

            if (['tardiness', 'undertime'].includes(event_tag)) {
                const minutes = Math.round(
                    (end.getTime() - start.getTime()) / (1000 * 60),
                );

                return (
                    <span>
                        {minutes} {minutes === 1 ? 'min' : 'mins'}
                    </span>
                );
            }

            const days =
                Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                ) + 1;

            return (
                <span>
                    {days} {days === 1 ? 'day' : 'days'}
                </span>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const leave = row.original;

            const isTimeRecord = ['tardiness', 'undertime'].includes(
                leave.event_tag,
            );

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
                        {leave.event_type === 'deduction' && (
                            <EditHistoryDialog leave={leave}>
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Edit
                                </DropdownMenuItem>
                            </EditHistoryDialog>
                        )}
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
