import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlashBridge } from '@/components/flash-bridge';
import { NotificationViewport } from '@/components/notification-viewport';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NotificationProvider } from '@/contexts/notification-context';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

// react query

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const queryClient = new QueryClient();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app, { page }) {
        return (
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <TooltipProvider delayDuration={0}>
                        {app}

                        {/* Raised from any page without that page having to opt
                            in, and rendered as Alerts rather than toasts.

                            withApp wraps Inertia's <App>, so this sits outside
                            the page context and takes the initial page as a
                            prop instead of calling usePage(). */}
                        <FlashBridge initialPage={page} />
                        <NotificationViewport />
                    </TooltipProvider>
                </NotificationProvider>
            </QueryClientProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();