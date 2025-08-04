<?php
// File: app/Http/Controllers/Auth/AuthenticatedSessionController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        // Log the login activity
        activity()
            ->causedBy($user)
            ->log('User logged in');

        // Check if user has 2FA enabled and redirect accordingly
        if ($user->two_factor_enabled && !$request->session()->get('2fa_verified')) {
            return redirect()->route('two-factor.login');
        }

        // Redirect based on user role
        if ($user->hasRole('admin')) {
            return redirect()->intended('/admin');
        }

        if ($user->hasRole('support')) {
            return redirect()->intended('/admin/support');
        }

        return redirect()->intended('/dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        // Log the logout activity
        if ($user) {
            activity()
                ->causedBy($user)
                ->log('User logged out');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
