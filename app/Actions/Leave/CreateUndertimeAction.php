<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;

class CreateUndertimeAction
{
    public function __invoke(LeaveDTO $data): void
    {
        Leave::create($data->toArray());
    }
}
