<?php

namespace App\Http\Requests;

use App\Models\PassSlip;
use Illuminate\Foundation\Http\FormRequest;

/**
 * HR correcting the two travel times on a pass slip.
 *
 * Narrow on purpose: this grants write access to exactly two columns and nothing
 * else. Amending a slip's purpose, destination or signatories is a separate
 * action with its own endpoint, so a request that slips an extra field into the
 * payload cannot quietly rewrite terms HR already approved.
 */
class EditTravelTimesRequest extends FormRequest
{
    public function authorize(): bool
    {
        // The dedicated `editTravelTimes` ability rather than the general
        // `update`: this is an HR-only correction and should stay that way even
        // if the rules around amending a filer's own pending request change.
        //
        // Resolved from the route rather than passed as a class string, because
        // the policy needs the actual row. Route model binding has already run
        // by the time a FormRequest is authorised.
        $passSlip = $this->route('passSlip');

        return $passSlip instanceof PassSlip
            && ($this->user()?->can('editTravelTimes', $passSlip) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'expected_departure' => ['required', 'date'],
            'actual_arrival' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'expected_departure.required' => 'Enter the expected time of departure.',
        ];
    }

    /**
     * Checks the two ordering rules a plain `after:`/`before:` rule cannot.
     *
     * Both span two columns that this request does not carry: the new departure
     * is checked against the expected return, and the new actual arrival against
     * the departure that will be in force once this write lands.
     */
    public function after(): array
    {
        return [
            function ($validator) {
                $passSlip = $this->route('passSlip');
                $departure = $this->date('expected_departure');

                // The expected return is not editable here, so this reads the
                // stored value: a departure that lands on or after it would put
                // the outward leg after the homecoming.
                if ($passSlip && $passSlip->expected_arrival !== null && $departure !== null) {
                    if ($departure->greaterThanOrEqualTo($passSlip->expected_arrival)) {
                        $validator->errors()->add(
                            'expected_departure',
                            'The expected departure must be before the expected return.'
                        );
                    }
                }

                $arrival = $this->date('actual_arrival');

                // Compared against the departure this request is setting, not the
                // stored one: that stored value is what gets overwritten, so
                // validating against it would check the arrival against a
                // timestamp that no longer exists once the write lands.
                if ($arrival !== null && $departure !== null) {
                    if ($arrival->lessThanOrEqualTo($departure)) {
                        $validator->errors()->add(
                            'actual_arrival',
                            'The actual arrival must be after the expected departure.'
                        );
                    }
                }
            },
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        return [
            'expected_departure' => $this->date('expected_departure'),
            'actual_arrival' => $this->date('actual_arrival'),
        ];
    }
}
