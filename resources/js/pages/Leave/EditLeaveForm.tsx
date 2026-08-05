import { event_types } from '@/components/Leave/constants/constants';
import DatePicker from '@/components/Leave/DatePicker';
import SelectCombobox from '@/components/Leave/SelectCombobox';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import leaves from '@/routes/leaves';
import { Leave } from '@/types';
import { useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';

type PageProps = {
    leave: Leave;
};

export default function EditLeaveForm({ leave }: PageProps) {
    const form = useForm({
        user_id: leave?.user_id,
        id: leave?.id,
        leave_type: leave?.leave_type,
        event_type: leave?.event_type,
        event_tag: leave?.event_tag,
        balance: leave?.balance,
        starts_at: leave?.starts_at,
        ends_at: leave?.ends_at,
        status: leave?.status,
        remarks: leave?.remarks,
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        0;
    }

    return (
        <div className="space-y-6 p-14">
            <div>
                <h1 className="text-4xl font-semibold dark:text-accent">
                    Edit Leave Form
                </h1>
            </div>
            <form
                className="w-full max-w-xl border p-14 shadow-md"
                onSubmit={handleSubmit}
            >
                <FieldSet>
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
                                        form.setData(
                                            'event_tag',
                                            'vacation leave',
                                        );
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
                                    value={format(form.data.starts_at, 'PPP')}
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
                                    // onClick={handleClear}
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
        </div>
    );
}

EditLeaveForm.layout = {
    breadcrumbs: [
        {
            title: 'Edit Leave Form',
        },
    ],
};
