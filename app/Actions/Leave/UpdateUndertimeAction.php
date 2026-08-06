<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;

class UpdateUndertimeAction
{
    public function __invoke(Leave $leave, LeaveDTO $data): Leave
    {
        $leave->update($data->toArray());

        return $leave->refresh();
    }
}
