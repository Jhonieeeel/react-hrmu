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
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Leave } from '@/types';
import { Check, X } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Textarea } from '../ui/textarea';
import { useForm } from '@inertiajs/react';
import leaves from '@/routes/leaves';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type FilingProp = {
    children: React.ReactNode;
    leave: Leave;
};

export function EditHistoryDialog({ children, leave }: FilingProp) {
    const form = useForm({
        id: leave?.id,
        status: leave?.status,
        remarks: '',
    });

    const queryClient = useQueryClient();

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        form.submit(leaves.update(form.data.id), {
            onSuccess: () => {
                form.reset();
                queryClient.invalidateQueries({
                    queryKey: ['leaves'],
                });
            },
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <DialogHeader>
                        <DialogTitle>Edit Balance</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when
                            you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="status">Filing Status</Label>
                            <ToggleGroup
                                type="single"
                                value={
                                    form.data.status
                                        ? 'completed'
                                        : 'incomplete'
                                }
                                onValueChange={(value) => {
                                    if (!value) return;
                                    form.setData(
                                        'status',
                                        value === 'completed',
                                    );
                                }}
                                className="grid grid-cols-2 gap-3"
                            >
                                <ToggleGroupItem
                                    value={'completed'}
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 text-emerald-600 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-emerald-400 dark:data-[state=on]:text-white"
                                >
                                    <Check className="size-4" />
                                    <span className="font-medium">
                                        Completed
                                    </span>
                                </ToggleGroupItem>

                                <ToggleGroupItem
                                    value="incomplete"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive/60 hover:bg-destructive/10 data-[state=on]:scale-[1.02] data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:shadow-lg"
                                >
                                    <X className="size-4" />
                                    <span className="font-medium">
                                        Incomplete
                                    </span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <FieldError className="text-red-700 dark:text-red-300">
                                {form.errors.status}
                            </FieldError>
                        </Field>
                        <Field>
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                onChange={(e) => {
                                    form.setData('remarks', e.target.value);
                                }}
                                placeholder="Type your message here."
                            />

                            <FieldError className="text-red-700 dark:text-red-300">
                                {form.errors.remarks}
                            </FieldError>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">
                            {form.processing ? 'Submiting' : 'Submit'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
