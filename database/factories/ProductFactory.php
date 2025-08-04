<?php
// File: database/factories/ProductFactory.php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = $this->faker->randomElement([
            'Premium Gmail Account',
            'Verified Facebook Profile',
            'Netflix Premium Subscription',
            'Steam Gaming Account',
            'Microsoft Office License',
            'NordVPN Premium Account',
            'Spotify Premium Subscription',
            'Disney+ Family Plan',
            'Adobe Creative Suite',
            'ProtonMail Secure Account',
            'LinkedIn Professional Account',
            'Amazon Prime Membership',
            'Google Drive Storage',
            'Instagram Verified Account',
            'Minecraft Premium Account',
        ]) . ' - ' . $this->faker->randomElement(['Tier 1', 'Tier 2', 'Premium', 'Standard', 'Pro']);

        $price = $this->faker->randomFloat(2, 5, 500);
        $stockQuantity = $this->faker->numberBetween(0, 100);

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(6),
            'description' => $this->faker->paragraph(3),
            'features' => implode("\n", [
                $this->faker->sentence(),
                $this->faker->sentence(),
                $this->faker->sentence(),
                $this->faker->sentence(),
            ]),
            'price' => $price,
            'stock_quantity' => $stockQuantity,
            'sold_count' => $this->faker->numberBetween(0, 500),
            'category_id' => Category::whereNotNull('parent_id')->inRandomOrder()->first()?->id ?? 1,
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'is_active' => $this->faker->boolean(95), // 95% chance of being active
            'min_purchase' => 1,
            'max_purchase' => $this->faker->randomElement([null, 5, 10, 20]),
            'delivery_info' => $this->faker->randomElement([
                'Instant delivery after payment confirmation',
                'Delivered within 5 minutes of purchase',
                'Manual delivery within 1 hour',
                'Automated delivery - no delays',
                'Premium support included with purchase',
            ]),
        ];
    }

    public function featured(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_featured' => true,
            ];
        });
    }

    public function outOfStock(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'stock_quantity' => 0,
            ];
        });
    }

    public function popular(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'sold_count' => $this->faker->numberBetween(100, 1000),
            ];
        });
    }
}
