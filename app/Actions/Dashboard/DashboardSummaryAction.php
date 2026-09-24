<?php

namespace App\Actions\Dashboard;

use App\Models\Employee;
use App\Models\Holiday;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DashboardSummaryAction
{
    public function __invoke(Request $request): array
    {
        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);
        $leaveType = strtolower((string) $request->input('leave_type', 'monthly filing'));

        $availableLeaveTypes = [
            'monthly filing',
            'vacation leave',
            'sick leave',
            'force leave',
            'wellness leave',
            'paternity leave',
            'special privilege leave',
            'solo parent leave',
            '10-day vawc leave',
            'special emergency (calamity) leave',
            'maternity leave',
            'study leave',
            'rehabilitation leave',
            'adoption leave',
            'cto',
            'offset',
            'absent',
        ];

        if (! in_array($leaveType, $availableLeaveTypes, true)) {
            $leaveType = 'monthly filing';
        }

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > now()->year + 1) {
            $year = now()->year;
        }

        $selectedDate = Carbon::create($year, $month, 1);
        $monthStart = $selectedDate->copy()->startOfMonth();
        $monthEnd = $selectedDate->copy()->endOfMonth();

        $monthlyFilings = Leave::query()
            ->with('employee.user:id,name')
            ->where('leave_type', $leaveType)
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->get();

        $filingSummaries = $this->summarizeFilings($monthlyFilings);

        return [
            'summary' => [
                'employees' => Employee::query()->count(),
                'leave_filings' => $monthlyFilings->count(),
                'filers' => $filingSummaries->count(),
                'pending_filings' => $monthlyFilings
                    ->filter(fn(Leave $filing) => ! (bool) $filing->status)
                    ->count(),
                'holidays' => Holiday::query()->count(),
            ],
            'filingSummaries' => $filingSummaries,
            'recentEmployees' => Employee::query()
                ->with('user:id,name')
                ->latest()
                ->limit(5)
                ->get(['id', 'user_id', 'created_at'])
                ->map(fn(Employee $employee) => [
                    'id' => $employee->user_id,
                    'name' => $employee->user?->name ?? 'Unknown employee',
                    'created_at' => $employee->created_at,
                ]),
            'filingPeriod' => [
                'month' => $selectedDate->month,
                'year' => $selectedDate->year,
                'leave_type' => $leaveType,
            ],
        ];
    }

    /**
     * @param  Collection<int, Leave>  $filings
     * @return Collection<int, array<string, mixed>>
     */
    private function summarizeFilings(Collection $filings): Collection
    {
        return $filings
            ->groupBy('employee_id')
            ->map(function (Collection $userFilings): array {
                $firstFiling = $userFilings->first();

                return [
                    'employee_id' => $firstFiling->employee_id,
                    'employee_name' => $firstFiling->employee?->user?->name ?? 'Unknown employee',
                    'leave_type' => $firstFiling->leave_type,
                    'filing_count' => $userFilings->count(),
                    'completed_count' => $userFilings
                        ->filter(fn(Leave $filing) => (bool) $filing->status)
                        ->count(),
                    'pending_count' => $userFilings
                        ->filter(fn(Leave $filing) => ! (bool) $filing->status)
                        ->count(),
                    'latest_filed_at' => $userFilings->max('created_at'),
                ];
            })
            ->sortByDesc('latest_filed_at')
            ->values();
    }
}
