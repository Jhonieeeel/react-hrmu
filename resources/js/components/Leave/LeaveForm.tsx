import { useForm } from '@inertiajs/react';
import { Field, FieldGroup, FieldLabel, FieldSet } from '../ui/field';
import DatePicker from './DatePicker';
import { event_types } from './constants/constants';
import { User } from '@/types';
import SelectCombobox from './SelectCombobox';
import { Input } from '../ui/input';
import { Button } from '@base-ui/react';

type FormProp = {
    user: User;
};

export default function LeaveForm({ user }: FormProp) {
    const form = useForm({
        leave_type: '',
        starts_at: '',
        ends_at: '',
    });

    return (
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
                        onValueChange={(value: string) =>
                            form.setData('leave_type', value)
                        }
                        placeholder="Select leave type"
                    />
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
                    </Field>
                </div>
            </FieldGroup>

            <FieldGroup>
                <Field>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-3 transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            Clear
                        </Button>

                        <Button
                            type="submit"
                            className="h-9 rounded-md bg-foreground px-3 text-background transition-colors hover:bg-foreground/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/80"
                        >
                            Submit
                        </Button>
                    </div>
                </Field>
            </FieldGroup>
        </FieldSet>
    );
}
