import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, ClipboardCheck, Plane, XCircle } from 'lucide-react';
import { useState } from 'react';
import PaginationButton from '@/components/Leave/PaginationButton';
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import leaveReviews from '@/routes/leave-reviews';
import leaves from '@/routes/leaves';
import { Permissions } from '@/types/auth';

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
    reviewed_at: string | null;
    review_remarks: string | null;
    reviewer_name: string | null;
};

type RequestsPage = {
    data: LeaveRequest[];
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    requests: RequestsPage;
    counts: Record<string, number>;
    filters: { status: string };
};

const STATUS_TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
] as const;

function formatRange(range: Range) {
    const start = parseISO(range.starts_at);
    const end = parseISO(range.ends_at);

    return range.starts_at === range.ends_at
        ? format(start, 'MMM d, yyyy')
        : `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

export default function ReviewQueue({ requests, counts, filters }: Props) {
    const { can } = usePermissions();
    const canReview = can(Permissions.ReviewLeave);

    const [notes, setNotes] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const status = filters.status ?? 'pending';
    const currentPage = requests.current_page ?? 1;
    const lastPage = requests.last_page ?? 1;
    const rows = requests.data ?? [];

    const decide = (groupId: string, decision: 'approve' | 'reject') => {
        const note = notes[groupId] ?? '';

        if (decision === 'reject' && note.trim() === '') {
            setError('A reason is required to reject a leave request.');

            return;
        }

        setProcessing(groupId);
        setError(null);

        const url =
            decision === 'approve'
                ? leaveReviews.approve(groupId).url
                : leaveReviews.reject(groupId).url;

        router.post(
            url,
            { review_remarks: note || null },
            {
                preserveScroll: true,
                // The queue is re-rendered from props, so the local note for this
                // row is no longer meaningful once the decision lands.
                onSuccess: () =>
                    setNotes((prev) => {
                        const next = { ...prev };
                        delete next[groupId];

                        return next;
                    }),
                onFinish: () => setProcessing(null),
            },
        );
    };

    const goToPage = (page: number) => {
        router.get(
            leaveReviews.index({ query: { status, page } }).url,
            { preserveScroll: true, replace: true },
        );
    };

    const switchStatus = (next: string) => {
        setError(null);
        router.get(
            leaveReviews.index({ query: { status: next, page: 1 } }).url,
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Leave Reviews" />

            <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
                <div className="space-y-1.5">
                    <h4 className="text-md flex items-center gap-1 font-bold">
                        <ClipboardCheck className="size-4" />
                        Leave requests
                    </h4>
                    <h1 className="text-4xl font-bold dark:text-accent">
                        {status === 'pending'
                            ? 'Awaiting approval'
                            : status === 'approved'
                              ? 'Approved requests'
                              : 'Rejected requests'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Leave filed by employees. A request only affects the
                        employee&apos;s balance once it is approved.
                    </p>
                </div>

                <Tabs value={status} onValueChange={switchStatus}>
                    <TabsList variant="line">
                        {STATUS_TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                                <Badge
                                    variant="secondary"
                                    className="ml-2 rounded-full px-1.5 py-0 text-[10px]"
                                >
                                    {counts?.[tab.value] ?? 0}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {error && (
                    <p className="text-destructive text-sm font-medium">
                        {error}
                    </p>
                )}

                <Card className="gap-0 overflow-hidden py-0 shadow-sm">
                    <CardHeader className="border-b bg-muted/20 px-5 py-4">
                        <CardTitle className="text-base">
                            {requests.total ?? 0}{' '}
                            {(requests.total ?? 0) === 1
                                ? 'request'
                                : 'requests'}
                        </CardTitle>
                        <CardDescription>
                            {status === 'pending'
                                ? 'Everything filed and not yet decided.'
                                : 'Kept for the record once a decision is made.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {rows.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 text-center">
                                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
                                    {status === 'pending' ? (
                                        <CheckCircle2 className="size-5" />
                                    ) : (
                                        <Plane className="size-5" />
                                    )}
                                </div>
                                <p className="text-sm font-medium">
                                    Nothing here right now
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {status === 'pending'
                                        ? 'Newly filed requests will appear here for a decision.'
                                        : 'Decided requests will appear here.'}
                                </p>
                            </div>
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
                                    {rows.map((request) => (
                                        <ReviewRow
                                            key={
                                                request.filing_group_id ??
                                                `legacy-${request.employee_id}`
                                            }
                                            request={request}
                                            status={status}
                                            note={
                                                notes[
                                                    request.filing_group_id ??
                                                    ''
                                                ] ?? ''
                                            }
                                            onNoteChange={(value) =>
                                                setNotes((prev) => ({
                                                    ...prev,
                                                    [request.filing_group_id ??
                                                        '']: value,
                                                }))
                                            }
                                            onDecide={decide}
                                            busy={
                                                processing ===
                                                request.filing_group_id
                                            }
                                            canReview={canReview}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {lastPage > 1 && (
                    <PaginationButton
                        currentPage={currentPage}
                        lastPage={lastPage}
                        onPageChange={goToPage}
                    />
                )}
            </div>
        </>
    );
}

type ReviewRowProps = {
    request: LeaveRequest;
    status: string;
    note: string;
    onNoteChange: (value: string) => void;
    onDecide: (groupId: string, decision: 'approve' | 'reject') => void;
    busy: boolean;
    canReview: boolean;
};

function ReviewRow({
    request,
    status,
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
                        href={leaves.show(request.employee_id)}
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
                            {formatRange(range)}
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
                {status !== 'pending' ? (
                    <DecisionSummary request={request} status={status} />
                ) : !groupId ? (
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
                            onChange={(event) => onNoteChange(event.target.value)}
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

/**
 * Read-only outcome column for a request that has already been decided.
 */
function DecisionSummary({
    request,
    status,
}: {
    request: LeaveRequest;
    status: string;
}) {
    const approved = status === 'approved';

    return (
        <div className="flex flex-col items-end gap-1">
            <span
                className={`inline-flex items-center gap-1 text-sm font-medium capitalize ${
                    approved
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-destructive'
                }`}
            >
                {approved ? (
                    <CheckCircle2 className="size-3.5" />
                ) : (
                    <XCircle className="size-3.5" />
                )}
                {status}
            </span>

            {request.reviewed_at && (
                <span className="text-muted-foreground text-xs">
                    {format(parseISO(request.reviewed_at), 'MMM d, yyyy h:mm a')}
                    {request.reviewer_name ? ` · ${request.reviewer_name}` : ''}
                </span>
            )}

            {request.review_remarks && (
                <span className="text-muted-foreground max-w-56 text-xs italic">
                    “{request.review_remarks}”
                </span>
            )}
        </div>
    );
}

ReviewQueue.layout = {
    breadcrumbs: [{ title: 'Leave Reviews', href: leaveReviews.index() }],
};