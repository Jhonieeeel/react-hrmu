import { Leave } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format, isSameDay } from 'date-fns';
import {
    Anvil,
    BriefcaseMedical,
    ClockArrowDown,
    LucideIcon,
    Plane,
    Snail,
} from 'lucide-react';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
const badgeType: Record<string, LucideIcon> = {
    'vacation leave': Plane,
    'sick leave': BriefcaseMedical,
    'force leave': Anvil,
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
        accessorKey: 'event_type',
        header: () => <div className="text-left">Event Type</div>,
        cell: ({ row }) => {
            const { event_type } = row.original;

            const isAccrual = event_type === 'accrual';

            return (
                <div
                    className={
                        isAccrual
                            ? `gap-1 border-green-500/30 text-green-600 dark:text-green-400`
                            : `gap-1 border-destructive/30 text-destructive`
                    }
                >
                    {event_type}
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
    // {
    //     id: 'actions',
    //     cell: ({ row }) => {
    //         const user = row.original.user;

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
    //                     <FilingDialog>
    //                         <DropdownMenuItem
    //                             onSelect={(e) => e.preventDefault()}
    //                         >
    //                             Filing
    //                         </DropdownMenuItem>
    //                     </FilingDialog>
    //                     <DropdownMenuSeparator />
    //                     <DropdownMenuItem>
    //                         <Link href={leaves.show(user?.id)}>
    //                             View Balance
    //                         </Link>
    //                     </DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         );
    //     },
    // },
];
