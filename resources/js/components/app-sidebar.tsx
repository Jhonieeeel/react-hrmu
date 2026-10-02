import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CalendarClock,
    ClipboardCheck,
    FileTextIcon,
    FolderGit2,
    LayoutGrid,
    Plane,
    ShieldCheck,
    User2,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import balance from '@/routes/balance';
import calendar from '@/routes/calendar';
import leaveReviews from '@/routes/leave-reviews';
import leaves from '@/routes/leaves';
import roleRoutes from '@/routes/roles';
import slip from '@/routes/slip';
import users from '@/routes/users';
import type { NavItem } from '@/types';
import { Permissions } from '@/types/auth';
import OCD from '../../../public/ocd_logo.svg';

const mainNavItems: NavItem[] = [
    {
        title: 'My Balance',
        href: balance.mine(),
        icon: Wallet,
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: Permissions.ViewAllBalances,
    },
    {
        title: 'Leaves',
        href: leaves.index(),
        icon: Plane,
        permission: Permissions.ViewAllBalances,
    },
    {
        title: 'Calendar',
        href: calendar.index(),
        icon: CalendarClock,
    },
    {
        title: 'Filed Leaves',
        href: leaveReviews.index(),
        icon: ClipboardCheck,
        permission: Permissions.ReviewLeave,
    },
    {
        title: 'Employees',
        href: users.index(),
        icon: User2,
        permission: Permissions.ViewAllEmployees,
    },
    {
        title: 'Roles & Permissions',
        href: roleRoutes.index(),
        icon: ShieldCheck,
        permission: Permissions.AssignRoles,
    },
    // {
    //     title: 'Pass Slip',
    //     href: slip.index(),
    //     icon: FileTextIcon,
    // },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="4xl" asChild>
                            <Link
                                href={dashboard()}
                                className="flex flex-col justify-center"
                                prefetch
                            >
                                <img
                                    src={OCD}
                                    className="w-sm:size-14 size-28"
                                    alt=""
                                />
                                <span className="hidden:w-sm">
                                    Office of Civil Defense
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
