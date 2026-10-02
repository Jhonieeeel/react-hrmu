import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { Notification, NotificationInput } from '@/types/notification';

/** How long a notice stays on screen before it dismisses itself. */
export const NOTIFICATION_DURATION = 3000;

/** Notices beyond this are dropped oldest-first rather than growing unbounded. */
const MAX_VISIBLE = 4;

type NotificationContextValue = {
    notifications: Notification[];
    notify: (input: NotificationInput) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
    null,
);

let sequence = 0;

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: string) => {
        const timer = timers.current.get(id);

        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }

        setNotifications((current) =>
            current.filter((notification) => notification.id !== id),
        );
    }, []);

    const notify = useCallback(
        (input: NotificationInput) => {
            const id = input.id ?? `local-${++sequence}`;

            // A notice that is already on screen is re-armed rather than
            // duplicated. This is what stops one server response from being
            // shown twice when several components happen to observe it.
            setNotifications((current) => {
                const existing = current.find(
                    (notification) => notification.id === id,
                );

                if (existing) {
                    return current.map((notification) =>
                        notification.id === id
                            ? { ...notification, ...input }
                            : notification,
                    );
                }

                const next: Notification = {
                    id,
                    title: input.title,
                    description: input.description,
                    variant: input.variant ?? 'info',
                    duration: input.duration ?? NOTIFICATION_DURATION,
                };

                // Oldest first out, so a burst of submissions cannot build a
                // wall of notices over the page.
                return [...current, next].slice(-MAX_VISIBLE);
            });

            // Re-arm the timer so a re-notified id gets the full window again.
            const existing = timers.current.get(id);

            if (existing) {
                clearTimeout(existing);
                timers.current.delete(id);
            }

            timers.current.set(
                id,
                setTimeout(
                    () => dismiss(id),
                    input.duration ?? NOTIFICATION_DURATION,
                ),
            );

            return id;
        },
        [dismiss],
    );

    const dismissAll = useCallback(() => {
        timers.current.forEach((timer) => clearTimeout(timer));
        timers.current.clear();

        setNotifications([]);
    }, []);

    const value = useMemo(
        () => ({ notifications, notify, dismiss, dismissAll }),
        [notifications, notify, dismiss, dismissAll],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            'useNotifications must be used inside a NotificationProvider.',
        );
    }

    return context;
}