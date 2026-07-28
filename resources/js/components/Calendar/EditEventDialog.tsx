import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import calendar from '@/routes/calendar';
import { CalendarEvent } from '@/types';
import { useForm } from '@inertiajs/react';
import { differenceInDays } from 'date-fns';
import { useState } from 'react';
import DatePicker from '../Leave/DatePicker';
import { calendarConfig } from './config/colors';
import { event_types } from '../Leave/constants/constants';

type Props = {
    calendarEvent: CalendarEvent;
    setMode: (mode: string) => void;
};

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return {
        date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }),
        time: date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}

export default function EditEventDialog({ calendarEvent, setMode }: Props) {
    const form = useForm({
        user_id: calendarEvent.user_id,
        id: calendarEvent.id,
        leave_type: '',
        event_type: 'deduction',
        event_tag: 'leave',
        starts_at: '',
        ends_at: '',
        balance: 0,
        status: Boolean(calendarEvent.status),
    });

    const start = formatDate(calendarEvent.start);
    const end = formatDate(calendarEvent.end);

    function handleUpdate(e: React.SubmitEvent) {
        const days =
            differenceInDays(form.data.ends_at, form.data.starts_at) + 1;

        form.setData({
            ...form.data,
            balance: -days,
        });

        e.preventDefault();
        form.submit(calendar.update(Number(form.data.id)), {
            onSuccess: () => {},
            preserveState: true,
        });
    }

    return (
        <form onSubmit={handleUpdate}>
            {/* Leave type select */}
            <div className="border-b px-5 py-3.5">
                <Label className="mb-1.5 block text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    Leave type
                </Label>
                <p className="mb-1.5 text-xs text-muted-foreground">
                    Currently:{' '}
                    <span className="font-medium text-foreground capitalize">
                        {calendarEvent.calendarTitle}
                    </span>
                </p>
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
                {form.errors.leave_type && (
                    <p className="mt-1 text-xs text-destructive">
                        {form.errors.leave_type}
                    </p>
                )}
            </div>

            <FieldGroup className="grid grid-cols-2 gap-4 px-5 py-4">
                {/* starts_at */}
                <Field>
                    <FieldLabel htmlFor="starts-at-trigger">
                        Start Date
                    </FieldLabel>
                    <DatePicker
                        value={form.data.starts_at}
                        disabled={!form.data.leave_type}
                        placeholder="Select date"
                        onChange={(date) => {
                            form.setData('starts_at', date);
                            form.setData('ends_at', date);
                        }}
                    />
                    <FieldDescription className="text-muted-foreground">
                        Starting date of leave.
                    </FieldDescription>
                </Field>

                {/* ends_at */}
                <Field>
                    <FieldLabel htmlFor="ends-at-trigger">End Date</FieldLabel>
                    <DatePicker
                        value={form.data.ends_at}
                        disabled={!form.data.leave_type}
                        placeholder="Select date"
                        onChange={(date) => {
                            form.setData('ends_at', date);
                        }}
                    />

                    <FieldDescription className="text-muted-foreground">
                        Ending date of leave.
                    </FieldDescription>
                </Field>
            </FieldGroup>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-5 py-3.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        form.reset();
                        setMode('view');
                    }}
                >
                    Back
                </Button>
                <Button type="submit" size="sm" disabled={form.processing}>
                    {form.processing ? 'Saving...' : 'Save changes'}
                </Button>
            </div>
        </form>
    );
}
