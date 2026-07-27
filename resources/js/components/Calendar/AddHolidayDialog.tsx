import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import calendar from '@/routes/calendar';

const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export default function AddHolidayDialog() {
    const form = useForm({
        holiday_name: '',
        month: '',
        day: '',
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        form.submit(calendar.store(), {
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Add Holiday
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new Holiday</DialogTitle>
                    <DialogDescription>
                        Create a holiday by selecting its month and day.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Holiday Name</Label>
                            <Input
                                value={form.data.holiday_name}
                                onChange={(e) =>
                                    form.setData('holiday_name', e.target.value)
                                }
                                placeholder="e.g. Christmas Day"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Month</Label>
                                <Select
                                    value={form.data.month}
                                    onValueChange={(value) =>
                                        form.setData('month', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem
                                                key={month.value}
                                                value={month.value}
                                            >
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Day</Label>
                                <Select
                                    value={form.data.day}
                                    onValueChange={(value) =>
                                        form.setData('day', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <SelectItem
                                                key={i + 1}
                                                value={String(i + 1)}
                                            >
                                                {i + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? <Spinner /> : ''}
                            Save Holiday
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
