import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { Button } from '../ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '../ui/field';
import { Input } from '../ui/input';
import DatePicker from './DatePicker';
import SelectCombobox from './SelectCombobox';
import { event_types } from './constants/constants';
import { useQueryClient } from '@tanstack/react-query';
import leaves from '@/routes/leaves';
import { Spinner } from '../ui/spinner';
import { isBefore, parseISO } from 'date-fns';

type FormProp = {
    user: User;
};

export default function LeaveForm({ user }: FormProp) {
    const form = useForm({
        user_id: user?.id,
        event_type: 'deduction',
        event_tag: 'leave',
        balance: 0,
        leave_type: '',
        starts_at: '',
        ends_at: '',
    });

    function handleClear() {
        form.setData({
            ...form.data,
            leave_type: '',
            starts_at: '',
            ends_at: '',
        });
    }

    const queryClient = useQueryClient();

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

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
                queryClient.invalidateQueries({
                    queryKey: ['leaves'],
                });
                form.reset();
            },
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet>
                {/* User */}
                <FieldGroup>
                    <Field>
                        <FieldLabel>User</FieldLabel>
                        <Input
                            value={user.name}
                            disabled
                            className="font-semibold"
                        />
                    </Field>
                </FieldGroup>
                {/* Leave Type */}
                <FieldGroup>
                    <Field>
                        <FieldLabel>Leave Type</FieldLabel>
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
                                    form.setData('event_tag', 'vacation leave');
                            }}
                            placeholder="Select leave type"
                        />
                        <FieldError>{form.errors.leave_type}</FieldError>
                    </Field>
                </FieldGroup>
                {/* Date */}
                <FieldGroup>
                    <div className="flex items-center gap-4">
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
                    </div>
                </FieldGroup>

                <FieldGroup>
                    <Field>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClear}
                                className="h-9 px-3 transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                                Clear
                            </Button>

                            <Button
                                type="submit"
                                className="h-9 rounded-md bg-foreground px-3 text-background transition-colors hover:bg-foreground/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/80"
                            >
                                {form.processing ? <Spinner /> : ''}
                                {form.processing ? 'Submitting' : 'Submit'}
                            </Button>
                        </div>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </form>
    );
}
