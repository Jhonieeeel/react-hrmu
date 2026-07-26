import { User } from '@/types';
import { Field, FieldGroup, FieldLabel, FieldSet } from '../ui/field';
import DatePicker from './DatePicker';
import { useForm } from '@inertiajs/react';
import { Input } from '../ui/input';
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Clock3, Timer } from 'lucide-react';
import { Button } from '../ui/button';

type UndertimeProp = {
    user: User;
};

export default function UndertimeForm({ user }: UndertimeProp) {
    const [time, setTime] = useState('08:00:00');

    const form = useForm({
        user_id: user.id,
        leave_type: 'vacation leave',
        event_type: 'deduction',
        event_tag: '',
        balance: 0,
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
                            <span className="font-medium">Tardiness</span>
                        </ToggleGroupItem>

                        {/* Undertime */}
                        <ToggleGroupItem
                            value="undertime"
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/30 text-amber-600 transition-all duration-300 hover:border-amber-500/60 hover:bg-amber-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-amber-500 data-[state=on]:bg-amber-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-amber-400 dark:data-[state=on]:text-white"
                        >
                            <Timer className="size-4" />
                            <span className="font-medium">Undertime</span>
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
                                placeholder="Undertime Date"
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
