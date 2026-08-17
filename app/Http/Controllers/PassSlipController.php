<?php

namespace App\Http\Controllers;

use App\Data\PassSlipDTO;
use App\Models\PassSlip;
use App\Models\User;
use App\Notifications\PassSlipNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PassSlipController extends Controller
{
    public function index(): Response {
        return Inertia::render("PassSlip/Index", ['users' => User::select(['id', 'name'])->get()]);
    }

    public function store(PassSlipDTO $passSlipDTO) {

        $passSlip = PassSlip::create($passSlipDTO->toArray());

        $user = User::find($passSlipDTO->assigned_to);

        $user->notify(new PassSlipNotification($passSlip));

        return to_route('slip.index')->with('message', 'Pass Slip Added!');
    }
}
