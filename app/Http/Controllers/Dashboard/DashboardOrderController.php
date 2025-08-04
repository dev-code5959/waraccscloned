<?php
// File: app/Http/Controllers/Dashboard/OrdersController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrdersController extends Controller
{
    public function __construct()
    {

    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->get('status');
        $perPage = min($request->get('per_page', 15), 50);

        $orders = $user->orders()
            ->with(['product'])
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->recent()
            ->paginate($perPage)
            ->withQueryString();

        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'product' => [
                    'id' => $order->product->id,
                    'name' => $order->product->name,
                    'slug' => $order->product->slug,
                    'thumbnail' => $order->product->thumbnail,
                ],
                'quantity' => $order->quantity,
                'unit_price' => $order->unit_price,
                'formatted_unit_price' => $order->formatted_unit_price,
                'total_amount' => $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'discount_amount' => $order->discount_amount,
                'formatted_discount' => $order->formatted_discount,
                'net_amount' => $order->net_amount,
                'formatted_net_amount' => $order->formatted_net_amount,
                'status' => $order->status,
                'status_badge_class' => $order->status_badge_class,
                'payment_status' => $order->payment_status,
                'payment_status_badge_class' => $order->payment_status_badge_class,
                'promo_code' => $order->promo_code,
                'created_at' => $order->created_at,
                'created_at_human' => $order->created_at->diffForHumans(),
                'completed_at' => $order->completed_at,
                'completed_at_human' => $order->completed_at?->diffForHumans(),
                'can_be_cancelled' => $order->can_be_cancelled,
                'is_completed' => $order->is_completed,
            ];
        });

        // Get status counts for filter tabs
        $statusCounts = [
            'all' => $user->orders()->count(),
            'pending' => $user->orders()->pending()->count(),
            'processing' => $user->orders()->processing()->count(),
            'completed' => $user->orders()->completed()->count(),
            'cancelled' => $user->orders()->cancelled()->count(),
        ];

        return Inertia::render('Dashboard/Orders/Index', [
            'orders' => $orders,
            'status_counts' => $statusCounts,
            'current_status' => $status,
        ]);
    }

    public function show(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['product', 'accessCodes', 'transactions', 'supportTickets']);

        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'product' => [
                'id' => $order->product->id,
                'name' => $order->product->name,
                'slug' => $order->product->slug,
                'thumbnail' => $order->product->thumbnail,
                'delivery_info' => $order->product->delivery_info,
            ],
            'quantity' => $order->quantity,
            'unit_price' => $order->unit_price,
            'formatted_unit_price' => $order->formatted_unit_price,
            'total_amount' => $order->total_amount,
            'formatted_total' => $order->formatted_total,
            'discount_amount' => $order->discount_amount,
            'formatted_discount' => $order->formatted_discount,
            'net_amount' => $order->net_amount,
            'formatted_net_amount' => $order->formatted_net_amount,
            'status' => $order->status,
            'status_badge_class' => $order->status_badge_class,
            'payment_status' => $order->payment_status,
            'payment_status_badge_class' => $order->payment_status_badge_class,
            'payment_method' => $order->payment_method,
            'payment_reference' => $order->payment_reference,
            'promo_code' => $order->promo_code,
            'notes' => $order->notes,
            'created_at' => $order->created_at,
            'created_at_human' => $order->created_at->diffForHumans(),
            'completed_at' => $order->completed_at,
            'completed_at_human' => $order->completed_at?->diffForHumans(),
            'can_be_cancelled' => $order->can_be_cancelled,
            'is_completed' => $order->is_completed,
        ];

        // Get delivered credentials if order is completed
        $credentials = [];
        if ($order->is_completed && $order->access_codes_delivered) {
            $credentials = $order->getDeliveredCredentials()->toArray();
        }

        // Get related transactions
        $transactions = $order->transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'transaction_id' => $transaction->transaction_id,
                'type' => $transaction->type,
                'type_display' => $transaction->type_display,
                'amount' => $transaction->amount,
                'formatted_amount' => $transaction->formatted_amount,
                'status' => $transaction->status,
                'status_badge_class' => $transaction->status_badge_class,
                'created_at' => $transaction->created_at,
                'created_at_human' => $transaction->created_at->diffForHumans(),
            ];
        });

        // Get support tickets for this order
        $supportTickets = $order->supportTickets->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'status_display' => $ticket->status_display,
                'status_badge_class' => $ticket->status_badge_class,
                'created_at' => $ticket->created_at,
                'created_at_human' => $ticket->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Dashboard/Orders/Show', [
            'order' => $orderData,
            'credentials' => $credentials,
            'transactions' => $transactions,
            'support_tickets' => $supportTickets,
        ]);
    }

    public function downloadCredentials(Order $order)
    {
        // Ensure user owns this order and it's completed
        if ($order->user_id !== Auth::id() || !$order->is_completed) {
            abort(403);
        }

        $credentials = $order->getDeliveredCredentials();

        if ($credentials->isEmpty()) {
            return response()->json(['message' => 'No credentials available'], 404);
        }

        $filename = "order_{$order->order_number}_credentials.txt";
        $content = "Order: {$order->order_number}\n";
        $content .= "Product: {$order->product->name}\n";
        $content .= "Quantity: {$order->quantity}\n";
        $content .= "Date: " . $order->completed_at->format('Y-m-d H:i:s') . "\n";
        $content .= str_repeat('-', 50) . "\n\n";

        foreach ($credentials as $index => $credential) {
            $content .= "Account " . ($index + 1) . ":\n";
            foreach ($credential as $key => $value) {
                $content .= ucfirst($key) . ": " . $value . "\n";
            }
            $content .= "\n";
        }

        return response($content)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
