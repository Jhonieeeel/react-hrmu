<?php


namespace App\Data;

use Spatie\LaravelData\Data;

class UserDTO extends Data
{
   public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public bool $is_transferee,
        public ?string $starts_at,
        public ?string $ends_at
    ) {}
}
