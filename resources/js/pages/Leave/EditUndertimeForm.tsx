import { HOURS_TABLE, MINUTES_TABLE } from '@/components/Calendar/config/time';
import DatePicker from '@/components/Leave/DatePicker';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import undertime from '@/routes/undertime';
import { Leave } from '@/types';
import { useForm } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInMinutes, format } from 'date-fns';
import { Clock3, Timer } from 'lucide-react';
import React, { useState } from 'react';

type EditFormProp = {
    leave: Leave;
};

export default function EditUndertimeForm({ leave }: EditFormProp) {
    const form = useForm({
        user_id: leave.user_id,
        leave_type: leave.leave_type,
        event_type: leave.event_type,
        event_tag: leave.event_tag,
        balance: leave.balance,
        starts_at: toDateOnly(leave?.starts_at),
        ends_at: toDateOnly(leave?.ends_at),
        status: leave.status,
        remarks: leave.remarks ?? '',
    });

    const [time, setTime] = useState(
        leave.ends_at.split('T')[1].replace('Z', '').substring(0, 8),
    );

    const queryClient = useQueryClient();

    function toDateOnly(value: string) {
        if (!value) return '';
        // handles both 'yyyy-MM-dd' and full ISO strings
        return value.includes('T') ? value.split('T')[0] : value;
    }

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        const startDate = toDateOnly(form.data.starts_at);
        const endDate = toDateOnly(form.data.ends_at);

        const formattedStart = startDate ? `${startDate} 08:00:00` : '';
        const formattedEnd = endDate ? `${endDate} ${time}` : '';

        const totalMinutes = differenceInMinutes(
            new Date(formattedEnd),
            new Date(formattedStart),
        );

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const convertedHours = HOURS_TABLE[hours] ?? 0;
        const convertedMinutes = MINUTES_TABLE[minutes] ?? 0;

        const totalUndertime = Number(
            (convertedHours + convertedMinutes).toFixed(3),
        );

        form.setData({
            ...form.data,
            balance: -totalUndertime,
            starts_at: formattedStart,
            ends_at: formattedEnd,
        });

        form.submit(undertime.update(leave), {
            onSuccess: () => {
                form.reset();
                queryClient.invalidateQueries({
                    queryKey: ['leaves'],
                });
                setTime('08:00:00');
            },
        });
    }

    return (
        <div className="space-y-6 p-14">
            <div>
                <h1 className="text-4xl font-semibold dark:text-accent">
                    Edit Undertime
                </h1>
            </div>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xl border p-14 shadow-md"
            >
                <FieldSet>
                    {/* User */}
                    <FieldGroup>
                        <Field>
                            <FieldLabel>User</FieldLabel>
                            <Input
                                value={leave?.user?.name}
                                disabled
                                className="font-semibold"
                            />
                        </Field>
                    </FieldGroup>
                    {/* Report Type */}
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Report Type</FieldLabel>
                            <ToggleGroup
                                type="single"
                                value={form.data.event_tag}
                                disabled={!form.data.user_id}
                                onValueChange={(value) =>
                                    value && form.setData('event_tag', value)
                                }
                                className="grid grid-cols-2 gap-3"
                            >
                                {/* Tardiness */}
                                <ToggleGroupItem
                                    value="tardiness"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 text-red-600 transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-red-500 data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-red-400 dark:data-[state=on]:text-white"
                                >
                                    <Clock3 className="size-4" />
                                    <span className="font-medium">
                                        Tardiness
                                    </span>
                                </ToggleGroupItem>

                                {/* Undertime */}
                                <ToggleGroupItem
                                    value="undertime"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/30 text-amber-600 transition-all duration-300 hover:border-amber-500/60 hover:bg-amber-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-amber-500 data-[state=on]:bg-amber-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-amber-400 dark:data-[state=on]:text-white"
                                >
                                    <Timer className="size-4" />
                                    <span className="font-medium">
                                        Undertime
                                    </span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Field>
                    </FieldGroup>

                    <FieldGroup>
                        <Field>
                            <FieldLabel>Date & Time</FieldLabel>
                            <div className="grid grid-cols-3 gap-3">
                                <span className="col-span-2">
                                    <DatePicker
                                        value={form.data.starts_at}
                                        onChange={(date) => {
                                            form.setData('starts_at', date);
                                            form.setData('ends_at', date);
                                        }}
                                        placeholder={format(
                                            new Date(leave.starts_at),
                                            'MMMM do, yyyy',
                                        )}
                                    />
                                </span>
                                <Input
                                    type="time"
                                    disabled={!form.data.ends_at}
                                    value={time}
                                    step="1"
                                    onChange={(e) => setTime(e.target.value)}
                                    className="col-span-1 border-input bg-background focus:border-ring focus:ring-ring"
                                />
                            </div>
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 px-3 transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => form.reset()}
                                >
                                    Clear
                                </Button>

                                <Button
                                    type="submit"
                                    className="h-9 rounded-md bg-foreground px-3 text-background transition-colors hover:bg-foreground/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/80"
                                >
                                    {form.processing && <Spinner />}
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
EditUndertimeForm.layout = {
    breadcrumbs: [
        {
            title: 'Edit Undertime Form',
        },
    ],
};
