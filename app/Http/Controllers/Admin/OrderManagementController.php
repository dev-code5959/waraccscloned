<?php
// File: app/Http/Controllers/Admin/OrderManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ManualDeliveryComplete;
use App\Models\AccessCode;
use App\Models\Order;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\OrderCancelledNotification;
use App\Notifications\OrderDeliveredNotification;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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

        // Delivery type filter
        if ($request->filled('delivery_type')) {
            $deliveryType = $request->delivery_type;
            $query->whereHas('product', function ($productQuery) use ($deliveryType) {
                if ($deliveryType === 'manual') {
                    $productQuery->where('manual_delivery', true);
                } elseif ($deliveryType === 'automatic') {
                    $productQuery->where('manual_delivery', false);
                }
            });
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
            'pending_delivery_orders' => Order::where('status', 'pending_delivery')->count(),
            'manual_delivery_orders' => Order::whereHas('product', function ($q) {
                $q->where('manual_delivery', true);
            })->count(),
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
                'delivery_type',
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
            'canUploadFiles' => $this->canUploadFiles($order),
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
                if ($order->product->manual_delivery) {
                    // For manual delivery, move to pending_delivery after payment
                    $order->update(['status' => 'pending_delivery']);
                } else {
                    // For automatic delivery, move to processing
                    $order->markAsProcessing();
                }
            }

            if ($order->status === 'processing' && $order->payment_status === 'paid' && !$order->product->manual_delivery) {
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
                app(NotificationService::class)->send($order->user, new OrderDeliveredNotification($order));
                return back()->with('success', 'Order processed successfully and access codes delivered.');
            }

            DB::commit();
            return back()->with('success', 'Order status updated successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to process order: ' . $e->getMessage()]);
        }
    }

    public function uploadFiles(Request $request, Order $order)
    {
        $request->validate([
            'files' => 'required|array|min:1|max:10',
            'files.*' => 'required|file|max:10240|mimes:txt,pdf,zip,rar,doc,docx,jpg,jpeg,png',
            'delivery_notes' => 'nullable|string|max:1000',
        ]);

        if (!$this->canUploadFiles($order)) {
            return back()->withErrors(['error' => 'Cannot upload files for this order.']);
        }

        DB::beginTransaction();
        try {
            $uploadedFiles = [];
            $deliveryPath = "manual-deliveries/{$order->order_number}";

            // Create directory if it doesn't exist
            Storage::makeDirectory($deliveryPath);

            // Process each uploaded file
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $filename = time() . '_' . $originalName;
                $path = $file->storeAs($deliveryPath, $filename);

                $uploadedFiles[] = [
                    'name' => $originalName,
                    'path' => Storage::path($path),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }

            // Update order status and notes
            $notes = $order->notes ?: '';
            if ($request->delivery_notes) {
                $notes .= "\n\nDelivery Notes: " . $request->delivery_notes;
            }
            $notes .= "\n\nManual delivery completed on " . now()->format('Y-m-d H:i:s');
            $notes .= "\nFiles delivered: " . count($uploadedFiles) . " files";

            $order->update([
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => $notes,
            ]);

            // Update product sold count
            $order->product->incrementSoldCount($order->quantity);

            // Create transaction record
            Transaction::create([
                'transaction_id' => 'TXN-' . strtoupper(uniqid()),
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'type' => 'purchase',
                'amount' => $order->total_amount,
                'net_amount' => $order->net_amount,
                'status' => 'completed',
                'description' => "Manual delivery of {$order->quantity} x {$order->product->name}",
            ]);

            // Send email with attachments
            Mail::to($order->user->email)->send(new ManualDeliveryComplete($order, $uploadedFiles));

            // Notify user of delivery
            app(NotificationService::class)->send($order->user, new OrderDeliveredNotification($order));

            // Clean up files after email is sent (optional - depends on your retention policy)
            // You might want to keep files for a certain period for support purposes

            DB::commit();

            return back()->with('success', 'Files uploaded successfully and delivered to customer via email. Order marked as completed.');

        } catch (\Exception $e) {
            DB::rollback();

            // Clean up uploaded files on error
            foreach ($uploadedFiles as $file) {
                if (file_exists($file['path'])) {
                    unlink($file['path']);
                }
            }

            return back()->withErrors(['error' => 'Failed to upload files: ' . $e->getMessage()]);
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
            app(NotificationService::class)->send($order->user, new OrderCancelledNotification($order));
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

                // Release access codes back to available (only for automatic delivery)
                if (!$order->product->manual_delivery) {
                    $order->accessCodes()->update([
                        'status' => 'available',
                        'order_id' => null,
                        'sold_at' => null,
                        'delivered_at' => null
                    ]);
                }
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
        if ($order->product->manual_delivery) {
            return $order->status === 'pending' && $order->payment_status === 'paid';
        }

        return in_array($order->status, ['pending', 'processing']) &&
            $order->payment_status === 'paid';
    }

    private function canCancelOrder(Order $order): bool
    {
        return in_array($order->status, ['pending', 'processing', 'pending_delivery']) &&
            $order->status !== 'completed';
    }

    private function canRefundOrder(Order $order): bool
    {
        return $order->payment_status === 'paid' &&
            in_array($order->status, ['completed', 'processing', 'pending_delivery']);
    }

    private function canAssignCodes(Order $order): bool
    {
        return !$order->product->manual_delivery &&
            $order->status === 'processing' &&
            $order->payment_status === 'paid' &&
            $order->accessCodes()->count() < $order->quantity;
    }

    private function canUploadFiles(Order $order): bool
    {
        return $order->product->manual_delivery &&
            $order->status === 'pending_delivery' &&
            $order->payment_status === 'paid';
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

        if ($order->status === 'pending_delivery') {
            $timeline[] = [
                'type' => 'pending_delivery',
                'title' => 'Pending Manual Delivery',
                'description' => 'Order awaiting manual delivery by admin',
                'timestamp' => $order->updated_at,
                'icon' => 'truck',
                'color' => 'blue'
            ];
        }

        if ($order->completed_at) {
            $deliveryType = $order->product->manual_delivery ? 'Manual delivery completed' : 'Access codes delivered and order completed';
            $timeline[] = [
                'type' => 'completed',
                'title' => 'Order Completed',
                'description' => $deliveryType,
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
