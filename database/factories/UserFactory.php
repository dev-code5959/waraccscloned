<?php
// File: database/factories/UserFactory.php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // default password
            'balance' => $this->faker->randomFloat(2, 0, 1000),
            'referral_earnings' => $this->faker->randomFloat(2, 0, 100),
            'two_factor_enabled' => $this->faker->boolean(10), // 10% have 2FA enabled
            'kyc_verified' => $this->faker->boolean(30), // 30% are KYC verified
            'is_active' => $this->faker->boolean(95), // 95% are active
            'last_login_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }

    public function inactive(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    public function withTwoFactor(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'two_factor_enabled' => true,
                'two_factor_secret' => encrypt('base32-secret-key'),
                'two_factor_recovery_codes' => encrypt([
                    'recovery-code-1',
                    'recovery-code-2',
                    'recovery-code-3',
                ]),
            ];
        });
    }

    public function kycVerified(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'kyc_verified' => true,
                'kyc_data' => [
                    'document_type' => 'passport',
                    'document_number' => $this->faker->uuid(),
                    'verified_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
                    'verified_by' => 'system',
                ],
            ];
        });
    }

    public function highBalance(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'balance' => $this->faker->randomFloat(2, 1000, 10000),
            ];
        });
    }
}
