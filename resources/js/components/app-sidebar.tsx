import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CalendarClock,
    FileTextIcon,
    FolderGit2,
    LayoutGrid,
    Plane,
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
import type { NavItem } from '@/types';
import leaves from '@/routes/leaves';
import OCD from '../../../public/ocd_logo.svg';
import calendar from '@/routes/calendar';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Leaves',
        href: leaves.index(),
        icon: Plane,
    },
    {
        title: 'Calendar',
        href: calendar.index(),
        icon: CalendarClock,
    },
    // {
    //     title: 'Pass Slip',
    //     href: '',
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
