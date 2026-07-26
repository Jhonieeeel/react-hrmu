import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';
import OCD from '../../../../public/ocd_logo.svg';
import Pilipinas from '../../../../public/bagong-pilipinas.svg?react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
                <footer className="h-36 bg-foreground">
                    <Pilipinas className="size-32 fill-white" />
                </footer>
            </AppContent>
        </AppShell>
    );
}
