<?php
// File: app/Http/Controllers/Dashboard/ReferralsController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReferralsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get referral statistics
        $stats = [
            'total_referrals' => $user->referrals()->count(),
            'active_referrals' => $user->referrals()->whereHas('orders', function ($query) {
                $query->completed();
            })->count(),
            'total_earnings' => $user->transactions()->where('type', 'referral_commission')->completed()->sum('amount'),
            'pending_earnings' => $user->transactions()->where('type', 'referral_commission')->pending()->sum('amount'),
        ];

        // Get referral history
        $referrals = $user->referrals()
            ->withCount([
                'orders' => function ($query) {
                    $query->completed();
                }
            ])
            ->withSum([
                'orders' => function ($query) {
                    $query->completed();
                }
            ], 'total_amount')
            ->latest()
            ->paginate(20)
            ->through(function ($referral) {
                return [
                    'id' => $referral->id,
                    'name' => $referral->name,
                    'email' => $referral->email,
                    'orders_count' => $referral->orders_count,
                    'total_spent' => $referral->orders_sum_total_amount ?? 0,
                    'formatted_total_spent' => '$' . number_format($referral->orders_sum_total_amount ?? 0, 2),
                    'created_at' => $referral->created_at,
                    'created_at_human' => $referral->created_at->diffForHumans(),
                ];
            });

        // Get recent commission transactions
        $recentCommissions = $user->transactions()
            ->where('type', 'referral_commission')
            ->with('order.user', 'order.product')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'amount' => $transaction->amount,
                    'formatted_amount' => $transaction->formatted_amount,
                    'status' => $transaction->status,
                    'status_badge_class' => $transaction->status_badge_class,
                    'referred_user' => $transaction->order?->user->name,
                    'product_name' => $transaction->order?->product->name,
                    'order_number' => $transaction->order?->order_number,
                    'created_at' => $transaction->created_at,
                    'created_at_human' => $transaction->created_at->diffForHumans(),
                ];
            });

        // Referral program settings
        $programSettings = [
            'commission_rate' => config('referral.commission_rate', 10), // 10%
            'minimum_payout' => config('referral.minimum_payout', 50), // $50
            'cookie_duration' => config('referral.cookie_duration', 30), // 30 days
        ];

        return Inertia::render('Dashboard/Referrals/Index', [
            'user' => [
                'referral_code' => $user->referral_code,
                'referral_url' => route('homepage', ['ref' => $user->referral_code]),
            ],
            'stats' => $stats,
            'referrals' => $referrals,
            'recent_commissions' => $recentCommissions,
            'program_settings' => $programSettings,
        ]);
    }

    public function generateCode()
    {
        $user = Auth::user();

        if ($user->referral_code) {
            return back()->withErrors(['referral' => 'You already have a referral code.']);
        }

        // Generate unique referral code
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        $user->update(['referral_code' => $code]);

        return back()->with('success', 'Referral code generated successfully.');
    }

    public function regenerateCode(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = Auth::user();

        // Generate unique referral code
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        $user->update(['referral_code' => $code]);

        return back()->with('success', 'Referral code regenerated successfully.');
    }

    public function requestPayout(Request $request)
    {
        $user = Auth::user();

        $availableBalance = $user->transactions()
            ->where('type', 'referral_commission')
            ->completed()
            ->sum('amount');

        $minimumPayout = config('referral.minimum_payout', 50);

        if ($availableBalance < $minimumPayout) {
            return back()->withErrors([
                'payout' => "Minimum payout amount is $" . number_format($minimumPayout, 2) . ". Your available balance is $" . number_format($availableBalance, 2) . "."
            ]);
        }

        // Create payout request transaction
        Transaction::create([
            'user_id' => $user->id,
            'transaction_id' => 'PAYOUT_' . strtoupper(Str::random(10)),
            'type' => 'payout_request',
            'amount' => -$availableBalance,
            'currency' => 'USD',
            'status' => 'pending',
            'payment_method' => 'manual',
            'description' => 'Referral commission payout request',
        ]);

        return back()->with('success', 'Payout request submitted successfully. Our team will process it within 3-5 business days.');
    }
}
