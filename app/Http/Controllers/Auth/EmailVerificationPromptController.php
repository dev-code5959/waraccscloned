<?php
// File: app/Http/Controllers/Auth/EmailVerificationPromptController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
            ? redirect()->intended('/dashboard')
            : Inertia::render('Auth/VerifyEmail', [
                'status' => session('status'),
                'user' => [
                    'email' => $request->user()->email,
                ],
            ]);
    }
}

// File: app/Http/Controllers/Auth/VerifyEmailController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended('/dashboard?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            // Log email verification activity
            activity()
                ->causedBy($request->user())
                ->log('Email verified');

            event(new Verified($request->user()));
        }

        return redirect()->intended('/dashboard?verified=1')
            ->with('success', 'Your email has been verified successfully!');
    }
}

// File: app/Http/Controllers/Auth/EmailVerificationNotificationController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended('/dashboard');
        }

        $request->user()->sendEmailVerificationNotification();

        // Log resend verification activity
        activity()
            ->causedBy($request->user())
            ->log('Email verification resent');

        return back()->with('status', 'verification-link-sent');
    }
}
