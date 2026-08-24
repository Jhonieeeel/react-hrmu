<?php

namespace App\Http\Controllers;

use App\Actions\Leave\CreateUndertimeAction;
use App\Actions\Leave\UpdateUndertimeAction;
use App\Data\LeaveDTO;
use App\Models\Leave;
use Illuminate\Http\Request;

class UndertimeController extends Controller
{
    public function update(Leave $leave, LeaveDTO $dto, UpdateUndertimeAction $updateAction) {
        $updateAction($leave, $dto);

        return to_route('leaves.show', $dto->user_id)->with('success', 'Undertime Updated Successfully');

    }
    public function store(LeaveDTO $dto, CreateUndertimeAction $action)
    {

        $action($dto);

        return to_route('leaves.show', $dto->user_id)->with('success', 'Undertime Created Successfully');
    }
}
