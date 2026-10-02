<?php

namespace App\Actions\Leave;

use App\Data\LeaveDTO;
use App\Models\Leave;

class CreateUndertimeAction
{
    public function __invoke(LeaveDTO $data): void
    {
        Leave::create([
            ...$data->except('status')->toArray(),

            // A tardiness/undertime row is HR data entry, not an employee filing,
            // so it is approved from birth and never enters the review queue. It is
            // also what makes the row count towards the balance immediately — see
            // Leave::countsTowardsBalance().
            //
            // Forced here rather than trusted from the request: the column is NOT
            // NULL, and the form posts `status: false`, which would both fail the
            // insert and, if it did succeed, hold the deduction out of the balance.
            'status' => true,
        ]);
    }
}
