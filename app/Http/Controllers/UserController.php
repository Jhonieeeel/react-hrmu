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

   public function update(UserDTO $userDTO)
    {
        $user = User::findOrFail($userDTO->id);

        $user->update([
            'name' => $userDTO->name,
            'email' => $userDTO->email,
            'employee_type' => $userDTO->employee_type,
        ]);

        return to_route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function show(User $user): Response
    {
        return Inertia::render('User/UserInfo', [
            'user' => $user->only(['id', 'name', 'email', 'employee_type']),
        ]);
    }

    public function filing(LeaveDTO $dto, AddMonthlyForm $filing) {
        $filing->monthyFiling($dto);

        return to_route('users.index')->with('success', 'Monthly Filing Created!');
    }

    public function balance(LeaveDTO $dto, AddUserBalanceAction $action) {

        $action($dto);

        return to_route('users.index')->with('success', "$dto->leave_type balance has been added!");
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
            ->with('success', 'User created successfully.');
    }

    // data
    public function data(UsersListAction $action) {
        return response()->json($action());
    }

    public function index(): Response {
        // employee_type = 1, yes "New Employee, 0 if existing employee
        return Inertia::render("User/index", ['users_data' => User::query()->where('employee_type', 'transferee')->select(['id', 'name'])->get()]);
    }
}
