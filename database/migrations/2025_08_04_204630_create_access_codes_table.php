<?php
// File: database/migrations/2024_01_01_000004_create_access_codes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->text('additional_info')->nullable(); // JSON for extra fields like recovery email, phone, etc.
            $table->enum('status', ['available', 'sold', 'reserved'])->default('available');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('sold_at')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_codes');
    }
};
