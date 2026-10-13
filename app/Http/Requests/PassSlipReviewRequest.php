<?php

namespace App\Http\Requests;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates an approve/decline on a pass slip.
 *
 * Two things are deliberately asymmetric: approving may carry no note, but
 * declining requires one. A rejected slip with no reason leaves the personnel
 * unable to tell whether to re-file, ask for a different date, or give up — so
 * the reason is mandatory there and optional on approval, where it is only a
 * courtesy note.
 */
class PassSlipReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        // The row-level decision is authorised in ReviewPassSlipAction, against
        // the re-read row rather than anything carried in from the request. This
        // hook only guards against an unauthenticated caller reaching the
        // controller at all.
        // A permission check rather than a policy call: the ability string is
        // the permission name itself, not a policy method, so there is no model
        // for Laravel to resolve a policy against here. The route middleware
        // enforces the same thing; this is the defence-in-depth second check.
        return $this->user()?->can(Permission::ReviewPassSlips) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'review_remarks' => [
                $this->isDecline() ? 'required' : 'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'review_remarks.required' => 'A reason is required to decline a pass slip.',
        ];
    }

    /**
     * Whether this is the decline endpoint.
     *
     * Read from the route rather than the body so the requirement cannot be
     * dodged by posting to /approve with a decline-shaped payload.
     */
    protected function isDecline(): bool
    {
        return $this->routeIs('slip-reviews.decline');
    }
}
