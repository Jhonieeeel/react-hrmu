import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/notification-context';
import type { FlashMessageProp } from '@/types';

type FlashProp = {
    success?: FlashMessageProp | null;
    /** Same normalised shape as success; the middleware guarantees both. */
    error?: FlashMessageProp | null;
};

/**
 * Turns the server's flash message into a notification.
 *
 * Deliberately does not use usePage(): this component is mounted from withApp,
 * which wraps Inertia's <App> rather than living inside it, so the page context
 * is not available here. Instead it takes the initial page as a prop and then
 * follows the router, which yields the same data without the context.
 *
 * Mounted globally and driven by the shared `flash` prop rather than by each
 * page opting in. That was the reason a notice could go missing: every page had
 * to remember to call useFlashToast itself, and any page that did not — or a
 * partial reload that left the prop untouched — silently dropped the message.
 *
 * Ids are remembered so an unrelated re-render does not replay the message it
 * is still holding, while a genuinely new submission (a fresh uuid) is always
 * shown.
 */
export function FlashBridge({ initialPage }: { initialPage?: unknown }) {
    const { notify } = useNotifications();

    const seen = useRef<{ success?: string; error?: string }>({});

    useEffect(() => {
        const handle = (page: unknown) => {
            const flash = (page as { props?: { flash?: FlashProp } })
                ?.props?.flash;

            const success = flash?.success;
            const error = flash?.error;

            if (success?.id && seen.current.success !== success.id) {
                seen.current.success = success.id;
                notify({
                    id: success.id,
                    variant: 'success',
                    title: success.message,
                });
            }

            if (error?.id && seen.current.error !== error.id) {
                seen.current.error = error.id;
                notify({
                    id: error.id,
                    variant: 'error',
                    title: error.message,
                });
            }
        };

        // Covers a reload landing directly on a page that still holds flash.
        handle(initialPage);

        // Covers every in-app visit: link clicks, form submissions, and the
        // redirect that follows them.
        return router.on('navigate', (event) => {
            handle(event.detail.page);
        });
    }, [initialPage, notify]);

    return null;
}