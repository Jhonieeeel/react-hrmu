<?php

namespace App\Http\Controllers;

use App\Actions\Leave\CreateUndertimeAction;
use App\Data\LeaveDTO;
use Illuminate\Http\Request;

class UndertimeController extends Controller
{
    public function store(LeaveDTO $dto, CreateUndertimeAction $action) {

        $action($dto);

        return to_route('leaves.show', $dto->user_id)->with('message', 'Undertime Created Successfully');
    }
}
