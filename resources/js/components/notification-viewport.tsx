import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';
import type {
    Notification,
    NotificationVariant,
} from '@/types/notification';

const VARIANTS: Record<
    NotificationVariant,
    {
        icon: typeof CheckCircle2;
        accent: string;
        iconColor: string;
        /** Polite for confirmations, assertive for failures. */
        role: 'status' | 'alert';
    }
> = {
    success: {
        icon: CheckCircle2,
        accent: 'border-l-emerald-500',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        role: 'status',
    },
    error: {
        icon: AlertCircle,
        accent: 'border-l-destructive',
        iconColor: 'text-destructive',
        role: 'alert',
    },
    info: {
        icon: Info,
        accent: 'border-l-sky-500',
        iconColor: 'text-sky-600 dark:text-sky-400',
        role: 'status',
    },
};

function Notice({ notification }: { notification: Notification }) {
    const { dismiss } = useNotifications();

    const variant = VARIANTS[notification.variant];
    const Icon = variant.icon;

    return (
        <Alert
            role={variant.role}
            variant="default"
            className={cn(
                'animate-in slide-in-from-right-4 fade-in grid-cols-[auto_1fr_auto] items-start gap-x-3 overflow-hidden border-l-4 bg-popover p-4 shadow-lg',
                'duration-200',
                variant.accent,
            )}
        >
            <Icon className={cn('size-5 shrink-0', variant.iconColor)} />

            <div className="min-w-0">
                <AlertTitle className="line-clamp-none text-sm font-semibold">
                    {notification.title}
                </AlertTitle>

                {notification.description && (
                    <AlertDescription className="mt-1 text-xs">
                        {notification.description}
                    </AlertDescription>
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                aria-label="Dismiss notification"
                onClick={() => dismiss(notification.id)}
                className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
            >
                <X className="size-3.5" />
            </Button>

            {/* Countdown to auto-dismiss, so the 3s window is visible rather
                than the notice vanishing without explanation. Animated with a
                transform so it runs on the compositor. The duration is written
                inline because it is per-notice. */}
            <span
                aria-hidden
                className={cn(
                    'absolute bottom-0 left-0 h-0.5 w-full origin-left',
                    notification.variant === 'success' &&
                        'bg-emerald-500',
                    notification.variant === 'error' && 'bg-destructive',
                    notification.variant === 'info' && 'bg-sky-500',
                )}
                style={{
                    animation: `notification-countdown ${notification.duration}ms linear forwards`,
                }}
            />
        </Alert>
    );
}

/**
 * Renders the notification stack.
 *
 * Mounted once, globally, so a notice raised from any page — including one
 * triggered by an action on a page that never opted in — is shown.
 */
export function NotificationViewport() {
    const { notifications, dismissAll } = useNotifications();

    return (
        <div
            // The live region is what makes a notice announced rather than
            // silently appearing, which matters most for the error variant.
            aria-live="polite"
            aria-relevant="additions"
            className={cn(
                'pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4',
                'sm:inset-x-auto sm:right-0 sm:items-end',
            )}
        >
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="pointer-events-auto w-full max-w-sm"
                >
                    <Notice notification={notification} />
                </div>
            ))}

            {notifications.length > 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissAll}
                    className="pointer-events-auto text-muted-foreground hover:text-foreground"
                >
                    Dismiss all
                </Button>
            )}
        </div>
    );
}