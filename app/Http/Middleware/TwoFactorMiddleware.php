<?php
// File: app/Http/Middleware/TwoFactorMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // If user doesn't have 2FA enabled, continue
        if (!$user || !$user->two_factor_enabled) {
            return $next($request);
        }

        // If 2FA is already verified for this session, continue
        if ($request->session()->get('2fa_verified')) {
            return $next($request);
        }

        // If this is the 2FA challenge route, continue
        if ($request->routeIs('two-factor.*')) {
            return $next($request);
        }

        // Redirect to 2FA challenge
        return redirect()->route('two-factor.login');
    }
}

// File: app/Http/Middleware/EnsureUserIsActive.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && !$user->is_active) {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Your account has been suspended. Please contact support for assistance.',
            ]);
        }

        return $next($request);
    }
}

// File: app/Http/Middleware/RedirectIfAuthenticated.php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                // Redirect based on user role
                if ($user->hasRole('admin')) {
                    return redirect('/admin');
                }

                if ($user->hasRole('support')) {
                    return redirect('/admin/support');
                }

                return redirect('/dashboard');
            }
        }

        return $next($request);
    }
}
