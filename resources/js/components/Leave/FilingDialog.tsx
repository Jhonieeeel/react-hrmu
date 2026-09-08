import { useState } from 'react';
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
import leaves from '@/routes/leaves';
import { Leave } from '@/types';
import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

type FilingProp = {
    children: React.ReactNode;
    leave: Leave;
};

export function FilingDialog({ children, leave }: FilingProp) {
    const [open, setOpen] = useState(false);

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

                setOpen(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>{leave.user?.name}</DialogTitle>
                        <DialogDescription>
                            Update the filing status for this leave.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Label>Filing Status</Label>

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
                                className="grid grid-cols-2 gap-2"
                            >
                                <ToggleGroupItem
                                    value="completed"
                                    className="h-10 rounded-md border text-sm data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white"
                                >
                                    <Check className="size-4" />
                                    Completed
                                </ToggleGroupItem>

                                <ToggleGroupItem
                                    value="incomplete"
                                    className="h-10 rounded-md border text-sm data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
                                >
                                    <X className="size-4" />
                                    Incomplete
                                </ToggleGroupItem>
                            </ToggleGroup>

                            <FieldError>{form.errors.status}</FieldError>
                        </Field>

                        <Field>
                            <Label htmlFor="remarks">Remarks</Label>

                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(e) =>
                                    form.setData('remarks', e.target.value)
                                }
                                placeholder="Add a remark (optional)"
                                rows={3}
                            />

                            <FieldError>{form.errors.remarks}</FieldError>
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
