<?php

namespace App\Data;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;

class UserDTO extends Data
{
    public function __construct(
        public ?int $id,
        public string $name,
        public string $email,
        public ?string $password,
        public string $employee_type,
        public ?string $starts_at,
        public ?string $ends_at,
    ) {}

    public static function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')
                    ->ignore(request()->route('user')),
            ],

            'password' => [
                'sometimes',
                'nullable',
                'confirmed',
                'min:8',
            ],

            'employee_type' => [
                'required',
                Rule::in([
                    'new employee',
                    'old',
                    'transferee',
                ]),
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],
        ];
    }
}
