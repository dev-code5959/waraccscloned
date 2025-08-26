<?php
// File: app/Http/Controllers/Auth/RegisteredUserController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'referral_code' => 'nullable|string|exists:users,referral_code',
            'terms' => 'required|accepted',
        ]);

        // Find referrer if referral code is provided
        $referrer = null;
        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)
                ->where('is_active', true)
                ->first();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'referred_by' => $referrer?->id,
            'balance' => 0.00,
            'is_active' => true,
        ]);

        // Assign customer role
        $user->assignRole('customer');

        // Generate referral code
        $user->generateReferralCode();

        // Log the registration activity
        activity()
            ->causedBy($user)
            ->log('User registered');

        // If there's a referrer, log referral activity
        if ($referrer) {
            activity()
                ->causedBy($referrer)
                ->performedOn($user)
                ->log('New user registered via referral');
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect('/dashboard')->with('success', 'Welcome to WarAccounts! Your account has been created successfully.');
    }
}
