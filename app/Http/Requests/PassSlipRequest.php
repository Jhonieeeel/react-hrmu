<?php

namespace App\Http\Requests;

use App\Models\PassSlip;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the pass slip filing form.
 *
 * Written as a FormRequest rather than relying on the DTO's static rules alone
 * so the slip-specific checks (arrival after departure, an approver who is not
 * the filer) live next to the authorisation that decides *who* may file.
 */
class PassSlipRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Filing is baseline, so this only needs to confirm the caller is
        // allowed to file at all. Whether they may file for someone else is
        // decided downstream in CreatePassSlipAction::resolveOwner().
        return $this->user()?->can('create', PassSlip::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'request_type' => ['required', Rule::in(PassSlip::REQUEST_TYPES)],
            'date_requested' => ['nullable', 'date'],
            'expected_departure' => ['required', 'date'],
            // Nullable because personnel file slips to leave early, with no
            // planned return. When supplied it must still fall after departure —
            // `after:` skips null values, so an early-out slip passes cleanly.
            'expected_arrival' => ['nullable', 'date', 'after:expected_departure'],
            'destination' => ['required', 'string', 'max:255'],
            'purpose' => ['required', 'string', 'max:2000'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'recommended_by' => ['nullable', 'integer', 'exists:users,id'],
            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
                // "Approved by the person who filed it" is not an approval.
                // Only applied when a filer was actually named — otherwise
                // notIn([null]) would reject the field outright.
                Rule::notIn(array_filter([$this->input('user_id')], fn ($id) => $id !== null)),
            ],
            'date_accomplished' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'expected_departure.required' => 'Enter the expected time of departure.',
            'expected_arrival.after' => 'The expected arrival must be after the expected departure.',
            'assigned_to.not_in' => 'A pass slip cannot be approved by the same person who filed it.',
        ];
    }

    /**
     * Normalises the submitted data into what CreatePassSlipAction expects.
     *
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        return [
            'request_type' => $this->string('request_type')->toString(),
            'date_requested' => $this->date('date_requested'),
            'expected_departure' => $this->date('expected_departure'),
            'expected_arrival' => $this->date('expected_arrival'),
            'destination' => $this->string('destination')->toString(),
            'purpose' => $this->string('purpose')->toString(),
            'user_id' => $this->integer('user_id') ?: null,
            'recommended_by' => $this->integer('recommended_by') ?: null,
            'assigned_to' => $this->integer('assigned_to') ?: null,
            'date_accomplished' => $this->date('date_accomplished'),
        ];
    }
}
