<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public static function ocdEmployees()
    {
        return  [
            ['name' => 'Ray Francis Alingasa', 'email' => 'rayfrancis@ocd.com'],
            ['name' => 'Jenn Eric Borday', 'email' => 'jenneric@ocd.com'],
            ['name' => 'Ronald Anthony Briol', 'email' => 'ronaldanthony@ocd.com'],
            ['name' => 'Marc Gil Calang', 'email' => 'marcgil@ocd.com'],
            ['name' => 'Rosalie Carpizo', 'email' => 'rosalie@ocd.com'],
            ['name' => 'Lorene Catedral', 'email' => 'lorene@ocd.com'],
            ['name' => 'Carlito Jr. Clarete', 'email' => 'carlitojr@ocd.com'],
            ['name' => 'Kim Durango', 'email' => 'kim@ocd.com'],
            ['name' => 'Jayvee Gustilo', 'email' => 'jayvee@ocd.com'],
            ['name' => 'Aizy Lyn Joloyohoy', 'email' => 'aizylyn@ocd.com'],
            ['name' => 'Ryan Joloyohoy', 'email' => 'ryan@ocd.com'],
            ['name' => 'Diana Lim', 'email' => 'diana@ocd.com'],
            ['name' => 'Dave Madayag', 'email' => 'dave@ocd.com'],
            ['name' => 'Georiss Mae Maniago', 'email' => 'georissmae@ocd.com'],
            ['name' => 'Amado Posas', 'email' => 'amado@ocd.com'],
            ['name' => 'April Rose Anne Sanchez-Elmedulan', 'email' => 'aprilroseanne@ocd.com'],
            ['name' => 'Marie Lynn Tadle', 'email' => 'marielynn@ocd.com'],
            ['name' => 'John Lenn Uayan', 'email' => 'johnlenn@ocd.com'],
            ['name' => 'Grace Villanueva', 'email' => 'grace@ocd.com'],
            ['name' => 'Angelic Mae Yu', 'email' => 'angelicmae@ocd.com'],
        ];
    }
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static {}
}
