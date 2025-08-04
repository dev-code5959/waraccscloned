<?php
// File: app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'balance' => $request->user()->balance,
                    'formatted_balance' => $request->user()->formatted_balance,
                    'referral_code' => $request->user()->referral_code,
                    'referral_earnings' => $request->user()->referral_earnings,
                    'two_factor_enabled' => $request->user()->two_factor_enabled,
                    'kyc_verified' => $request->user()->kyc_verified,
                    'is_active' => $request->user()->is_active,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
                'status' => fn() => $request->session()->get('status'),
            ],
            'config' => [
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'currency' => config('app.currency', 'USD'),
                'features' => [
                    'referral_system' => config('app.enable_referral_system', true),
                    'two_factor' => config('app.enable_two_factor', true),
                    'kyc_verification' => config('app.enable_kyc_verification', false),
                    'crypto_payments' => config('app.enable_crypto_payments', true),
                    'promo_codes' => config('app.enable_promo_codes', true),
                ],
            ],
            'csrf_token' => csrf_token(),
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy())->toArray(), [
                    'location' => $request->url(),
                ]);
            },
        ]);
    }
}
