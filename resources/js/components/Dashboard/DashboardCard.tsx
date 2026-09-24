import type { LucideIcon } from 'lucide-react';

type DashboardCardProp = {
    cardColor: string;
    value: number;
    label: string;
    description: string;
    icon: LucideIcon;
};

export default function DashboardCard({
    cardColor,
    value,
    label,
    description,
    icon: Icon,
}: DashboardCardProp) {
    return (
        <div className="group flex min-h-[112px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-sm transition-colors hover:border-primary/30">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cardColor}`}
            >
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
                    {value.toLocaleString()}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}
