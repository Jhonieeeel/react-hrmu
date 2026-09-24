<?php

namespace App\Http\Controllers;

use App\Actions\Leave\CheckDateRangeAction;
use App\Actions\Leave\HasAccrualAction;
use App\Actions\Leave\LeaveHistoryAction;
use App\Actions\Leave\ReplayBalanceAction;
use App\Actions\Leave\CreateLeaveAction;
use App\Actions\Leave\ExportPdfAction;
use App\Actions\Leave\MonthlyAccrualAction;
use App\Actions\Leave\EmployeesFilingAction;
use App\Data\InitialAccrualDTO;
use App\Data\LeaveDTO;
use App\Models\Employee;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;


class LeaveController extends Controller
{

    public function destroy(Leave $leave)
    {
        $leave->delete();

        return back()->with('success', 'Deleted Successfully!');
    }

    public function index()
    {
        return Inertia::render("Leave/index");
    }

    public function initialAccrual(InitialAccrualDTO $initialAccrualDTO, MonthlyAccrualAction $action)
    {
        $action->addInitialAccrual($initialAccrualDTO);

        return to_route("leaves.index")->with('success', [
            'message' => 'Initial Accrual Added Successfully',
            'id' => Str::uuid()
        ]);
    }

    public function store(Request $request, LeaveDTO $leaveData, CreateLeaveAction $action, CheckDateRangeAction $checkDateRangeAction)
    {
        $weekdays = $checkDateRangeAction->checkDateRange($leaveData);

        $action->createLeaves($weekdays, $leaveData);

        return back()->with('success', [
            'message' => 'Filed Leave Successfully',
            'id' => Str::uuid()
        ]);
    }

    public function edit(Leave $leave)
    {
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

    public function show(Employee $employee, Request $request)
    {
        return Inertia::render("Leave/UserBalance", [
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
        HasAccrualAction $hasAccrual
    ) {
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
                'year' => $request->year
            ],
            'employeeType' => $employeeType
        ]);
    }


    public function filing(Request $request, EmployeesFilingAction $employeesFiling)
    {
        return response()->json($employeesFiling($request));
    }

    public function accrual(Request $request, LeaveDTO $data, MonthlyAccrualAction $action)
    {
        $filters = $request->input('filters');

        $action->handleAccrual($data);

        $date = Carbon::parse($data->starts_at);

        info($date->month);

        return to_route('leaves.show', [
            'employee' => $data->employee_id,
            'month' => $date->month,
            'year' => $date->year
        ])->with('success', [
            'message' => 'Monthly Accrual Added Successfully',
            'id' => Str::uuid()
        ]);
    }


    public function export(Request $request, ExportPdfAction $export, ReplayBalanceAction $balanceAction)
    {
        $month = $request->input("month", now()->month);
        $year = $request->input("year", now()->year);

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
