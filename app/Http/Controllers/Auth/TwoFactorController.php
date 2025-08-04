<?php
// File: app/Http/Controllers/Auth/TwoFactorController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    /**
     * Show the two factor authentication challenge form.
     */
    public function create(): Response | RedirectResponse
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if (!$user->two_factor_enabled) {
            return redirect()->intended('/dashboard');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Handle the two factor authentication challenge.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = Auth::user();

        if (!$user || !$user->two_factor_enabled) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication is not enabled for this account.'],
            ]);
        }

        $google2fa = new Google2FA();
        $secret = decrypt($user->two_factor_secret);

        // Verify the provided code
        $valid = $google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            // Check if it's a recovery code
            $recoveryCodes = $user->two_factor_recovery_codes ? decrypt($user->two_factor_recovery_codes) : [];

            if (in_array($request->code, $recoveryCodes)) {
                // Remove used recovery code
                $recoveryCodes = array_diff($recoveryCodes, [$request->code]);
                $user->update([
                    'two_factor_recovery_codes' => encrypt($recoveryCodes),
                ]);

                $valid = true;

                // Log recovery code usage
                activity()
                    ->causedBy($user)
                    ->log('Two-factor recovery code used');
            }
        }

        if (!$valid) {
            throw ValidationException::withMessages([
                'code' => ['The provided two-factor authentication code was invalid.'],
            ]);
        }

        // Mark 2FA as verified for this session
        $request->session()->put('2fa_verified', true);

        // Log successful 2FA
        activity()
            ->causedBy($user)
            ->log('Two-factor authentication verified');

        // Redirect based on user role
        if ($user->hasRole('admin')) {
            return redirect()->intended('/admin');
        }

        if ($user->hasRole('support')) {
            return redirect()->intended('/admin/support');
        }

        return redirect()->intended('/dashboard');
    }
}
