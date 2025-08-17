<?php
// File: app/Http/Controllers/Dashboard/FundsController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\NowPaymentsService;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FundsController extends Controller
{
    private $nowPayments;

    public function __construct(NowPaymentsService $nowPayments)
    {
        $this->nowPayments = $nowPayments;
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        // Get recent deposits
        $recentDeposits = $user->transactions()
            ->where('type', 'deposit')
            ->with('user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id,
                    'amount' => $transaction->amount,
                    'net_amount' => $transaction->net_amount,
                    'formatted_amount' => $transaction->formatted_amount,
                    'currency' => $transaction->currency,
                    'payment_currency' => $transaction->payment_currency,
                    'payment_amount' => $transaction->payment_amount,
                    'status' => $transaction->status,
                    'status_badge_class' => $transaction->status_badge_class,
                    'payment_method' => $transaction->payment_method,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at,
                    'created_at_human' => $transaction->created_at->diffForHumans(),
                ];
            });

        // Check for success/cancel messages
        $message = null;
        if ($request->get('success')) {
            $message = ['type' => 'success', 'text' => 'Payment initiated successfully! Please complete the payment to add funds to your account.'];
        } elseif ($request->get('cancelled')) {
            $message = ['type' => 'error', 'text' => 'Payment was cancelled.'];
        }

        return Inertia::render('Dashboard/Funds/Index', [
            'user' => [
                'balance' => $user->balance,
                'formatted_balance' => $user->formatted_balance,
            ],
            'recent_deposits' => $recentDeposits,
            'minimum_amount' => config('nowpayments.minimum_amount'),
            'maximum_amount' => config('nowpayments.maximum_amount'),
            'message' => $message,
        ]);
    }

    public function create(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:' . config('nowpayments.minimum_amount') . '|max:' . config('nowpayments.maximum_amount'),
        ]);

        $user = Auth::user();
        $amount = $request->amount;

        // Generate unique order ID
        $orderId = 'FUND_' . strtoupper(Str::random(10)) . '_' . $user->id;

        try {
            // Create invoice with NowPayments hosted checkout (let user choose currency on hosted page)
            $invoice = $this->nowPayments->createPaymentWithoutCurrency($amount, $orderId, $user);

            if (!$invoice) {
                return back()->withErrors(['payment' => 'Failed to create payment. Please try again.']);
            }

            // Redirect to hosted checkout URL
            return Inertia::location($invoice['invoice_url']);
        } catch (\Exception $e) {
            Log::error('Funds: Exception creating payment', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'amount' => $amount
            ]);

            return back()->withErrors(['payment' => 'An error occurred while processing your request. Please try again.']);
        }
    }

    public function nowpaymentsWebhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('x-nowpayments-sig');

        // Verify signature
        if (!$this->nowPayments->verifyIpnCallback($payload, $signature)) {
            Log::warning('NowPayments: Invalid IPN signature');
            return response('Invalid signature', 400);
        }

        $data = json_decode($payload, true);

        if (!$data) {
            Log::warning('NowPayments: Invalid IPN payload');
            return response('Invalid payload', 400);
        }

        // Process the callback
        $processed = $this->nowPayments->processIpnCallback($data);

        if ($processed) {
            Log::info('NowPayments: IPN processed successfully', ['payment_id' => $data['payment_id']]);
            return response('OK', 200);
        }

        Log::error('NowPayments: Failed to process IPN', ['data' => $data]);
        return response('Processing failed', 500);
    }

    public function checkPaymentStatus(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|string',
        ]);

        $paymentId = $request->payment_id;

        try {
            $status = $this->nowPayments->getPaymentStatus($paymentId);

            if (!$status) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            return response()->json($status);
        } catch (\Exception $e) {
            Log::error('Funds: Exception checking payment status', [
                'error' => $e->getMessage(),
                'payment_id' => $paymentId
            ]);

            return response()->json(['error' => 'Failed to check payment status'], 500);
        }
    }
}
