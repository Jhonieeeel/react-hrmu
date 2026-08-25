import SuccessAlertMessage from '@/components/SuccessAlertMessage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import { FlashMessageProp } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRightLeft,
    InfoIcon,
    Mail,
    Save,
    User2,
    UserPlus,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    employee_type: 'new employee' | 'old' | 'transferee';
}

interface Props {
    user: User;
    flash: {
        success: FlashMessageProp | null;
    };
}

export default function UserInfo({ user, flash }: Props) {
    const form = useForm({
        id: user.id,
        name: user.name,
        email: user.email,
        employee_type: user.employee_type,
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        form.submit(users.update(user.id), {
            method: 'post',
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
        });
    }

    useEffect(() => {
        if (flash?.success)
            toast.success(flash?.success?.message, { position: 'top-center' });
    }, [flash?.success?.id]);

    return (
        <>
            <Head title={`${user.name} - User Info`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <UserRound className="size-7" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {user.name}
                                </h1>

                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 capitalize dark:text-emerald-400">
                                    {user.employee_type}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Employee ID #{user.id}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="border-b px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <UserRound className="size-4" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Basic Information
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Update the employee's basic account
                                        information.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>

                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="Enter full name"
                                />

                                {form.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>

                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
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

                            {/* Employee Type */}
                            <div className="space-y-3">
                                <Label>Employee Type</Label>

                                <ToggleGroup
                                    type="single"
                                    value={form.data.employee_type}
                                    onValueChange={(value) => {
                                        if (!value) return;

                                        form.setData('employee_type', value);
                                    }}
                                    className="grid w-full grid-cols-3 gap-3"
                                >
                                    <ToggleGroupItem
                                        value="new employee"
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 text-emerald-600 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-emerald-400 dark:data-[state=on]:text-white"
                                    >
                                        <UserPlus className="size-4" />
                                        <span className="font-medium">
                                            New Employee
                                        </span>
                                    </ToggleGroupItem>

                                    <ToggleGroupItem
                                        value="transferee"
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive/60 hover:bg-destructive/10 data-[state=on]:scale-[1.02] data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:shadow-lg"
                                    >
                                        <ArrowRightLeft className="size-4" />
                                        <span className="font-medium">
                                            Transferee
                                        </span>
                                    </ToggleGroupItem>

                                    <ToggleGroupItem
                                        value="old"
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/30 text-blue-600 transition-all duration-300 hover:border-blue-500/60 hover:bg-blue-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-blue-500 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-blue-400 dark:data-[state=on]:text-white"
                                    >
                                        <User2 className="size-4" />
                                        <span className="font-medium">
                                            Old Employee
                                        </span>
                                    </ToggleGroupItem>
                                </ToggleGroup>

                                {form.errors.employee_type && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.employee_type}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Leave Information */}
                    {/* <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="border-b px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <UsersRound className="size-4" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Leave Information
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        Employee leave balances and filing
                                        information.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-6 md:grid-cols-2">
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">
                                    Vacation Leave
                                </p>

                                <p className="mt-1 text-2xl font-semibold">0</p>
                            </div>

                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">
                                    Sick Leave
                                </p>

                                <p className="mt-1 text-2xl font-semibold">0</p>
                            </div>
                        </div>
                    </div> */}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="size-4" />
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Save className="size-4" />
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

UserInfo.layout = {
    breadcrumbs: [
        {
            title: 'User Info',
            href: dashboard(),
        },
    ],
};
