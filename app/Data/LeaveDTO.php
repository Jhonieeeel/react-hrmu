<?php


namespace App\Data;

use Spatie\LaravelData\Data;

class LeaveDTO extends Data
{
    public function __construct(
        public ?int     $user_id,
        public string   $leave_type,
        public string   $event_type,
        public ?string  $event_tag,
        public float    $balance,
        public string   $starts_at,
        public string   $ends_at,
        public ?bool $status,
        public ?string $remarks,
    ) {}
}
