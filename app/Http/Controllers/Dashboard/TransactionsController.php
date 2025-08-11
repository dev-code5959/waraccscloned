<?php
// File: app/Http/Controllers/Dashboard/TransactionsController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = $user->transactions()->latest();

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by transaction ID or description
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('transaction_id', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $transactions = $query->paginate(20)->through(function ($transaction) {
            return [
                'id' => $transaction->id,
                'transaction_id' => $transaction->transaction_id,
                'type' => $transaction->type,
                'type_display' => $transaction->type_display,
                'type_badge_class' => $transaction->type_badge_class,
                'amount' => $transaction->amount,
                'formatted_amount' => $transaction->formatted_amount,
                'currency' => $transaction->currency,
                'payment_currency' => $transaction->payment_currency,
                'payment_amount' => $transaction->payment_amount,
                'status' => $transaction->status,
                'status_display' => $transaction->status_display,
                'status_badge_class' => $transaction->status_badge_class,
                'payment_method' => $transaction->payment_method,
                'description' => $transaction->description,
                'created_at' => $transaction->created_at,
                'created_at_human' => $transaction->created_at->diffForHumans(),
                'created_at_formatted' => $transaction->created_at->format('M j, Y \a\t g:i A'),
            ];
        });

        // Get summary stats
        $stats = [
            'total_deposits' => $user->transactions()->deposits()->completed()->sum('amount'),
            'total_purchases' => abs($user->transactions()->purchases()->completed()->sum('amount')),
            'total_transactions' => $user->transactions()->count(),
            'pending_transactions' => $user->transactions()->pending()->count(),
        ];

        // Get filter options
        $filterOptions = [
            'types' => [
                'deposit' => 'Deposits',
                'purchase' => 'Purchases',
                'refund' => 'Refunds',
                'adjustment' => 'Adjustments',
            ],
            'statuses' => [
                'pending' => 'Pending',
                'processing' => 'Processing',
                'completed' => 'Completed',
                'failed' => 'Failed',
                'cancelled' => 'Cancelled',
                'refunded' => 'Refunded',
            ],
        ];

        return Inertia::render('Dashboard/Transactions/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['type', 'status', 'date_from', 'date_to', 'search']),
            'filter_options' => $filterOptions,
        ]);
    }

    public function show(Transaction $transaction)
    {
        // Ensure user can only view their own transactions
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $transactionData = [
            'id' => $transaction->id,
            'transaction_id' => $transaction->transaction_id,
            'type' => $transaction->type,
            'type_display' => $transaction->type_display,
            'type_badge_class' => $transaction->type_badge_class,
            'amount' => $transaction->amount,
            'formatted_amount' => $transaction->formatted_amount,
            'currency' => $transaction->currency,
            'payment_currency' => $transaction->payment_currency,
            'payment_amount' => $transaction->payment_amount,
            'payment_address' => $transaction->payment_address,
            'status' => $transaction->status,
            'status_display' => $transaction->status_display,
            'status_badge_class' => $transaction->status_badge_class,
            'payment_method' => $transaction->payment_method,
            'gateway_transaction_id' => $transaction->gateway_transaction_id,
            'description' => $transaction->description,
            'metadata' => $transaction->metadata ? json_decode($transaction->metadata, true) : null,
            'created_at' => $transaction->created_at,
            'created_at_human' => $transaction->created_at->diffForHumans(),
            'created_at_formatted' => $transaction->created_at->format('M j, Y \a\t g:i A'),
            'completed_at' => $transaction->completed_at,
            'completed_at_formatted' => $transaction->completed_at?->format('M j, Y \a\t g:i A'),
        ];

        // Get related order if it's a purchase
        $relatedOrder = null;
        if ($transaction->type === 'purchase' && $transaction->order_id) {
            $order = $transaction->order;
            if ($order) {
                $relatedOrder = [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'product_name' => $order->product->name,
                    'quantity' => $order->quantity,
                    'formatted_total' => $order->formatted_total,
                    'status' => $order->status,
                ];
            }
        }

        return Inertia::render('Dashboard/Transactions/Show', [
            'transaction' => $transactionData,
            'related_order' => $relatedOrder,
        ]);
    }
}
