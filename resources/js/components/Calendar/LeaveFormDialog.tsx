import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { isBefore, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';
import leaves from '@/routes/leaves';
import type { User } from '@/types';
import { event_types } from '../Leave/constants/constants';
import DatePicker from '../Leave/DatePicker';
import SelectCombobox from '../Leave/SelectCombobox';

type DialogFormProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    date: string;
    users: User[];
};

export default function LeaveFormDialog({
    open,
    onOpenChange,
    date,
    users,
}: DialogFormProps) {
    const { canFileForOthers, currentEmployeeId, currentUserName } =
        usePermissions();

    const form = useForm({
        // Self-service callers are locked to their own personnel record. HR gets
        // the picker and starts at 0 (nothing chosen yet).
        employee_id: canFileForOthers ? 0 : (currentEmployeeId ?? 0),
        leave_type: '',
        event_type: 'deduction',
        event_tag: 'leave',
        starts_at: date,
        ends_at: date,
        balance: 0,
    });

    const queryClient = useQueryClient();

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        if (!form.data.employee_id) {
            form.setError('employee_id', 'Select an employee');

            return;
        }

        const startDate = parseISO(form.data.starts_at);
        const endDate = parseISO(form.data.ends_at);

        if (isBefore(endDate, startDate)) {
            form.setError('ends_at', 'End date cannot be before start date');

            return;
        }

        form.transform((data) => ({
            ...data,
            event_tag: ['cto', 'offset'].includes(form.data.leave_type)
                ? 'cto'
                : 'leave',
        }));

        form.submit(leaves.store(), {
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
                queryClient.invalidateQueries({
                    queryKey: ['calendarEvents'],
                });
            },
        });
    }

    return (
        <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader className="mb-2">
                        <DialogTitle>File Leave</DialogTitle>
                        <DialogDescription>
                            {canFileForOthers
                                ? 'Record a leave for any employee. Click submit when you are done.'
                                : 'Submit your own leave request. It will go to HR for approval.'}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="employee_id">
                                Employee Name
                            </FieldLabel>
                            {canFileForOthers ? (
                                <SelectCombobox
                                    items={users.map((u) => ({
                                        value: u.id,
                                        label: u.name,
                                    }))}
                                    value={form.data.employee_id}
                                    onValueChange={(value: string) =>
                                        form.setData(
                                            'employee_id',
                                            Number(value),
                                        )
                                    }
                                    placeholder="Select an employee"
                                />
                            ) : (
                                // Non-HR callers never choose an employee: the
                                // server resolves the submitter to their own
                                // record regardless (LeaveController::resolveEmployee).
                                <Input
                                    id="employee_id"
                                    value={currentUserName ?? 'Yourself'}
                                    disabled
                                    className="font-semibold"
                                />
                            )}
                            <small className="text-xxs text-red-600 dark:text-red-300">
                                {form.errors.employee_id}
                            </small>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="leave_type">
                                Leave type
                            </FieldLabel>
                            <SelectCombobox
                                items={event_types.map((u) => ({
                                    value: u.leave_type.toLowerCase(),
                                    label: u.leave_type,
                                }))}
                                value={form.data.leave_type}
                                onValueChange={(value: string) => {
                                    form.setData('leave_type', value);

                                    if (
                                        String(value).toLowerCase() ===
                                        'force leave'
                                    ) {
                                        form.setData(
                                            'event_tag',
                                            'vacation leave',
                                        );
                                    }
                                }}
                                placeholder="Select leave type"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Start Date</FieldLabel>
                            <DatePicker
                                value={form.data.starts_at}
                                disabled={!form.data.leave_type}
                                placeholder="Select start date"
                                onChange={(date) => {
                                    form.setData('starts_at', date);
                                    form.setData('ends_at', date);
                                }}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>End Date</FieldLabel>
                            <DatePicker
                                value={form.data.ends_at}
                                disabled={!form.data.leave_type}
                                placeholder="Select end date"
                                onChange={(date) => {
                                    form.setData('ends_at', date);
                                }}
                            />
                            <small className="text-xxs text-red-600 dark:text-red-300">
                                {form.errors.ends_at}
                            </small>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="submit">
                            {form.processing ? <Spinner /> : ''}
                            {form.processing ? 'Saving' : 'Submit'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
