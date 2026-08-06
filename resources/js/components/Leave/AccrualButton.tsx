import { Spinner } from '@/components/ui/spinner';
import leaves from '@/routes/leaves';
// import leave from '@/routes/leave';
import { Filters } from '@/types';
import { Button } from '@base-ui/react';
import { useForm } from '@inertiajs/react';
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { CalendarPlus2Icon } from 'lucide-react';

type AccrualButtonProps = {
    filters: Filters;
    user_id: number;
};

export default function AccrualButton({
    filters,
    user_id,
}: AccrualButtonProps) {
    const base = new Date(Number(filters.year), Number(filters.month) - 1, 1);

    const targetMonth = addMonths(base, 1);

    const starts_at = format(startOfMonth(targetMonth), 'yyyy-MM-dd');
    const ends_at = format(endOfMonth(targetMonth), 'yyyy-MM-dd');

    const form = useForm({
        user_id: user_id,
        leave_type: 'any leave',
        event_type: 'accrual',
        event_tag: 'accrual',
        balance: 1.25,
        starts_at: starts_at,
        ends_at: ends_at,
    });

    function handleAccrual(e: React.MouseEvent) {
        e.preventDefault();

        form.submit(leaves.accrual(form.data.user_id));
    }

    return (
        <Button
            type="button"
            onClick={handleAccrual}
            disabled={form.processing}
            className="dark:bg-brand dark:text-brand-foreground flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {form.processing ? (
                <Spinner className="h-4 w-4" />
            ) : (
                <CalendarPlus2Icon className="h-4 w-4" />
            )}

            {form.processing ? 'Processing...' : 'Accrual'}
        </Button>
    );
}
