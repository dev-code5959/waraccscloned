<?php
// File: app/Providers/AppServiceProvider.php

namespace App\Providers;

use App\Models\Category;
use App\Listeners\SendLoginNotification;
use App\Listeners\SendWelcomeNotification;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
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
            'navigationCategories' => $this->getNavigationCategories(),
        ]);

        // Force HTTPS in production
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Register notification listeners
        Event::listen(Registered::class, SendWelcomeNotification::class);
        Event::listen(Login::class, SendLoginNotification::class);
    }

    /**
     * Get categories for navigation
     */
    private function getNavigationCategories()
    {
        return cache()->remember('navigation_categories', 60 * 15, function () {
            return Category::with(['children' => function ($query) {
                $query->active()->ordered();
            }])
                ->rootCategories()
                ->active()
                ->ordered()
                ->limit(4) // Limit for navigation menu
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'products_count' => $category->getTotalProductsCount(),
                        'children' => $category->children->map(function ($child) {
                            return [
                                'id' => $child->id,
                                'name' => $child->name,
                                'slug' => $child->slug,
                                'products_count' => $child->getTotalProductsCount(),
                            ];
                        }),
                    ];
                });
        });
    }
}
