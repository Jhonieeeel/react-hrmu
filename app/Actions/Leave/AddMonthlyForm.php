<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;

class AddMonthlyForm {
     public function monthyFiling(LeaveDTO $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'balance' => 0,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at,
            'status' => false,
            'remarks' => ''
        ]);
    }
}
