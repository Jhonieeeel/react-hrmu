import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';
import { CalendarOffIcon, PlaneIcon, Users2 } from 'lucide-react';
import DashboardCard from '@/components/Dashboard/DashboardCard';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl md:p-14">
                <h2 className="text-md font-semibold">Dashboard</h2>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <DashboardCard
                        cardColor="bg-sky-50 text-sky-600"
                        label="employees"
                        value={0}
                        icon={Users2}
                    />
                    <DashboardCard
                        cardColor="bg-emerald-50 text-emerald-600"
                        label="Leaves"
                        value={0}
                        icon={PlaneIcon}
                    />
                    <DashboardCard
                        cardColor="bg-amber-50 text-amber-600"
                        label="Holidays"
                        value={0}
                        icon={CalendarOffIcon}
                    />
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex w-full items-center">
                        {/* employee for this year */}
                        <div className="w-full">
                            <p className="text-md">Recently Added Employees</p>
                            {/* data */}
                        </div>

                        {/* filed leaves for this month */}
                        <div className="w-full">
                            <p className="text-md">Recent Filed Leaves</p>
                            {/* data */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
