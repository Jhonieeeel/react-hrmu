import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerProps = {
    value?: string;
    onChange: (date: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export default function DatePicker({
    value,
    onChange,
    placeholder = 'Select date',
    disabled = false,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    const parsedDate =
        value && isValid(parse(value, 'yyyy-MM-dd', new Date()))
            ? parse(value, 'yyyy-MM-dd', new Date())
            : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className="group w-full justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
                >
                    <CalendarIcon className="text-brand-accent mr-2 h-4 w-4 shrink-0 group-hover:text-accent-foreground" />

                    <span
                        className={cn(
                            'truncate',
                            !parsedDate &&
                                'text-muted-foreground group-hover:text-accent-foreground',
                        )}
                    >
                        {parsedDate ? format(parsedDate, 'PPP') : placeholder}
                    </span>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-auto overflow-hidden border-border bg-popover p-0"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={parsedDate}
                    defaultMonth={parsedDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                        onChange(date ? format(date, 'yyyy-MM-dd') : '');

                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
