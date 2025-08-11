<?php
// File: app/Http/Controllers/Dashboard/ProfileController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();

        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'balance' => $user->balance,
            'formatted_balance' => $user->formatted_balance,
            'two_factor_enabled' => $user->two_factor_secret !== null,
            'created_at' => $user->created_at,
            'created_at_formatted' => $user->created_at->format('M j, Y'),
        ];

        // Get account statistics
        $stats = [
            'total_orders' => $user->orders()->count(),
            'completed_orders' => $user->orders()->completed()->count(),
            'total_spent' => abs($user->transactions()->purchases()->completed()->sum('amount')),
            'total_deposits' => $user->transactions()->deposits()->completed()->sum('amount'),
            'active_tickets' => $user->supportTickets()->whereIn('status', ['open', 'in_progress'])->count(),
        ];

        // Get recent activity
        $recentActivity = collect();

        // Add recent orders
        $recentOrders = $user->orders()
            ->with('product')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'type' => 'order',
                    'title' => 'Order placed',
                    'description' => $order->product->name . ' - ' . $order->order_number,
                    'created_at' => $order->created_at,
                    'created_at_human' => $order->created_at->diffForHumans(),
                ];
            });

        // Add recent transactions
        $recentTransactions = $user->transactions()
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'type' => 'transaction',
                    'title' => ucfirst($transaction->type),
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at,
                    'created_at_human' => $transaction->created_at->diffForHumans(),
                ];
            });

        $recentActivity = $recentActivity
            ->merge($recentOrders)
            ->merge($recentTransactions)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('Dashboard/Profile/Edit', [
            'user' => $profileData,
            'stats' => $stats,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function enableTwoFactor(Request $request)
    {
        $user = Auth::user();

        if ($user->two_factor_secret) {
            return back()->withErrors(['2fa' => 'Two-factor authentication is already enabled.']);
        }

        $google2fa = app('pragmarx.google2fa');
        $secret = $google2fa->generateSecretKey();

        // Generate QR code
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        return Inertia::render('Dashboard/Profile/TwoFactor', [
            'secret' => $secret,
            'qr_code' => $qrCodeSvg,
        ]);
    }

    public function confirmTwoFactor(Request $request)
    {
        $request->validate([
            'secret' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $google2fa = app('pragmarx.google2fa');

        $valid = $google2fa->verifyKey($request->secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid verification code.']);
        }

        $user->update([
            'two_factor_secret' => encrypt($request->secret),
        ]);

        return redirect()->route('dashboard.profile.edit')
            ->with('success', 'Two-factor authentication enabled successfully.');
    }

    public function disableTwoFactor(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = Auth::user();

        if (!$user->two_factor_secret) {
            return back()->withErrors(['2fa' => 'Two-factor authentication is not enabled.']);
        }

        $user->update([
            'two_factor_secret' => null,
        ]);

        return back()->with('success', 'Two-factor authentication disabled successfully.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = Auth::user();

        // Check if user has pending orders or open tickets
        $pendingOrders = $user->orders()->whereIn('status', ['pending', 'processing'])->count();
        $openTickets = $user->supportTickets()->whereIn('status', ['open', 'in_progress'])->count();

        if ($pendingOrders > 0) {
            return back()->withErrors(['account' => 'Cannot delete account with pending orders. Please wait for orders to complete or contact support.']);
        }

        if ($openTickets > 0) {
            return back()->withErrors(['account' => 'Cannot delete account with open support tickets. Please close all tickets first.']);
        }

        if ($user->balance > 0) {
            return back()->withErrors(['account' => 'Cannot delete account with remaining balance. Please contact support to withdraw funds.']);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Account deleted successfully.');
    }
}
