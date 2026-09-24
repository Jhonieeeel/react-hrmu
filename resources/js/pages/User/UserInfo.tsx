import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRightLeft,
    Building2,
    Mail,
    Save,
    User2,
    UserPlus,
    UserRound,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { dashboard } from '@/routes';
import leaves from '@/routes/leaves';
import users from '@/routes/users';
import type { FlashMessageProp } from '@/types';

type Employee = {
    id: number | null;
    user_id: number;
    position: string;
    division_id: number | null;
    section_id: number | null;
    unit_id: number | null;
};

type User = {
    id: number;
    name: string;
    email: string;
    employee_type: 'new employee' | 'old' | 'transferee';
};

type Section = {
    id: number;
    section_name: string;
    section_code: string;
};

type Unit = {
    id: number;
    section_id: number;
    unit_name: string;
    unit_code: string;
};

type Props = {
    user: User;
    employee: Employee;
    divisions: Array<{
        id: number;
        division_name: string;
        division_code: string;
    }>;
    sections: Section[];
    units: Unit[];
    flash: {
        success: FlashMessageProp | null;
    };
};

export default function UserInfo({
    user,
    employee,
    divisions,
    sections,
    units,
    flash,
}: Props) {
    const form = useForm({
        name: user.name,
        email: user.email,
        employee_type: user.employee_type,
        position: employee.position,
        division_id: employee.division_id ? String(employee.division_id) : '',
        section_id: employee.section_id ? String(employee.section_id) : '',
        unit_id: employee.unit_id ? String(employee.unit_id) : '',
    });

    function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();

        form.submit(users.update(user.id), {
            method: 'post',
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success.message, { position: 'top-center' });
        }
    }, [flash?.success?.id, flash?.success?.message]);

    const availableUnits = units.filter(
        (unit) =>
            !form.data.section_id ||
            unit.section_id === Number(form.data.section_id),
    );

    return (
        <>
            <Head title={`${user.name} - Employee Details`} />

            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <UserRound className="size-7" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {user.name}
                                </h1>
                                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 capitalize dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                                    {user.employee_type}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Employee record #{employee.id ?? 'New'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={dashboard()}>
                                <ArrowLeft />
                                Back to dashboard
                            </Link>
                        </Button>
                        {employee.id && (
                            <Button asChild>
                                <Link href={leaves.show(employee.id)}>
                                    View leave balance
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-6 lg:grid-cols-2"
                >
                    <Card className="w-full gap-0 overflow-hidden border-t-4 border-t-sky-500 py-0 shadow-sm">
                        <CardHeader className="border-b bg-sky-500/5 px-6 py-5">
                            <div className="flex items-center justify-start gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    <UserRound className="size-4" />
                                </div>
                                <div>
                                    <CardTitle>Account information</CardTitle>
                                    <CardDescription>
                                        Personal details and account status.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-5 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Enter full name"
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="employee@example.com"
                                    />
                                </div>
                                {form.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Employment status</Label>
                                <ToggleGroup
                                    type="single"
                                    value={form.data.employee_type}
                                    onValueChange={(value) => {
                                        if (value) {
                                            form.setData(
                                                'employee_type',
                                                value as User['employee_type'],
                                            );
                                        }
                                    }}
                                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                                >
                                    <ToggleGroupItem
                                        value="new employee"
                                        className="justify-start gap-2 border-emerald-200 text-emerald-700 data-[state=on]:border-emerald-600 data-[state=on]:bg-emerald-600 data-[state=on]:text-white dark:text-emerald-400"
                                    >
                                        <UserPlus className="size-4" /> New
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="transferee"
                                        className="justify-start gap-2 border-amber-200 text-amber-700 data-[state=on]:border-amber-600 data-[state=on]:bg-amber-600 data-[state=on]:text-white dark:text-amber-400"
                                    >
                                        <ArrowRightLeft className="size-4" />{' '}
                                        Transferee
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="old"
                                        className="justify-start gap-2 border-sky-200 text-sky-700 data-[state=on]:border-sky-600 data-[state=on]:bg-sky-600 data-[state=on]:text-white dark:text-sky-400"
                                    >
                                        <User2 className="size-4" /> Old
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                {form.errors.employee_type && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.employee_type}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-full gap-0 overflow-hidden border-t-4 border-t-violet-500 py-0 shadow-sm">
                        <CardHeader className="border-b bg-violet-500/5 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                    <Building2 className="size-4" />
                                </div>
                                <div>
                                    <CardTitle>Work assignment</CardTitle>
                                    <CardDescription>
                                        Position, section, and organizational
                                        unit.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-5 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="division_id">Division</Label>
                                <select
                                    id="division_id"
                                    value={form.data.division_id}
                                    onChange={(event) => {
                                        form.setData(
                                            'division_id',
                                            event.target.value,
                                        );
                                        form.setData('section_id', '');
                                        form.setData('unit_id', '');
                                    }}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                                >
                                    <option value="">No division</option>
                                    {divisions.map((division) => (
                                        <option
                                            key={division.id}
                                            value={division.id}
                                        >
                                            {division.division_code} —{' '}
                                            {division.division_name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.division_id && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.division_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    value={form.data.position}
                                    onChange={(event) =>
                                        form.setData(
                                            'position',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="e.g. Programmer"
                                />
                                {form.errors.position && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.position}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="section_id">Section</Label>
                                <select
                                    id="section_id"
                                    value={form.data.section_id}
                                    onChange={(event) => {
                                        form.setData(
                                            'section_id',
                                            event.target.value,
                                        );
                                        form.setData('unit_id', '');
                                    }}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                                >
                                    <option value="">Select a section</option>
                                    {sections.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.section_code} —{' '}
                                            {section.section_name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.section_id && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.section_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_id">Unit</Label>
                                <select
                                    id="unit_id"
                                    value={form.data.unit_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'unit_id',
                                            event.target.value,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                                >
                                    <option value="">Select a unit</option>
                                    {availableUnits.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.unit_code} — {unit.unit_name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.unit_id && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.unit_id}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg border border-violet-100 bg-violet-50/60 p-3 text-sm text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200">
                                Section and unit use abbreviations for filtering
                                and reporting.
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft /> Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save />{' '}
                            {form.processing
                                ? 'Saving changes...'
                                : 'Save employee details'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
