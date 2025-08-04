<?php
// File: app/Providers/AppServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Vite configuration
        Vite::prefetch(concurrency: 3);

        // Inertia configuration
        Inertia::share([
            'errors' => function () {
                return session()->get('errors')
                    ? session()->get('errors')->getBag('default')->getMessages()
                    : (object) [];
            },
        ]);

        // Force HTTPS in production
        if (app()->environment('production')) {
            \URL::forceScheme('https');
        }
    }
}
