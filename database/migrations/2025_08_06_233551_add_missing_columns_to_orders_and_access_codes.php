<?php
// Create a new migration file:
// php artisan make:migration add_missing_columns_to_orders_and_access_codes

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add missing columns to orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('paid_at')->nullable()->after('completed_at');
            $table->timestamp('cancelled_at')->nullable()->after('paid_at');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
        });

        // Add missing columns to access_codes table
        Schema::table('access_codes', function (Blueprint $table) {
            $table->string('username')->nullable()->after('email');
            $table->timestamp('reserved_at')->nullable()->after('sold_at');
            $table->timestamp('delivered_at')->nullable()->after('reserved_at');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['paid_at', 'cancelled_at', 'cancellation_reason']);
        });

        Schema::table('access_codes', function (Blueprint $table) {
            $table->dropColumn(['username', 'reserved_at', 'delivered_at']);
        });
    }
};
