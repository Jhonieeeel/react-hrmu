<?php

namespace App\Http\Controllers;

use App\Actions\Leave\HasAccrualAction;
use App\Actions\Leave\LeaveHistoryAction;
use App\Actions\Leave\ReplayBalanceAction;
use App\Actions\Leave\UsersFilingAction;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index()
    {
        return Inertia::render("Leave/index");
    }

    public function show(User $user)
    {
        return Inertia::render("Leave/UserBalance", [
            'user' => $user
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

        return to_route("leaves.index")->with('message', 'Monthly Filing Updated');
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

        return response()->json([
            'balances' => $balances,
            'transactions' => $transactions,
            'hasAccrual' => $accrualStatus
        ]);
    }


    public function filing(Request $request, UsersFilingAction $usersFiling)
    {
        return response()->json($usersFiling($request));
    }
}
