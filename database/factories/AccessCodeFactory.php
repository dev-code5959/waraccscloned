<?php
// File: database/factories/AccessCodeFactory.php

namespace Database\Factories;

use App\Models\AccessCode;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccessCodeFactory extends Factory
{
    protected $model = AccessCode::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::inRandomOrder()->first()?->id ?? 1,
            'email' => $this->faker->unique()->safeEmail(),
            'password' => $this->faker->password(8, 16),
            'additional_info' => $this->generateAdditionalInfo(),
            'status' => 'available',
        ];
    }

    private function generateAdditionalInfo(): array
    {
        $info = [];

        // Randomly add additional fields
        if ($this->faker->boolean(70)) {
            $info['recovery_email'] = $this->faker->safeEmail();
        }

        if ($this->faker->boolean(50)) {
            $info['phone_number'] = $this->faker->phoneNumber();
        }

        if ($this->faker->boolean(40)) {
            $info['backup_codes'] = [
                $this->faker->numerify('########'),
                $this->faker->numerify('########'),
                $this->faker->numerify('########'),
            ];
        }

        if ($this->faker->boolean(30)) {
            $info['security_question'] = $this->faker->sentence();
            $info['security_answer'] = $this->faker->word();
        }

        if ($this->faker->boolean(60)) {
            $info['creation_date'] = $this->faker->dateTimeBetween('-2 years', '-1 month')->format('Y-m-d');
        }

        if ($this->faker->boolean(25)) {
            $info['subscription_end'] = $this->faker->dateTimeBetween('+1 month', '+1 year')->format('Y-m-d');
        }

        return $info;
    }

    public function sold(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'sold',
                'sold_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            ];
        });
    }

    public function reserved(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'reserved',
            ];
        });
    }

    public function forProduct(Product $product): Factory
    {
        return $this->state(function (array $attributes) use ($product) {
            return [
                'product_id' => $product->id,
            ];
        });
    }
}
