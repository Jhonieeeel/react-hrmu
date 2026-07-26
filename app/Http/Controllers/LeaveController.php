<?php

namespace App\Http\Controllers;

use App\Actions\Leave\LeaveHistoryAction;
use App\Actions\Leave\ReplayBalanceAction;
use App\Actions\Leave\UsersFilingAction;
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

    public function userBalance(
        Request $request,
        User $user,
        ReplayBalanceAction $replayBalance,
        LeaveHistoryAction $leaveHistory
    ) {
        $balances = $replayBalance->UserBalance($request, $user);
        $transactions = $leaveHistory->transactions($request, $user);

        return response()->json([
            'balances' => $balances,
            'transactions' => $transactions
        ]);
    }

    public function filing(Request $request, UsersFilingAction $usersFiling)
    {
        return response()->json($usersFiling($request));
    }
}
