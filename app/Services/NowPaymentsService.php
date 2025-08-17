<?php
// File: app/Services/NowPaymentsService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use App\Models\User;

class NowPaymentsService
{
    private $apiKey;
    private $baseUrl;
    private $ipnSecret;

    public function __construct()
    {
        $this->apiKey = config('nowpayments.sandbox')
            ? config('nowpayments.sandbox_api_key')
            : config('nowpayments.api_key');
        $this->baseUrl = config('nowpayments.base_url');
        $this->ipnSecret = config('nowpayments.ipn_secret');
    }

    /**
     * Get available currencies
     */
    public function getAvailableCurrencies()
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/currencies");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('NowPayments: Failed to get currencies', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('NowPayments: Exception getting currencies', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get minimum payment amount for a currency
     */
    public function getMinimumAmount($currency)
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/min-amount", [
                'currency_from' => 'usd',
                'currency_to' => strtolower($currency)
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['min_amount' => 10]; // Default minimum
        } catch (\Exception $e) {
            Log::error('NowPayments: Exception getting minimum amount', [
                'error' => $e->getMessage()
            ]);
            return ['min_amount' => 10];
        }
    }

    /**
     * Create a payment using hosted checkout with specific currency (legacy method)
     */
    public function createPayment($amount, $currency, $orderId, $user)
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/invoice", [
                'price_amount' => $amount,
                'price_currency' => 'usd',
                'pay_currency' => strtolower($currency),
                'ipn_callback_url' => config('nowpayments.callback_url'),
                'order_id' => $orderId,
                'order_description' => "Add funds to account - {$user->email}",
                'success_url' => route('dashboard.funds.index') . '?success=1',
                'cancel_url' => route('dashboard.funds.index') . '?cancelled=1',
            ]);

            if ($response->successful()) {
                $invoice = $response->json();

                // Create transaction record
                Transaction::create([
                    'user_id' => $user->id,
                    'transaction_id' => $invoice['id'] ?? $orderId,
                    'type' => 'deposit',
                    'amount' => $amount,
                    'net_amount' => $amount,
                    'currency' => 'USD',
                    'status' => 'pending',
                    'payment_method' => 'crypto',
                    'payment_currency' => strtoupper($currency),
                    'external_transaction_id' => $invoice['id'] ?? null,
                    'metadata' => json_encode($invoice),
                    'description' => "Crypto deposit via {$currency}",
                ]);

                return $invoice;
            }

            Log::error('NowPayments: Failed to create invoice', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('NowPayments: Exception creating invoice', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create a payment using hosted checkout without specifying currency (user chooses on hosted page)
     */
    public function createPaymentWithoutCurrency($amount, $orderId, $user)
    {
        try {
            $invoiceData = [
                'price_amount' => $amount,
                'price_currency' => 'usd',
                // No pay_currency specified - user will choose on hosted page
                'ipn_callback_url' => config('nowpayments.callback_url'),
                'order_id' => $orderId,
                'order_description' => "Add funds to account - {$user->email}",
                'success_url' => route('dashboard.funds.index') . '?success=1',
                'cancel_url' => route('dashboard.funds.index') . '?cancelled=1',
            ];

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/invoice", $invoiceData);

            if ($response->successful()) {
                $invoice = $response->json();

                // Create transaction record
                Transaction::create([
                    'user_id' => $user->id,
                    'transaction_id' => $invoice['id'] ?? $orderId,
                    'type' => 'deposit',
                    'amount' => $amount,
                    'net_amount' => $amount,
                    'currency' => 'USD',
                    'status' => 'pending',
                    'payment_method' => 'crypto',
                    'payment_currency' => null, // Will be updated from webhook
                    'external_transaction_id' => $invoice['id'] ?? null,
                    'metadata' => json_encode(array_merge($invoice, ['order_id' => $orderId])),
                    'description' => "Crypto deposit - currency TBD",
                ]);

                return $invoice;
            }

            Log::error('NowPayments: Failed to create invoice', [
                'status' => $response->status(),
                'response' => $response->body(),
                'data' => $invoiceData
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('NowPayments: Exception creating invoice', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus($paymentId)
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/payment/{$paymentId}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('NowPayments: Exception getting payment status', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Verify IPN callback
     */
    public function verifyIpnCallback($payload, $signature)
    {
        $computedSignature = hash_hmac('sha512', $payload, $this->ipnSecret);
        return hash_equals($computedSignature, $signature);
    }

    /**
     * Process IPN callback for invoice payments
     */
    public function processIpnCallback($data)
    {
        try {
            // For invoice API, the payment ID might be in different fields
            $paymentId = $data['payment_id'] ?? $data['id'] ?? null;
            $status = $data['payment_status'] ?? $data['status'] ?? null;
            $orderId = $data['order_id'] ?? null;

            if (!$paymentId || !$status) {
                Log::warning('NowPayments: Missing payment ID or status in callback', $data);
                return false;
            }

            // Try to find transaction by external_transaction_id or transaction_id
            $transaction = Transaction::where('external_transaction_id', $paymentId)
                ->orWhere('transaction_id', $paymentId)
                ->first();

            if (!$transaction && $orderId) {
                // For invoice payments, try to find by order_id in metadata
                $transaction = Transaction::where('metadata->order_id', $orderId)
                    ->where('type', 'deposit')
                    ->where('status', 'pending')
                    ->first();
            }

            if (!$transaction) {
                Log::warning('NowPayments: Transaction not found for payment', [
                    'payment_id' => $paymentId,
                    'order_id' => $orderId
                ]);
                return false;
            }

            // Get payment amounts from callback data
            $priceAmount = $data['price_amount'] ?? $data['amount'] ?? null;
            $priceCurrency = $data['price_currency'] ?? 'USD';
            $payAmount = $data['pay_amount'] ?? null;
            $payCurrency = $data['pay_currency'] ?? $data['currency'] ?? null;

            // Update transaction with payment details
            $updateData = [
                'status' => $this->mapPaymentStatus($status),
                'external_transaction_id' => $paymentId, // Ensure this is set
                'metadata' => json_encode(array_merge(
                    json_decode($transaction->metadata, true) ?? [],
                    $data
                )),
                'completed_at' => in_array($status, ['finished', 'confirmed', 'completed']) ? now() : null,
            ];

            // Update payment currency and amount if available
            if ($payCurrency) {
                $updateData['payment_currency'] = strtoupper($payCurrency);
                $updateData['description'] = "Crypto deposit via {$payCurrency}";
            }

            if ($payAmount) {
                $updateData['payment_amount'] = $payAmount;
            }

            // Verify the amount matches what we expected
            if ($priceAmount && abs($transaction->amount - $priceAmount) > 0.01) {
                Log::warning('NowPayments: Amount mismatch in callback', [
                    'expected' => $transaction->amount,
                    'received' => $priceAmount,
                    'payment_id' => $paymentId
                ]);
            }

            $transaction->update($updateData);

            // If payment is successful, add funds to user balance
            if (in_array($status, ['finished', 'confirmed', 'completed'])) {
                $user = $transaction->user;
                $amountToAdd = $transaction->amount;

                // Only add funds if they haven't been added already
                if ($transaction->wasChanged('status') && $amountToAdd > 0) {
                    $user->increment('balance', $amountToAdd);

                    Log::info('NowPayments: Funds added to user account via invoice', [
                        'user_id' => $user->id,
                        'amount' => $amountToAdd,
                        'payment_id' => $paymentId,
                        'currency' => $payCurrency ?? 'unknown'
                    ]);
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('NowPayments: Exception processing invoice IPN', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            return false;
        }
    }

    /**
     * Map NowPayments status to our transaction status
     */
    private function mapPaymentStatus($status)
    {
        $statusMap = [
            'waiting' => 'pending',
            'confirming' => 'processing',
            'confirmed' => 'completed',
            'finished' => 'completed',
            'completed' => 'completed', // Added for invoice API
            'partially_paid' => 'pending',
            'failed' => 'failed',
            'refunded' => 'refunded',
            'expired' => 'expired',
            'cancelled' => 'cancelled', // Added for invoice API
        ];

        return $statusMap[$status] ?? 'pending';
    }
}
