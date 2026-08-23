<?php


namespace App\Data;

use Spatie\LaravelData\Data;

class InitialAccrualDTO extends Data
{
    public function __construct(
        public ?int $user_id,
        public string $vacation_leave,
        public string $sick_leave,
        public float $vl_balance,
        public float $sl_balance,
        public string $starts_at,
        public string $ends_at,
    ) {
    }
}
