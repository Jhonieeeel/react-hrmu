<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Data;

class CreateLeaveAction extends Data
{

    protected $workingDaysLeave = [
        'vacation leave',
        'force leave',
        'sick leave',
        'paternity leave',
        'special privilege leave',
        'solo parent leave',
        '10-day vawc leave',
        'special emergency (calamity) leave',
        'wellness leave'
    ];

    public function createLeaves(array $ranges, LeaveDTO $data): void
    {
        DB::transaction(function () use ($ranges, $data) {

            foreach ($ranges as $range) {

                $balance = Carbon::parse($range['starts_at'])
                    ->diffInDays(Carbon::parse($range['ends_at'])) + 1;

                Leave::create([
                    'user_id' => $data->user_id,
                    'leave_type' => $data->leave_type,
                    'event_type' => $data->event_type,
                    'event_tag' => $data->event_tag,
                    'balance' => -$balance,
                    'starts_at' => $range['starts_at'],
                    'ends_at' => $range['ends_at'],
                ]);
            }
        });
    }
}
