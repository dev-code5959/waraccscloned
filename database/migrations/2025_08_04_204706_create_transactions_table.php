<?php
// File: database/migrations/2024_01_01_000006_create_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['deposit', 'purchase', 'refund', 'referral_commission']);
            $table->decimal('amount', 10, 2);
            $table->decimal('fee', 10, 2)->default(0.00);
            $table->decimal('net_amount', 10, 2);
            $table->string('currency', 10)->default('USD');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('gateway')->nullable(); // nowpayments, manual, etc.
            $table->string('gateway_transaction_id')->nullable();
            $table->json('gateway_response')->nullable();
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type', 'status']);
            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
