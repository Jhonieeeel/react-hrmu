/**
 * Notification contract shared by the queue, the viewport and the flash bridge.
 */

export type NotificationVariant = 'success' | 'error' | 'info';

export type NotificationInput = {
    title: string;
    description?: string;
    variant?: NotificationVariant;
    /**
     * Identity used to deduplicate.
     *
     * Server flashes carry a fresh uuid per response, which is what lets the
     * same message be shown again after a second, genuinely new submission
     * while still being suppressed when a component simply re-renders.
     */
    id?: string;
    /** Milliseconds before auto-dismissal. */
    duration?: number;
};

export type Notification = Required<
    Omit<NotificationInput, 'description' | 'variant' | 'duration'>
> & {
    description?: string;
    variant: NotificationVariant;
    duration: number;
};