<?php

namespace Database\Factories;

use App\Models\PassSlip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PassSlip>
 */
class PassSlipFactory extends Factory
{
    protected $model = PassSlip::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departure = fake()->dateTimeBetween('+1 day', '+2 weeks');

        return [
            'user_id' => User::factory(),
            'date_accomplished' => now()->toDateString(),
            'date_requested' => $departure->format('Y-m-d'),
            'position' => fake()->jobTitle(),
            'printed_name' => fake()->name(),
            'usd' => 'AFMS / Operations / Administrative',
            'destination' => fake()->city(),
            'purpose' => fake()->sentence(),
            'request_type' => 'official',
            'expected_departure' => $departure,
            'expected_arrival' => (clone $departure)->modify('+4 hours'),
            'status' => false,
        ];
    }

    public function personal(): static
    {
        return $this->state(fn () => ['request_type' => 'personal']);
    }

    /**
     * A slip filed to leave early, with no planned return.
     */
    public function earlyOut(): static
    {
        return $this->state(fn () => ['expected_arrival' => null]);
    }

    public function official(): static
    {
        return $this->state(fn () => ['request_type' => 'official']);
    }

    /**
     * A filing nobody has decided yet.
     */
    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => false,
            'reviewed_at' => null,
            'reviewed_by' => null,
        ]);
    }

    public function approved(?int $reviewerId = null, ?string $remarks = null): static
    {
        return $this->state(fn () => [
            'status' => true,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_remarks' => $remarks,
        ]);
    }

    public function declined(?int $reviewerId = null, ?string $remarks = null): static
    {
        return $this->state(fn () => [
            'status' => false,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'review_remarks' => $remarks,
        ]);
    }

    /**
     * A slip whose actual time of arrival HR has recorded.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'actual_arrival' => $attributes['expected_arrival'],
        ]);
    }
}
