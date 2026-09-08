import { LucideIcon } from 'lucide-react';

type DashboardCardProp = {
    cardColor: string;
    value: number;
    label: string;
    icon: LucideIcon;
};

export default function DashboardCard({
    cardColor,
    value,
    label,
    icon: Icon,
}: DashboardCardProp) {
    return (
        <div className="flex h-[70px] items-center rounded-lg border border-gray-200 bg-white px-3.5 shadow-sm">
            <div
                className={`mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${cardColor}`}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[12px] font-bold tracking-[0.5px] text-gray-500 uppercase">
                    {label}
                </p>
                <p className="text-[18px] leading-[17px] font-bold text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
}
