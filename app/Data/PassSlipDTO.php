<?php


namespace App\Data;

use Spatie\LaravelData\Data;

class PassSlipDTO extends Data
{
   public function __construct(
        public string $date_requested,
        public string $request_type,
        public string $expected_departure,

        public ?string $date_accomplished,
        public ?string $actual_arrival,

        public string $position,

        public int $department_id,
        public ?int $unit_id,
        public ?int $section_id,
        public ?int $division_id,

        public string $destination,
        public string $purpose,

        public int $assigned_to,
    ) {
    }
}
