<?php
// File: app/Http/Controllers/Dashboard/DashboardController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\SupportTicket;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct()
    {

    }

    public function index()
    {
        $user = Auth::user();

        // Get user statistics
        $stats = [
            'total_orders' => $user->orders()->count(),
            'completed_orders' => $user->orders()->completed()->count(),
            'pending_orders' => $user->orders()->pending()->count(),
            'total_spent' => $user->transactions()->purchases()->completed()->sum('amount'),
            'current_balance' => $user->balance,
            'open_tickets' => $user->supportTickets()->where('status', '!=', 'closed')->count(),
            'referral_earnings' => $user->referral_earnings,
            'total_referrals' => $user->referrals()->count(),
        ];

        // Recent orders
        $recentOrders = $user->orders()
            ->with('product')
            ->recent()
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'product_name' => $order->product->name,
                    'quantity' => $order->quantity,
                    'total_amount' => $order->total_amount,
                    'formatted_total' => $order->formatted_total,
                    'status' => $order->status,
                    'status_badge_class' => $order->status_badge_class,
                    'payment_status' => $order->payment_status,
                    'payment_status_badge_class' => $order->payment_status_badge_class,
                    'created_at' => $order->created_at,
                    'created_at_human' => $order->created_at->diffForHumans(),
                ];
            });

        // Recent transactions
        $recentTransactions = $user->transactions()
            ->recent()
            ->limit(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id,
                    'type' => $transaction->type,
                    'type_display' => $transaction->type_display,
                    'type_badge_class' => $transaction->type_badge_class,
                    'amount' => $transaction->amount,
                    'formatted_amount' => $transaction->formatted_amount,
                    'status' => $transaction->status,
                    'status_badge_class' => $transaction->status_badge_class,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at,
                    'created_at_human' => $transaction->created_at->diffForHumans(),
                ];
            });

        // Open support tickets
        $openTickets = $user->supportTickets()
            ->where('status', '!=', 'closed')
            ->with('latestMessage')
            ->recent()
            ->limit(3)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'subject' => $ticket->subject,
                    'status' => $ticket->status,
                    'status_display' => $ticket->status_display,
                    'status_badge_class' => $ticket->status_badge_class,
                    'priority' => $ticket->priority,
                    'priority_badge_class' => $ticket->priority_badge_class,
                    'created_at' => $ticket->created_at,
                    'created_at_human' => $ticket->created_at->diffForHumans(),
                    'latest_message_at' => $ticket->latestMessage?->created_at?->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard/Home', [
            'stats' => $stats,
            'recent_orders' => $recentOrders,
            'recent_transactions' => $recentTransactions,
            'open_tickets' => $openTickets,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'balance' => $user->balance,
                'formatted_balance' => $user->formatted_balance,
                'referral_code' => $user->referral_code,
                'referral_earnings' => $user->referral_earnings,
            ],
        ]);
    }
}
