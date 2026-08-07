<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;
use Carbon\Carbon;

class AddUserBalanceAction
{
    public function __invoke(LeaveDTO $dto): Leave
    {
        $startsAt = Carbon::parse($dto->starts_at); // 2023-01-01
        $endsAt = Carbon::parse($dto->ends_at);     // 2023-01-31

        return Leave::create([
            'user_id' => $dto->user_id,
            'leave_type' => $dto->leave_type,
            'event_type' => $dto->event_type,
            'event_tag' => $dto->event_tag,
            'balance' => abs($dto->balance),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);
    }
}
