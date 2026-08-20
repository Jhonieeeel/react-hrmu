<?php

namespace App\Http\Controllers;

use App\Actions\Leave\AddMonthlyForm;
use App\Actions\Leave\AddUserBalanceAction;
use App\Actions\User\CreateUserAction;
use App\Actions\User\UsersListAction;
use App\Data\LeaveDTO;
use App\Data\UserDTO;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rules;
class UserController extends Controller
{

    public function filing(LeaveDTO $dto, AddMonthlyForm $filing) {
        $filing->monthyFiling($dto);

        return to_route('users.index')->with('message', 'Monthly Filing Created!');
    }

    public function balance(LeaveDTO $dto, AddUserBalanceAction $action) {

        $action($dto);

        return to_route('users.index')->with('message', "$dto->leave_type balance has been added!");
    }

    public function store(Request $request, CreateUserAction $action, UserDTO $data)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $action->execute($data);

        return to_route('users.index')
            ->with('message', 'User created successfully.');
    }

    // data
    public function data(UsersListAction $action) {
        return response()->json($action());
    }

    public function index(): Response {
        return Inertia::render("User/index", ['users_data' => User::query()->where('is_transferee', true)->select(['id', 'name'])->get()]);
    }
}
