<?php

namespace App\Http\Controllers;

use App\Actions\Leave\AddEmployeeBalanceAction;
use App\Actions\Leave\AddMonthlyForm;
use App\Actions\User\CreateUserAction;
use App\Actions\User\UpdateEmployeeDetailsAction;
use App\Actions\User\UsersListAction;
use App\Data\LeaveDTO;
use App\Data\UserDTO;
use App\Models\Division;
use App\Models\Employee;
use App\Models\Section;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function update(
        Request $request,
        User $user,
        UpdateEmployeeDetailsAction $action
    ) {
        $this->authorize('update', $user->employees()->firstOrFail());

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'employee_type' => ['required', Rule::in(['new employee', 'old', 'transferee'])],
            'position' => ['required', 'string', 'max:255'],
            'division_id' => ['nullable', 'integer', 'exists:divisions,id'],
            'section_id' => ['nullable', 'integer', 'exists:sections,id'],
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
        ]);

        $action->execute($user, $data);

        return to_route('users_info.show', $user)
            ->with('success', [
                'message' => 'Employee details updated successfully.',
                'id' => Str::uuid(),
            ]);
    }

    public function show(User $user): Response
    {
        $this->authorize('view', $user->employees()->firstOrFail());

        $employee = $user->employees()
            ->with(['section:id,section_name,section_code', 'unit:id,unit_name,unit_code'])
            ->first();

        return Inertia::render('User/UserInfo', [
            'user' => $user->only(['id', 'name', 'email', 'employee_type']),
            'employee' => $employee?->only([
                'id',
                'user_id',
                'position',
                'division_id',
                'section_id',
                'unit_id',
            ]) ?? [
                'id' => null,
                'user_id' => $user->id,
                'position' => '',
                'division_id' => null,
                'section_id' => null,
                'unit_id' => null,
            ],
            'divisions' => Division::query()->orderBy('division_name')->get(['id', 'division_name', 'division_code']),
            'sections' => Section::query()->with('division:id,division_name,division_code')->orderBy('section_name')->get(['id', 'division_id', 'section_name', 'section_code']),
            'units' => Unit::query()->orderBy('unit_name')->get(['id', 'section_id', 'unit_name', 'unit_code']),
        ]);
    }

    public function filing(LeaveDTO $dto, AddMonthlyForm $filing)
    {
        $this->authorize('view', Employee::query()->findOrFail($dto->employee_id));

        $filing->monthyFiling($dto);

        return to_route('users.index')->with('success', [
            'message' => 'Monthly Filing Added Successfully',
            'id' => Str::uuid(),
        ]);
    }

    public function balance(LeaveDTO $dto, AddEmployeeBalanceAction $action)
    {
        $this->authorize('adjust', Employee::query()->findOrFail($dto->employee_id));

        $action($dto);

        return to_route('users.index')->with('success', [
            'message' => "$dto->leave_type Added Successfully",
            'id' => Str::uuid(),
        ]);
    }

    public function store(Request $request, CreateUserAction $action, UserDTO $data)
    {
        $this->authorize('create', Employee::class);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $action->execute($data);

        return to_route('users.index')
            ->with('success', [
                'message' => 'User Added Successfully',
                'id' => Str::uuid(),
            ]);
    }

    // data
    public function data(Request $request, UsersListAction $action)
    {
        return response()->json($action($request));
    }

    public function index(): Response
    {
        $this->authorize('viewAny', Employee::class);

        return Inertia::render('User/index', [
            'users_data' => Employee::query()
                ->with('user:id,name')
                ->whereHas('user', fn ($query) => $query->where('employee_type', 'transferee'))
                ->get(['id', 'user_id'])
                ->map(fn (Employee $employee) => [
                    'id' => $employee->id,
                    'name' => $employee->user?->name,
                ]),
            'divisions' => Division::query()->orderBy('division_name')->get(['id', 'division_name', 'division_code']),
            'sections' => Section::query()->with('division:id,division_name,division_code')->orderBy('section_name')->get(['id', 'division_id', 'section_name', 'section_code']),
            'units' => Unit::query()->with('section:id,section_name,section_code')->orderBy('unit_name')->get(['id', 'section_id', 'unit_name', 'unit_code']),
        ]);
    }
}
