import React from 'react';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '../ui/field';
import SelectCombobox from '../Leave/SelectCombobox';
import { event_types } from '../Leave/constants/constants';
import { useForm } from '@inertiajs/react';
import { Input } from '../ui/input';
import DatePicker from '../Leave/DatePicker';
import { Button } from '../ui/button';
import { User } from '@/types';
import users_filing from '@/routes/users_filing';

type PageProp = {
    users_data: User[];
};

export default function UserMonthlyFilingForm({ users_data }: PageProp) {
    const form = useForm({
        user_id: 0,
        leave_type: 'monthly filing',
        event_type: 'filing',
        event_tag: 'filing',
        balance: 0,
        starts_at: '', // 2023-01-01
        ends_at: '', // 2023-01-31
        status: false,
        remarks: '',
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        form.submit(users_filing.store(), {
            onSuccess: () => {
                handleClear();
            },
        });
    }

    function handleClear() {
        form.reset();
        form.clearErrors();
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet className="w-full max-w-xl border shadow md:p-14">
                <FieldGroup>
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <SelectCombobox
                            items={users_data?.map((u) => ({
                                value: u.id,
                                label: u.name,
                            }))}
                            value={form.data.user_id}
                            onValueChange={(value: User['id']) =>
                                form.setData('user_id', Number(value))
                            }
                            placeholder="Select an employee"
                        />
                        <FieldError>{form.errors.user_id}</FieldError>
                    </Field>

                    <div className="flex items-center gap-4">
                        <Field>
                            <FieldLabel>Starting Date</FieldLabel>
                            <DatePicker
                                value={form.data.starts_at}
                                onChange={(date) => {
                                    form.setData('starts_at', date);
                                    form.setData('ends_at', date);
                                }}
                                placeholder="Select date"
                            />
                            <FieldError>{form.errors.starts_at}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel>Ending Date</FieldLabel>
                            <DatePicker
                                value={form.data.ends_at}
                                onChange={(date) =>
                                    form.setData('ends_at', date)
                                }
                                placeholder="Select date"
                            />
                            <FieldError>{form.errors.ends_at}</FieldError>
                        </Field>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>

                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                </FieldGroup>
            </FieldSet>
        </form>
    );
}
