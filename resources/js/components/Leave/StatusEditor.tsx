import { router } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, PencilLine } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import leaveReviews from '@/routes/leave-reviews';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

const OPTIONS: { value: LeaveStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

/**
 * The correction control for a leave request's approval state.
 *
 * Distinct from the Approve/Reject pair the queue offers on a request nobody has
 * answered yet. That pair is a decision; this is an amendment to one that has
 * already been recorded, and it exists because the screen and the paper record
 * are expected to disagree — some requests were saved as approved without anyone
 * having agreed to them, and someone has to be able to move them.
 *
 * It always posts the whole filing group, never one visible segment, because a
 * multi-day request approved in three days and pending in one is not a state
 * anybody can act on.
 *
 * Server-side the change is refused without the ReviewLeave permission and
 * recorded in leave_status_changes, so `canReview` here is only about not
 * offering a control that would bounce.
 */
export function StatusEditor({
    filingGroupId,
    status,
    disabled = false,
    onDone,
}: {
    /** The `filing_group_id` the status belongs to. */
    filingGroupId: string | null;
    /** Current derived state, used to preselect and to hide a no-op. */
    status: LeaveStatus;
    disabled?: boolean;
    /** Called after a successful change, e.g. to close the surrounding dialog. */
    onDone?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [next, setNext] = useState<LeaveStatus>(status);
    const [remarks, setRemarks] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // A request that predates grouping has no id the endpoint can act on, so the
    // control is withheld rather than offered and quietly refused.
    if (!filingGroupId) {
        return null;
    }

    function submit() {
        // Mirrors the server rule in LeaveReviewController::changeStatus: a
        // request turned down with no reason gives the employee nothing to act
        // on, so it is refused here rather than bounced back as a validation
        // error on a dialog they will have to find again.
        if (next === 'rejected' && remarks.trim() === '') {
            setError('A reason is required to reject a leave request.');

            return;
        }

        setSaving(true);
        setError(null);

        router.patch(
            leaveReviews.status(filingGroupId as string).url,
            { status: next, review_remarks: remarks || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // A status change moves the row between queue tabs and
                    // changes whether it counts against the balance, so every
                    // React Query cache built on leave rows is now stale.
                    queryClient.invalidateQueries({ queryKey: ['leaves'] });
                    queryClient.invalidateQueries({
                        queryKey: ['calendarEvents'],
                    });

                    setOpen(false);
                    setRemarks('');
                    onDone?.();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];

                    setError(
                        typeof first === 'string' ? first : 'That change could not be saved.',
                    );
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value);

                // Reopening must not carry the previous attempt's state.
                if (value) {
                    setNext(status);
                    setRemarks('');
                    setError(null);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    title="Change this request's approval status"
                >
                    <PencilLine className="mr-1 size-3.5" />
                    Edit status
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change approval status</DialogTitle>
                    <DialogDescription>
                        The request is currently{' '}
                        <span className="font-medium capitalize">{status}</span>.
                        Moving it applies to the whole filing, and the previous
                        decision is kept on the record.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="leave-status">New status</Label>
                        <Select
                            value={next}
                            onValueChange={(value) =>
                                setNext(value as LeaveStatus)
                            }
                        >
                            <SelectTrigger id="leave-status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="leave-status-remarks">
                            Reason
                            {next === 'rejected' ? (
                                <span className="text-destructive">
                                    {' '}
                                    (required)
                                </span>
                            ) : (
                                <span className="text-muted-foreground font-normal">
                                    {' '}
                                    (optional)
                                </span>
                            )}
                        </Label>
                        <Textarea
                            id="leave-status-remarks"
                            value={remarks}
                            onChange={(event) => setRemarks(event.target.value)}
                            placeholder="Why is this being changed?"
                            className="min-h-20 text-sm"
                        />
                        <p className="text-muted-foreground text-xs">
                            Leave blank to keep the reason already on the
                            request.
                        </p>
                    </div>

                    {error && (
                        <p className="text-destructive text-sm font-medium">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={submit}
                        // A no-op change is blocked here rather than posted, so
                        // the audit trail does not fill with entries that did
                        // not alter anything.
                        disabled={saving || next === status}
                    >
                        {saving && (
                            <Loader2 className="mr-1 size-3.5 animate-spin" />
                        )}
                        Save status
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}