import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import { Permissions } from '@/types/auth';
import { useState } from 'react';

type Range = { starts_at: string; ends_at: string };

type LeaveRequest = {
    filing_group_id: string | null;
    employee_id: number;
    employee_name: string;
    position: string | null;
    unit: string | null;
    section: string | null;
    leave_type: string;
    ranges: Range[];
    total_days: number;
    remarks: string | null;
    filed_at: string | null;
    segment_count: number;
};

type Props = {
    requests: LeaveRequest[];
};

export default function ReviewQueue({ requests }: Props) {
    const { can } = usePermissions();
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const decide = (groupId: string, decision: 'approve' | 'reject') => {
        const note = notes[groupId] ?? '';

        if (decision === 'reject' && note.trim() === '') {
            setError('A reason is required to reject a leave request.');
            return;
        }

        setProcessing(groupId);
        setError(null);

        router.post(
            decision === 'approve'
                ? `/leave-reviews/${groupId}/approve`
                : `/leave-reviews/${groupId}/reject`,
            { review_remarks: note || null },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            }
        );
    };

    return (
        <>
            <Head title="Leave Reviews" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Leave Reviews
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Requests filed by employees. A request only affects the
                        employee&apos;s balance once it is approved.
                    </p>
                </div>

                {error && (
                    <p className="text-destructive text-sm font-medium">
                        {error}
                    </p>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Pending requests</CardTitle>
                        <CardDescription>
                            {requests.length}{' '}
                            {requests.length === 1
                                ? 'request'
                                : 'requests'}{' '}
                            awaiting a decision.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {requests.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                Nothing to review right now.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead className="text-right">
                                            Days
                                        </TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">
                                            Decision
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {requests.map((request) => (
                                        <ReviewRow
                                            key={
                                                request.filing_group_id ??
                                                `legacy-${request.employee_id}`
                                            }
                                            request={request}
                                            note={notes[
                                                request.filing_group_id ?? ''
                                            ] ?? ''}
                                            onNoteChange={(value) =>
                                                setNotes((prev) => ({
                                                    ...prev,
                                                    [request.filing_group_id ??
                                                        '']: value,
                                                }))
                                            }
                                            onDecide={decide}
                                            busy={processing ===
                                                request.filing_group_id}
                                            canReview={can(
                                                Permissions.ReviewLeave
                                            )}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

type ReviewRowProps = {
    request: LeaveRequest;
    note: string;
    onNoteChange: (value: string) => void;
    onDecide: (groupId: string, decision: 'approve' | 'reject') => void;
    busy: boolean;
    canReview: boolean;
};

function ReviewRow({
    request,
    note,
    onNoteChange,
    onDecide,
    busy,
    canReview,
}: ReviewRowProps) {
    const groupId = request.filing_group_id;

    return (
        <TableRow>
            <TableCell>
                <div className="flex flex-col">
                    <Link
                        href={`/leaves/${request.employee_id}`}
                        className="font-medium hover:underline"
                    >
                        {request.employee_name}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                        {[request.position, request.unit, request.section]
                            .filter(Boolean)
                            .join(' · ')}
                    </span>
                </div>
            </TableCell>

            <TableCell>
                <Badge variant="secondary">{request.leave_type}</Badge>
            </TableCell>

            <TableCell>
                <div className="flex flex-col gap-0.5 text-sm">
                    {request.ranges.map((range, index) => (
                        <span key={`${range.starts_at}-${index}`}>
                            {range.starts_at === range.ends_at
                                ? range.starts_at
                                : `${range.starts_at} → ${range.ends_at}`}
                        </span>
                    ))}
                </div>
            </TableCell>

            <TableCell className="text-right font-medium tabular-nums">
                {request.total_days}
            </TableCell>

            <TableCell className="max-w-56">
                {request.remarks ? (
                    <span className="text-muted-foreground text-sm">
                        {request.remarks}
                    </span>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                )}
            </TableCell>

            <TableCell className="text-right">
                {!groupId ? (
                    <span
                        className="text-muted-foreground text-xs"
                        title="This filing predates request grouping and must be handled from the employee's balance page."
                    >
                    Review on balance page
                    </span>
                ) : (
                    <div className="flex flex-col items-end gap-2">
                        <Textarea
                            value={note}
                            onChange={(event) =>
                                onNoteChange(event.target.value)
                            }
                            placeholder="Note (required to reject)"
                            className="min-h-16 w-56 text-sm"
                            disabled={!canReview}
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => onDecide(groupId, 'approve')}
                                disabled={busy || !canReview}
                            >
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDecide(groupId, 'reject')}
                                disabled={busy || !canReview}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
}
