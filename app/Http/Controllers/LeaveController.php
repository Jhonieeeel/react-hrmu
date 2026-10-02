<?php

namespace App\Http\Controllers;

use App\Actions\Leave\CheckDateRangeAction;
use App\Actions\Leave\CreateLeaveAction;
use App\Actions\Leave\EmployeesFilingAction;
use App\Actions\Leave\ExportPdfAction;
use App\Actions\Leave\HasAccrualAction;
use App\Actions\Leave\LeaveHistoryAction;
use App\Actions\Leave\MonthlyAccrualAction;
use App\Actions\Leave\ReplayBalanceAction;
use App\Data\InitialAccrualDTO;
use App\Data\LeaveDTO;
use App\Enums\Permission;
use App\Models\Employee;
use App\Models\Leave;
use App\Services\LeaveBalanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function destroy(Leave $leave)
    {
        // Policy: the employee may withdraw their own filing while it is still
        // undecided; once approved, only HR can delete it.
        $this->authorize('delete', $leave);

        $leave->delete();

        return back()->with('success', [
            'message' => 'Deleted Successfully!',
            'id' => Str::uuid(),
        ]);
    }

    public function index()
    {
        return Inertia::render('Leave/index');
    }

    /**
     * The caller's own balance page.
     *
     * Resolves the employee record from the session rather than the URL, so an
     * employee has a stable entry point that cannot be pointed at someone else's
     * record by editing a link.
     */
    public function myBalance(Request $request, LeaveBalanceService $balances): Response
    {
        $employee = $balances->ownEmployee();

        abort_if($employee === null, 403, 'Your account is not linked to an employee record.');

        $balances->authorize($employee);

        return Inertia::render('Leave/UserBalance', [
            'user' => [
                'id' => $employee->id,
                'name' => $employee->user?->name ?? 'Unknown employee',
                'employee_type' => $employee->user?->employee_type,
            ],
            'filters' => [
                'month' => $request->input('month'),
                'year' => $request->input('year'),
            ],
        ]);
    }

    public function initialAccrual(InitialAccrualDTO $initialAccrualDTO, MonthlyAccrualAction $action)
    {
        $this->authorize('adjust', Employee::query()->findOrFail($initialAccrualDTO->employee_id));

        $action->addInitialAccrual($initialAccrualDTO);

        return to_route('leaves.index')->with('success', [
            'message' => 'Initial Accrual Added Successfully',
            'id' => Str::uuid(),
        ]);
    }

    public function store(Request $request, LeaveDTO $leaveData, CreateLeaveAction $action, CheckDateRangeAction $checkDateRangeAction)
    {
        // Resolve first, then overwrite employee_id on the DTO. Reading the id
        // straight off the request would let a crafted payload file leave
        // against someone else's record.
        $leaveData->employee_id = $this->resolveEmployee($leaveData->employee_id)->id;

        $weekdays = $checkDateRangeAction->checkDateRange($leaveData);

        if ($weekdays === []) {
            // Raised both as a validation error (shown next to the form) and on
            // the error flash channel (shown as a notification), so a submit
            // that does nothing is never silent.
            return back()
                ->withErrors([
                    'date_range' => 'The selected range contains no working days.',
                ])
                ->with('error', 'The selected range contains no working days.');
        }

        $action->createLeaves($weekdays, $leaveData);

        return back()->with('success', [
            'message' => 'Leave filed successfully and is awaiting approval.',
            'id' => Str::uuid(),
        ]);
    }

    /**
     * Employees may only file against their own record; HR may file for anyone.
     */
    protected function resolveEmployee(?int $employeeId): Employee
    {
        $user = auth()->user();

        if ($user->can(Permission::ViewAllBalances)) {
            return Employee::query()->findOrFail($employeeId);
        }

        $own = $user->employee();

        if (! $own) {
            abort(403, 'Your account is not linked to an employee record.');
        }

        // Silently redirect to the caller's own record so a crafted request
        // cannot file leave on someone else's behalf.
        return $own;
    }

    public function edit(Leave $leave)
    {
        $this->authorize('update', $leave);

        $leave->load('employee.user');

        if (in_array($leave->event_tag, ['tardiness', 'undertime'])) {
            return Inertia::render('Leave/EditUndertimeForm', [
                'leave' => $leave,
            ]);
        }

        return Inertia::render('Leave/EditLeaveForm', [
            'leave' => $leave,
        ]);
    }

    public function show(Employee $employee, Request $request, LeaveBalanceService $balances)
    {
        $balances->authorize($employee);

        return Inertia::render('Leave/UserBalance', [
            'user' => [
                'id' => $employee->id,
                'name' => $employee->user?->name ?? 'Unknown employee',
                'employee_type' => $employee->user?->employee_type,
            ],
            'filters' => [
                'month' => $request->input('month'),
                'year' => $request->input('year'),
            ],
        ]);
    }

    public function update(Request $request, Leave $leave)
    {
        $this->authorize('update', $leave);

        $validated = $request->validate([
            'employee_id' => ['sometimes', 'integer', 'exists:employees,id'],
            'leave_type' => ['sometimes', 'string', 'max:255'],
            'event_type' => ['sometimes', 'string', 'max:255'],
            'event_tag' => ['sometimes', 'nullable', 'string', 'max:255'],
            'balance' => ['sometimes', 'numeric'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after_or_equal:starts_at'],
            'status' => ['sometimes', 'boolean'],
            'remarks' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $leave->fill($validated)->save();

        return back()->with('success', [
            'message' => 'Leave updated successfully.',
            'id' => Str::uuid(),
        ]);
    }

    public function userBalance(
        Request $request,
        Employee $employee,
        ReplayBalanceAction $replayBalance,
        LeaveHistoryAction $leaveHistory,
        HasAccrualAction $hasAccrual,
        LeaveBalanceService $balanceAccess
    ) {
        $balanceAccess->authorize($employee);

        $balances = $replayBalance->EmployeeBalance($request, $employee);
        $transactions = $leaveHistory->transactions($request, $employee);
        $accrualStatus = $hasAccrual->checkEmployeeStatus($request, $employee);
        $employeeType = $employee->user?->employee_type;

        return response()->json([
            'balances' => $balances,
            'transactions' => $transactions,
            'hasAccrual' => $accrualStatus,
            'filters' => [
                'month' => $request->month,
                'year' => $request->year,
            ],
            'employeeType' => $employeeType,
            // Held out of `balances` until approved, so the UI can show the
            // employee what is in flight without it affecting spendable days.
            'pending' => $balanceAccess->pendingByLeaveType($employee),
        ]);
    }

    public function filing(Request $request, EmployeesFilingAction $employeesFiling)
    {
        return response()->json($employeesFiling($request));
    }

    public function accrual(Request $request, LeaveDTO $data, MonthlyAccrualAction $action)
    {
        $this->authorize('adjust', Employee::query()->findOrFail($data->employee_id));

        $action->handleAccrual($data);

        $date = Carbon::parse($data->starts_at);

        return to_route('leaves.show', [
            'employee' => $data->employee_id,
            'month' => $date->month,
            'year' => $date->year,
        ])->with('success', [
            'message' => 'Monthly Accrual Added Successfully',
            'id' => Str::uuid(),
        ]);
    }

    public function export(Request $request, ExportPdfAction $export, ReplayBalanceAction $balanceAction)
    {
        $this->authorize('viewAny', Leave::class);

        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $date = Carbon::create($year, $month, 1);
        $employees = Employee::query()
            ->with('user:id,name')
            ->get(['id', 'user_id']);

        $usersBalance = $balanceAction->EmployeesBalances($date, $employees);
        $exportUrl = $export->exportPdf($usersBalance);

        return to_route(
            'leaves.index',
            $request->only(['year', 'month'])
        )->with('downloadUrl', $exportUrl);
    }
}
