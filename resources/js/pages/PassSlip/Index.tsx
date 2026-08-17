import SelectCombobox from '@/components/Leave/SelectCombobox';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import slip from '@/routes/slip';
import { User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { BriefcaseBusiness, House } from 'lucide-react';
import { useState } from 'react';

type PageProp = {
    users: User[];
};

export default function PassSlips({ users }: PageProp) {
    const [departureTime, setDepartureTime] = useState('08:00:00');
    const [arrivalTime, setArrivalTime] = useState('08:30:00');

    const form = useForm({
        user_id: 0,
        position: '',
        usd: '',
        destination: '',
        purpose: '',
        request_type: '',
        departure: format(new Date(), 'yyyy-MM-dd'),
        arrival: format(new Date(), 'yyyy-MM-dd'),
        assigned_to: '',
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        console.log(form.data);
    }

    return (
        <>
            <Head title="PassSlips" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <form onSubmit={handleSubmit}>
                    <FieldSet className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
                        {/* ====================================================== */}
                        {/* Personnel Information */}
                        {/* ====================================================== */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-base font-semibold">
                                    Personnel Information
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Provide the personnel and destination
                                    details.
                                </p>
                            </div>

                            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Name */}
                                <Field>
                                    <FieldLabel>Name of Personnel</FieldLabel>

                                    <SelectCombobox
                                        items={users.map((u) => ({
                                            value: u.id,
                                            label: u.name,
                                        }))}
                                        value={form.data.user_id}
                                        onValueChange={(value: User['id']) =>
                                            form.setData(
                                                'user_id',
                                                Number(value),
                                            )
                                        }
                                        placeholder="Select a personnel"
                                    />
                                </Field>

                                {/* Position */}
                                <Field>
                                    <FieldLabel>Position</FieldLabel>

                                    <Input
                                        placeholder="Enter position"
                                        className="placeholder:text-muted-foreground/50"
                                        value={form.data.position}
                                        onChange={(e) =>
                                            form.setData(
                                                'position',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                {/* Unit/Section/Division */}
                                <Field>
                                    <FieldLabel>
                                        Unit/Section/Division
                                    </FieldLabel>

                                    <Input
                                        placeholder="AFMS, CBTS, OS"
                                        className="placeholder:text-muted-foreground/50"
                                        value={form.data.usd}
                                        onChange={(e) =>
                                            form.setData('usd', e.target.value)
                                        }
                                    />
                                </Field>

                                {/* Destination */}
                                <Field>
                                    <FieldLabel>Destination</FieldLabel>

                                    <Input
                                        placeholder="Pavilion / Office / Etc."
                                        className="placeholder:text-muted-foreground/50"
                                        value={form.data.destination}
                                        onChange={(e) =>
                                            form.setData(
                                                'destination',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                {/* Purpose */}
                                <Field className="md:col-span-2">
                                    <FieldLabel>Purpose</FieldLabel>

                                    <Textarea
                                        placeholder="Briefly describe the purpose of this request..."
                                        className="min-h-28 resize-none placeholder:text-muted-foreground/50"
                                        value={form.data.purpose}
                                        onChange={(e) =>
                                            form.setData(
                                                'purpose',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </FieldGroup>
                        </div>

                        {/* ====================================================== */}
                        {/* Request Details */}
                        {/* ====================================================== */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                            <div className="mb-6">
                                <h2 className="text-base font-semibold">
                                    Request Details
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Specify the request type and expected travel
                                    times.
                                </p>
                            </div>

                            <FieldGroup className="space-y-5">
                                {/* Request Type */}
                                <Field>
                                    <FieldLabel>Request Type</FieldLabel>

                                    <ToggleGroup
                                        type="single"
                                        value={form.data.request_type}
                                        onValueChange={(value) => {
                                            if (!value) return;

                                            form.setData('request_type', value);
                                        }}
                                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                                    >
                                        {/* Official */}
                                        <ToggleGroupItem
                                            value="official"
                                            className="h-11 justify-center gap-2 rounded-xl border border-emerald-500/30 text-emerald-600 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/10 data-[state=on]:scale-[1.01] data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-md dark:text-emerald-400 dark:data-[state=on]:text-white"
                                        >
                                            <BriefcaseBusiness className="size-4" />

                                            <span className="font-medium">
                                                Official
                                            </span>
                                        </ToggleGroupItem>

                                        {/* Personal */}
                                        <ToggleGroupItem
                                            value="personal"
                                            className="h-11 justify-center gap-2 rounded-xl border border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive/60 hover:bg-destructive/10 data-[state=on]:scale-[1.01] data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:shadow-md"
                                        >
                                            <House className="size-4" />

                                            <span className="font-medium">
                                                Personal
                                            </span>
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </Field>

                                {/* Departure / Arrival */}
                                <FieldGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    {/* Expected Time of Departure */}
                                    <Field>
                                        <FieldLabel>
                                            Expected Time of Departure
                                        </FieldLabel>

                                        <Input
                                            type="time"
                                            id="departure-time"
                                            step="1"
                                            value={form.data.departure}
                                            onChange={(e) =>
                                                form.setData(
                                                    'departure',
                                                    e.target.value,
                                                )
                                            }
                                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        />
                                    </Field>

                                    {/* Expected Time of Arrival */}
                                    <Field>
                                        <FieldLabel>
                                            Expected Time of Arrival
                                        </FieldLabel>

                                        <Input
                                            type="time"
                                            id="arrival-time"
                                            step="1"
                                            value={form.data.arrival}
                                            onChange={(e) =>
                                                form.setData(
                                                    'arrival',
                                                    e.target.value,
                                                )
                                            }
                                            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        />
                                    </Field>
                                </FieldGroup>
                            </FieldGroup>
                        </div>

                        {/* ====================================================== */}
                        {/* Form Actions */}
                        {/* ====================================================== */}
                        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-10 w-full rounded-lg px-5 sm:w-auto"
                            >
                                {form.processing
                                    ? 'Submitting...'
                                    : 'Submit Request'}
                            </Button>
                        </div>
                    </FieldSet>
                </form>
            </div>
        </>
    );
}

PassSlips.layout = {
    breadcrumbs: [
        {
            title: 'PassSlips',
            href: slip.index(),
        },
    ],
};
