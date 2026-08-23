import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React from 'react';

import leaves from '@/routes/leaves';

import { Filters } from '@/types';
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns';

type InitialAccrualProps = {
    filters: Filters;
    user_id: number;
};

export default function AccrualDialog({
    filters,
    user_id,
}: InitialAccrualProps) {
    const base = new Date(Number(filters.year), Number(filters.month) - 1, 1);

    const targetMonth = addMonths(base, 1);

    const starts_at = format(startOfMonth(targetMonth), 'yyyy-MM-dd');
    const ends_at = format(endOfMonth(targetMonth), 'yyyy-MM-dd');

    const form = useForm({
        user_id: user_id,
        vacation_leave: 'vacation leave',
        vl_balance: 0,
        sick_leave: 'sick leave',
        sl_balance: 0,
        starts_at: starts_at,
        ends_at: ends_at,
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        form.submit(leaves.initial_accrual(form.data.user_id), {
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    className="dark:bg-brand dark:text-brand-foreground flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Initial Acctual
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add Initial Balance</DialogTitle>
                    <DialogDescription>
                        Add the initial balance for the employee's leave types.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="vacation-leave">
                                Vacation Leave (VL)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="vacation-leave"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    placeholder="0"
                                    value={form.data.vl_balance}
                                    onChange={(e) =>
                                        form.setData(
                                            'vl_balance',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="pr-14"
                                />
                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    days
                                </span>
                            </div>
                        </div>
                        {/* Sick Leave */}
                        <div className="space-y-2">
                            <Label htmlFor="sick-leave">Sick Leave (SL)</Label>

                            <div className="relative">
                                <Input
                                    id="sick-leave"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    placeholder="0"
                                    value={form.data.sl_balance}
                                    onChange={(e) =>
                                        form.setData(
                                            'sl_balance',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="pr-14"
                                />

                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    days
                                </span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
