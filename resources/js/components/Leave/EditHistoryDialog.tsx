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
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Leave } from '@/types';
import { Check, X } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Textarea } from '../ui/textarea';
import { useForm } from '@inertiajs/react';
import leaves from '@/routes/leaves';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import SelectCombobox from './SelectCombobox';
import { event_types } from './constants/constants';
import DatePicker from './DatePicker';

type FilingProp = {
    leave: Leave;
    open: boolean;
    onOpenChange: (value: boolean) => void;
};

export function EditHistoryDialog({ leave, open, onOpenChange }: FilingProp) {
    const form = useForm({
        id: leave?.id,
        user_id: leave?.user_id,
        leave_type: leave?.leave_type,
        event_type: leave?.event_type,
        event_tag: leave?.event_tag,
        balance: 0,
        starts_at: leave?.starts_at,
        ends_at: leave?.ends_at,
        status: leave?.status,
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
        <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
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
                            <Label htmlFor="status">Leave Type</Label>
                            <SelectCombobox
                                items={event_types.map((event) => ({
                                    value: event.leave_type.toLowerCase(),
                                    label: event.leave_type,
                                }))}
                                value={form.data.leave_type}
                                onValueChange={(value: string) => {
                                    form.setData('leave_type', value);
                                    if (
                                        String(value).toLowerCase() ===
                                        'force leave'
                                    )
                                        form.setData(
                                            'event_tag',
                                            'vacation leave',
                                        );
                                }}
                                placeholder="Select leave type"
                            />
                            <FieldError className="text-red-700 dark:text-red-300">
                                {form.errors.leave_type}
                            </FieldError>
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Starting Date</FieldLabel>
                            <DatePicker
                                value={form.data.starts_at}
                                disabled={!form.data.leave_type}
                                placeholder="Select date"
                                onChange={(date) => {
                                    form.setData('starts_at', date);
                                    form.setData('ends_at', date);
                                }}
                            />
                            <FieldError>{form.errors.starts_at}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Ending Date</FieldLabel>
                            <DatePicker
                                value={form.data.ends_at}
                                disabled={!form.data.leave_type}
                                placeholder="Select date"
                                onChange={(date) => {
                                    form.setData('ends_at', date);
                                }}
                            />
                            <FieldError>{form.errors.ends_at}</FieldError>
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
