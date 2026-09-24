import { CalendarDays, Gauge, WalletCards } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Spinner } from '../ui/spinner';

export type Balance = {
    leave_type: string;
    previous: number;
    current: number;
    estimated: number;
    monthly_accrual: number;
    used: number;
};

type BalanceProp = {
    balance: Balance;
    isFetching: boolean;
    className?: string;
};

type BalanceTheme = {
    icon: string;
    badge: string;
    progress: string;
    accent: string;
};

const balanceThemes: Record<string, BalanceTheme> = {
    'vacation leave': {
        icon: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
        badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
        progress: '[&>div]:bg-sky-500',
        accent: 'bg-sky-500',
    },
    'sick leave': {
        icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
        progress: '[&>div]:bg-emerald-500',
        accent: 'bg-emerald-500',
    },
    'force leave': {
        icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
        badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
        progress: '[&>div]:bg-amber-500',
        accent: 'bg-amber-500',
    },
    'wellness leave': {
        icon: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
        badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
        progress: '[&>div]:bg-violet-500',
        accent: 'bg-violet-500',
    },
    'special privilege leave': {
        icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
        badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
        progress: '[&>div]:bg-rose-500',
        accent: 'bg-rose-500',
    },
};

const defaultTheme: BalanceTheme = {
    icon: 'bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300',
    badge: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
    progress: '[&>div]:bg-slate-500',
    accent: 'bg-slate-500',
};

export default function BalanceCard({
    balance,
    isFetching,
    className = '',
}: BalanceProp) {
    const theme = balanceThemes[balance.leave_type] ?? defaultTheme;
    const total = balance.current + balance.used;
    const usagePercentage =
        total > 0 ? Math.min(100, (balance.used / total) * 100) : 0;
    const formattedType = balance.leave_type.replaceAll(' ', ' ');

    return (
        <Card className={`relative gap-0 overflow-hidden py-0 ${className}`}>
            <div className={`h-1 w-full ${theme.accent}`} />
            {isFetching ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/65 backdrop-blur-sm">
                    <Spinner className="h-7 w-7" />
                </div>
            ) : (
                <>
                    <CardHeader className="flex-row items-start justify-between space-y-0 p-5 pb-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}
                            >
                                <WalletCards className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="truncate text-sm capitalize">
                                    {formattedType}
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                    Available balance
                                </CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={`shrink-0 capitalize ${theme.badge}`}
                        >
                            Active
                        </Badge>
                    </CardHeader>

                    <CardContent className="space-y-5 p-5 pt-0">
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground">
                                {balance.current.toFixed(3)}
                            </span>
                            <span className="mb-1 text-xs text-muted-foreground">
                                days
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Gauge className="size-3.5" /> Usage
                                </span>
                                <span className="font-semibold text-foreground">
                                    {Math.round(usagePercentage)}%
                                </span>
                            </div>
                            <Progress
                                value={usagePercentage}
                                className={theme.progress}
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                    Used
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {balance.used.toFixed(3)} days
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="flex items-center gap-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                    <CalendarDays className="size-3" /> Est.
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {balance.estimated.toFixed(3)} days
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Monthly accrual</span>
                            <span className="font-medium text-foreground">
                                {balance.monthly_accrual.toFixed(3)} days
                            </span>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
