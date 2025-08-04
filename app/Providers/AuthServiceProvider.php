<?php
// File: app/Providers/AuthServiceProvider.php

namespace App\Providers;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\SupportTicket;
use App\Policies\UserPolicy;
use App\Policies\ProductPolicy;
use App\Policies\OrderPolicy;
use App\Policies\SupportTicketPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
        SupportTicket::class => SupportTicketPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define custom gates
        Gate::define('access-admin', function (User $user) {
            return $user->hasRole(['admin', 'support']);
        });

        Gate::define('manage-users', function (User $user) {
            return $user->hasRole('admin');
        });

        Gate::define('manage-products', function (User $user) {
            return $user->hasRole('admin');
        });

        Gate::define('manage-orders', function (User $user) {
            return $user->hasRole(['admin', 'support']);
        });

        Gate::define('manage-support', function (User $user) {
            return $user->hasRole(['admin', 'support']);
        });

        Gate::define('view-reports', function (User $user) {
            return $user->hasRole('admin');
        });

        Gate::define('manage-settings', function (User $user) {
            return $user->hasRole('admin');
        });

        // Customer-specific gates
        Gate::define('purchase-products', function (User $user) {
            return $user->hasRole('customer') && $user->is_active && $user->hasVerifiedEmail();
        });

        Gate::define('create-support-tickets', function (User $user) {
            return $user->is_active;
        });

        Gate::define('view-own-orders', function (User $user, Order $order) {
            return $user->id === $order->user_id;
        });

        Gate::define('view-own-tickets', function (User $user, SupportTicket $ticket) {
            return $user->id === $ticket->user_id || $user->hasRole(['admin', 'support']);
        });

        // Two-factor authentication gate
        Gate::define('bypass-2fa', function (User $user) {
            return !$user->two_factor_enabled || session('2fa_verified');
        });

        // Balance management gates
        Gate::define('add-funds', function (User $user) {
            return $user->hasRole('customer') && $user->is_active;
        });

        Gate::define('use-balance', function (User $user, $amount) {
            return $user->balance >= $amount;
        });

        // Referral system gates
        Gate::define('use-referrals', function (User $user) {
            return config('app.enable_referral_system', true) && $user->hasRole('customer');
        });

        Gate::define('manage-referrals', function (User $user) {
            return $user->referral_code !== null;
        });
    }
}
