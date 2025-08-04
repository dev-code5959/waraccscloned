<?php
// File: database/migrations/2024_01_01_000009_create_promo_codes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed_amount']);
            $table->decimal('value', 10, 2); // percentage or fixed amount
            $table->decimal('minimum_order_amount', 10, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('user_usage_limit')->nullable(); // per user limit
            $table->datetime('starts_at');
            $table->datetime('expires_at');
            $table->boolean('is_active')->default(true);
            $table->json('applicable_products')->nullable(); // product IDs
            $table->json('applicable_categories')->nullable(); // category IDs
            $table->timestamps();

            $table->index('code');
            $table->index(['is_active', 'starts_at', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};
