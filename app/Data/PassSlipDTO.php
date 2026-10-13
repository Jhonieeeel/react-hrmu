<?php

namespace App\Data;

use App\Actions\PassSlip\CreatePassSlipAction;
use Spatie\LaravelData\Data;

/**
 * The employee-entered half of a pass slip, as a plain data carrier.
 *
 * Everything the form asks a person to type arrives here. Everything the form
 * derives — printed name, position, unit/section/division, the recommending
 * supervisor — is deliberately absent, because CreatePassSlipAction resolves
 * those from the personnel record and a client-supplied value would let a
 * filer misstate their own designation.
 *
 * Validation lives in App\Http\Requests\PassSlipRequest rather than here, so
 * the authorisation decision and the field checks sit in the same place.
 *
 * @see CreatePassSlipAction
 */
class PassSlipDTO extends Data
{
    /**
     * @param  string  $request_type  Official or personal.
     * @param  string|null  $date_requested  The date being asked off, which is not the date of filing.
     * @param  string|null  $expected_arrival  The planned return. Null for an early-out slip, where no return is expected. Must not precede departure when given.
     * @param  int|null  $user_id  File against someone else. Only honoured for holders of "view all pass slips".
     * @param  int|null  $recommended_by  Overrides the derived section head. Also HR-only.
     * @param  int|null  $assigned_to  The next higher official who approves. Optional at filing time.
     * @param  string|null  $date_accomplished  HR-only back-fill of the date the slip was filed out.
     */
    public function __construct(
        public string $request_type,
        public ?string $date_requested,
        public string $expected_departure,
        public ?string $expected_arrival,
        public string $destination,
        public string $purpose,
        public ?int $user_id = null,
        public ?int $recommended_by = null,
        public ?int $assigned_to = null,
        public ?string $date_accomplished = null,
    ) {}

    /**
     * Builds the DTO from an already-validated request payload.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function fromPayload(array $payload): self
    {
        return new self(...$payload);
    }
}
