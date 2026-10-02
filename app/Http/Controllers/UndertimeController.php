<?php

namespace App\Http\Controllers;

use App\Actions\Leave\CreateUndertimeAction;
use App\Actions\Leave\UpdateUndertimeAction;
use App\Data\LeaveDTO;
use App\Models\Employee;
use App\Models\Leave;

class UndertimeController extends Controller
{
    public function update(Leave $leave, LeaveDTO $dto, UpdateUndertimeAction $updateAction)
    {
        $this->authorize('update', $leave);

        $updateAction($leave, $dto);

        return to_route('leaves.show', $dto->employee_id)->with('success', 'Undertime Updated Successfully');

    }

    public function store(LeaveDTO $dto, CreateUndertimeAction $action)
    {
        $this->authorize('adjust', Employee::query()->findOrFail($dto->employee_id));

        $action($dto);

        return to_route('leaves.show', $dto->employee_id)->with('success', 'Undertime Added Successfully');
    }
}
