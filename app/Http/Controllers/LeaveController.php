<?php

namespace App\Http\Controllers;

use App\Actions\Leave\CheckDateRangeAction;
use App\Actions\Leave\HasAccrualAction;
use App\Actions\Leave\LeaveHistoryAction;
use App\Actions\Leave\ReplayBalanceAction;
use App\Actions\Leave\CreateLeaveAction;
use App\Actions\Leave\ExportPdfAction;
use App\Actions\Leave\MonthlyAccrualAction;
use App\Actions\Leave\UsersFilingAction;
use App\Data\InitialAccrualDTO;
use App\Data\LeaveDTO;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index()
    {
        return Inertia::render("Leave/index");
    }

    public function initialAccrual(InitialAccrualDTO $initialAccrualDTO, MonthlyAccrualAction $action)
    {
        $action->addInitialAccrual($initialAccrualDTO);

        return to_route("leaves.index")->with('success', 'Initial Accrual Created Successfully.');
    }

    public function store(Request $request, LeaveDTO $leaveData, CreateLeaveAction $action, CheckDateRangeAction $checkDateRangeAction)
    {
        $weekdays = $checkDateRangeAction->checkDateRange($leaveData);

        $action->createLeaves($weekdays, $leaveData);

        return back()->with('success', 'Filed Leave Successfully');
    }

    public function edit(Leave $leave)
    {
        $leave->load('user');

        if (in_array($leave->event_tag, ['tardiness', 'undertime'])) {
            return Inertia::render('Leave/EditUndertimeForm', [
                'leave' => $leave,
            ]);
        }

        return Inertia::render('Leave/EditLeaveForm', [
            'leave' => $leave,
        ]);
    }

    public function show(User $user, Request $request)
    {
        info($user);
        return Inertia::render("Leave/UserBalance", [
            'user' => $user,
            'filters' => [
                'month' => $request->month,
                'year' => $request->year
            ]
        ]);
    }

    public function update(Request $request, Leave $leave)
    {
        $validated = $request->validate([
            'status' => ['required', 'boolean'],
            'remarks' => ['required', 'string', 'max:1000'],
        ]);

        $leave->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks']
        ]);

        return to_route("leaves.index")->with('success', 'Monthly Filing Updated');
    }

    public function userBalance(
        Request $request,
        User $user,
        ReplayBalanceAction $replayBalance,
        LeaveHistoryAction $leaveHistory,
        HasAccrualAction $hasAccrual
    ) {
        $balances = $replayBalance->UserBalance($request, $user);
        $transactions = $leaveHistory->transactions($request, $user);
        $accrualStatus = $hasAccrual->checkUserStatus($request, $user);
        $employeeType = $user->employee_type;

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


    public function filing(Request $request, UsersFilingAction $usersFiling)
    {
        return response()->json($usersFiling($request));
    }

    public function accrual(Request $request, LeaveDTO $data, MonthlyAccrualAction $action)
    {
        $filters = $request->input('filters');

        $action->handleAccrual($data);

        return to_route('leaves.show', [
            'user' => $data->user_id,
            'month' => $filters['month'],
            'year' => $filters['year'],
        ])->with('success', 'Monthly Accrual Added Successfully.');
    }


    public function export(Request $request, ExportPdfAction $export, ReplayBalanceAction $balanceAction)
    {
        $month = $request->input("month", now()->month);
        $year = $request->input("year", now()->year);

        $date = Carbon::create($year, $month, 1);
        $users = User::select(['id', 'name'])->get();

        $usersBalance = $balanceAction->UsersBalances($date, $users);
        $exportUrl = $export->exportPdf($usersBalance);

        return to_route(
            'leaves.index',
            $request->only(['year', 'month'])
        )->with('downloadUrl', $exportUrl);
    }
}
