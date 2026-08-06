<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;
use Carbon\Carbon;

class MonthlyAccrualAction
{
    public function handleAccrual(LeaveDTO $data)
    {
        $this->vacationLeaveAccrual($data);
        $this->sickLeaveAccrual($data);
        $this->monthlyFilingAccrual($data);

        if (Carbon::parse($data->ends_at)->month === 1) {
            $this->forceLeaveAccrual($data);
        }
    }
    public function vacationLeaveAccrual(LeaveDTO $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'vacation leave',
            'event_type' => $data->event_type,
            'event_tag' => null,
            'balance' => 1.25,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at
        ]);
    }

    public function sickLeaveAccrual(LeaveDTO $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'sick leave',
            'event_type' => $data->event_type,
            'event_tag' => null,
            'balance' => 1.25,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at
        ]);
    }

    public function forceLeaveAccrual(LeaveDTO $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'force leave',
            'event_type' => $data->event_type,
            'event_tag' => null,
            'balance' => 5,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at
        ]);
    }

    public function monthlyFilingAccrual(LeaveDTO $data)
    {
        Leave::create([
            'user_id' => $data->user_id,
            'leave_type' => 'monthly filing',
            'event_type' => 'filing',
            'event_tag' => 'filing',
            'balance' => 0,
            'starts_at' => $data->starts_at,
            'ends_at' => $data->ends_at,
            'status' => false
        ]);
    }
}
