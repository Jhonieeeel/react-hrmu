import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

const MONTHS = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
        label: String(year),
        value: String(year),
    };
});

export default function FilterButton({ handleFilter, date }) {
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 dark:text-foreground">
                        <Filter className="h-4 w-4 text-accent dark:text-foreground" />
                        Filter by
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-80 border-border p-0"
                    align="end"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />

                            <span className="text-sm font-medium">Filter</span>
                        </div>

                        <button
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => {
                                handleFilter(
                                    'month',
                                    String(new Date().getMonth() + 1),
                                );

                                handleFilter(
                                    'year',
                                    String(new Date().getFullYear()),
                                );
                            }}
                        >
                            Clear all
                        </button>
                    </div>

                    {/* Selects */}
                    <div className="flex items-center justify-around p-4">
                        {/* Month */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Month
                            </label>

                            <Select
                                value={date.month ?? ''}
                                onValueChange={(value) =>
                                    handleFilter('month', value)
                                }
                            >
                                <SelectTrigger className="h-9 w-36">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>

                                <SelectContent>
                                    {MONTHS.map((month) => (
                                        <SelectItem
                                            key={month.value}
                                            value={month.value}
                                            className="dark:text-foreground"
                                        >
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Year
                            </label>

                            <Select
                                value={date.year ?? ''}
                                onValueChange={(value) =>
                                    handleFilter('year', value)
                                }
                            >
                                <SelectTrigger className="h-9 w-28">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>

                                <SelectContent>
                                    {YEARS.map((year) => (
                                        <SelectItem
                                            key={year.value}
                                            value={year.value}
                                            className="dark:text-foreground"
                                        >
                                            {year.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 border-t border-border bg-muted/40 px-4 py-3">
                        <Button
                            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 dark:text-foreground"
                            // onClick={() => {
                            //     handleFilterChange('month', null);
                            //     handleFilterChange('year', null);
                            // }}
                        >
                            Reset
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
