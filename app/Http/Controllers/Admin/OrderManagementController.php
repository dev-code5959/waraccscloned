<?php
// File: app/Http/Controllers/Admin/OrderManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\AccessCode;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'product', 'accessCodes'])
            ->withCount(['accessCodes', 'transactions']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Payment status filter
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Amount range filter
        if ($request->filled('amount_min')) {
            $query->where('total_amount', '>=', $request->amount_min);
        }
        if ($request->filled('amount_max')) {
            $query->where('total_amount', '<=', $request->amount_max);
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $orders = $query->paginate(20)->withQueryString();

        // Get filter options
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
            'pending_payments' => Order::where('payment_status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only([
                'search',
                'status',
                'payment_status',
                'date_from',
                'date_to',
                'amount_min',
                'amount_max',
                'sort_field',
                'sort_direction'
            ])
        ]);
    }

    public function show(Order $order)
    {
        $order->load([
            'user',
            'product',
            'accessCodes',
            'transactions' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'supportTickets' => function ($query) {
                $query->latest();
            }
        ]);

        $timeline = $this->getOrderTimeline($order);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'timeline' => $timeline,
            'canProcess' => $this->canProcessOrder($order),
            'canCancel' => $this->canCancelOrder($order),
            'canRefund' => $this->canRefundOrder($order),
            'canAssignCodes' => $this->canAssignCodes($order),
        ]);
    }

    public function process(Request $request, Order $order)
    {
        if (!$this->canProcessOrder($order)) {
            return back()->withErrors(['error' => 'Order cannot be processed in its current state.']);
        }

        DB::beginTransaction();
        try {
            if ($order->status === 'pending') {
                $order->markAsProcessing();
            }

            if ($order->status === 'processing' && $order->payment_status === 'paid') {
                $deliveredCodes = $order->deliverAccessCodes();

                // Create transaction record for the sale
                Transaction::create([
                    'transaction_id' => 'TXN-' . strtoupper(uniqid()),
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'type' => 'purchase',
                    'amount' => $order->total_amount,
                    'net_amount' => $order->net_amount,
                    'status' => 'completed',
                    'description' => "Purchase of {$order->quantity} x {$order->product->name}",
                ]);

                DB::commit();
                return back()->with('success', 'Order processed successfully and access codes delivered.');
            }

            DB::commit();
            return back()->with('success', 'Order moved to processing status.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to process order: ' . $e->getMessage()]);
        }
    }

    public function cancel(Request $request, Order $order)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        if (!$this->canCancelOrder($order)) {
            return back()->withErrors(['error' => 'Order cannot be cancelled in its current state.']);
        }

        DB::beginTransaction();
        try {
            $order->markAsCancelled($request->reason);

            // If payment was made, create refund transaction
            if ($order->payment_status === 'paid') {
                $order->user->increment('balance', $order->net_amount);

                Transaction::create([
                    'transaction_id' => 'REF-' . strtoupper(uniqid()),
                    'user_id' => $order->user_id,
                    'order_id' => $order->id,
                    'type' => 'refund',
                    'amount' => $order->net_amount,
                    'net_amount' => $order->net_amount,
                    'status' => 'completed',
                    'description' => "Refund for cancelled order #{$order->order_number}",
                ]);

                $order->update(['payment_status' => 'refunded']);
            }

            DB::commit();
            return back()->with('success', 'Order cancelled successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to cancel order: ' . $e->getMessage()]);
        }
    }

    public function refund(Request $request, Order $order)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $order->net_amount,
            'reason' => 'required|string|max:500',
            'type' => 'required|in:full,partial'
        ]);

        if (!$this->canRefundOrder($order)) {
            return back()->withErrors(['error' => 'Order cannot be refunded in its current state.']);
        }

        DB::beginTransaction();
        try {
            $refundAmount = $request->type === 'full' ? $order->net_amount : $request->amount;

            // Add refund to user balance
            $order->user->increment('balance', $refundAmount);

            // Create refund transaction
            Transaction::create([
                'transaction_id' => 'REF-' . strtoupper(uniqid()),
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'type' => 'refund',
                'amount' => $refundAmount,
                'net_amount' => $refundAmount,
                'status' => 'completed',
                'description' => "Refund for order #{$order->order_number}: {$request->reason}",
            ]);

            // Update order status
            if ($request->type === 'full') {
                $order->update([
                    'status' => 'refunded',
                    'payment_status' => 'refunded',
                    'notes' => ($order->notes ? $order->notes . "\n" : '') . "Full refund: {$request->reason}"
                ]);

                // Release access codes back to available
                $order->accessCodes()->update([
                    'status' => 'available',
                    'order_id' => null,
                    'sold_at' => null,
                    'delivered_at' => null
                ]);
            } else {
                $order->update([
                    'notes' => ($order->notes ? $order->notes . "\n" : '') . "Partial refund of \${$refundAmount}: {$request->reason}"
                ]);
            }

            DB::commit();
            return back()->with('success', 'Refund processed successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to process refund: ' . $e->getMessage()]);
        }
    }

    public function assignCodes(Request $request, Order $order)
    {
        $request->validate([
            'access_code_ids' => 'required|array',
            'access_code_ids.*' => 'exists:access_codes,id'
        ]);

        if (!$this->canAssignCodes($order)) {
            return back()->withErrors(['error' => 'Cannot assign codes to this order.']);
        }

        DB::beginTransaction();
        try {
            $accessCodes = AccessCode::whereIn('id', $request->access_code_ids)
                ->where('product_id', $order->product_id)
                ->where('status', 'available')
                ->get();

            if ($accessCodes->count() !== count($request->access_code_ids)) {
                return back()->withErrors(['error' => 'Some access codes are not available or do not belong to this product.']);
            }

            if ($accessCodes->count() > $order->quantity) {
                return back()->withErrors(['error' => 'Too many access codes selected for this order quantity.']);
            }

            // Assign codes to order
            foreach ($accessCodes as $code) {
                $code->update([
                    'status' => 'reserved',
                    'order_id' => $order->id,
                    'reserved_at' => now()
                ]);
            }

            DB::commit();
            return back()->with('success', 'Access codes assigned successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to assign codes: ' . $e->getMessage()]);
        }
    }

    private function canProcessOrder(Order $order): bool
    {
        return in_array($order->status, ['pending', 'processing']) &&
            $order->payment_status === 'paid';
    }

    private function canCancelOrder(Order $order): bool
    {
        return in_array($order->status, ['pending', 'processing']) &&
            $order->status !== 'completed';
    }

    private function canRefundOrder(Order $order): bool
    {
        return $order->payment_status === 'paid' &&
            in_array($order->status, ['completed', 'processing']);
    }

    private function canAssignCodes(Order $order): bool
    {
        return $order->status === 'processing' &&
            $order->payment_status === 'paid' &&
            $order->accessCodes()->count() < $order->quantity;
    }

    private function getOrderTimeline(Order $order): array
    {
        $timeline = [];

        // Order created
        $timeline[] = [
            'type' => 'created',
            'title' => 'Order Created',
            'description' => "Order #{$order->order_number} was created",
            'timestamp' => $order->created_at,
            'icon' => 'plus',
            'color' => 'blue'
        ];

        // Payment events
        if ($order->paid_at) {
            $timeline[] = [
                'type' => 'payment',
                'title' => 'Payment Received',
                'description' => "Payment of {$order->formatted_total} received via {$order->payment_method}",
                'timestamp' => $order->paid_at,
                'icon' => 'credit-card',
                'color' => 'green'
            ];
        }

        // Status changes
        if ($order->status === 'processing') {
            $timeline[] = [
                'type' => 'processing',
                'title' => 'Order Processing',
                'description' => 'Order moved to processing status',
                'timestamp' => $order->updated_at,
                'icon' => 'clock',
                'color' => 'yellow'
            ];
        }

        if ($order->completed_at) {
            $timeline[] = [
                'type' => 'completed',
                'title' => 'Order Completed',
                'description' => 'Access codes delivered and order completed',
                'timestamp' => $order->completed_at,
                'icon' => 'check',
                'color' => 'green'
            ];
        }

        if ($order->status === 'cancelled') {
            $timeline[] = [
                'type' => 'cancelled',
                'title' => 'Order Cancelled',
                'description' => 'Order was cancelled',
                'timestamp' => $order->updated_at,
                'icon' => 'x',
                'color' => 'red'
            ];
        }

        // Transactions
        foreach ($order->transactions as $transaction) {
            $timeline[] = [
                'type' => 'transaction',
                'title' => ucfirst($transaction->type) . ' Transaction',
                'description' => $transaction->description,
                'timestamp' => $transaction->created_at,
                'icon' => $transaction->type === 'refund' ? 'arrow-left' : 'dollar-sign',
                'color' => $transaction->type === 'refund' ? 'red' : 'green'
            ];
        }

        // Sort by timestamp
        usort($timeline, function ($a, $b) {
            return $a['timestamp']->timestamp - $b['timestamp']->timestamp;
        });

        return $timeline;
    }
}
