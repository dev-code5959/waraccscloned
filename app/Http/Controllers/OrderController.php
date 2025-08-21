<?php
// File: app/Http/Controllers/OrderController.php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct() {}

    public function create(Request $request, Product $product)
    {
        $quantity = $request->get('quantity', 1);

        // Validate quantity
        if (!$product->canPurchase($quantity)) {
            return redirect()->back()->with('error', 'Product is not available in the requested quantity.');
        }

        $subtotal = $product->price * $quantity;

        return Inertia::render('Checkout', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $product->price,
                'formatted_price' => $product->formatted_price,
                'thumbnail' => $product->thumbnail,
                'delivery_info' => $product->delivery_info,
                'manual_delivery' => $product->manual_delivery,
                'is_in_stock' => $product->is_in_stock,
                'available_stock' => $product->available_stock,
            ],
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'formatted_subtotal' => '$' . number_format($subtotal, 2),
            'user_balance' => Auth::user()->balance,
            'formatted_user_balance' => Auth::user()->formatted_balance,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'promo_code' => 'nullable|string',
        ]);

        $user = Auth::user();
        $product = Product::findOrFail($request->product_id);
        $quantity = $request->quantity;

        // Validate product availability
        if (!$product->canPurchase($quantity)) {
            return back()->withErrors([
                'quantity' => 'Product is not available in the requested quantity.'
            ])->withInput();
        }

        DB::beginTransaction();

        try {
            // Determine initial status based on delivery type
            $initialStatus = $product->manual_delivery ? 'pending' : 'pending';

            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'total_amount' => $product->price * $quantity,
                'status' => $initialStatus,
                'payment_status' => 'pending',
                'net_amount' => $product->price * $quantity
            ]);

            // Apply promo code if provided
            if ($request->promo_code) {
                $promoCode = PromoCode::byCode($request->promo_code)->valid()->first();

                if ($promoCode && $promoCode->isValidForOrder($order)) {
                    $discount = $promoCode->calculateDiscount($order->total_amount);
                    $order->update([
                        'promo_code' => $promoCode->code,
                        'discount_amount' => $discount,
                        'net_amount' => $order->total_amount - $discount,
                    ]);
                    $promoCode->incrementUsage();
                }
            }

            // Handle access codes based on delivery type
            if (!$product->manual_delivery) {
                // For automatic delivery, reserve access codes
                $accessCodes = $product->reserveAccessCodes($quantity);
                foreach ($accessCodes as $code) {
                    $code->update(['order_id' => $order->id]);
                }
            }
            // For manual delivery, no access codes are reserved at this point

            DB::commit();

            // Redirect to payment page with success message
            return redirect()->route('orders.payment', $order)
                ->with('success', 'Order created successfully');
        } catch (\Exception $e) {
            DB::rollback();

            // Return back with error message
            return back()->withErrors([
                'order' => 'Failed to create order: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function payment(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Redirect if order is already paid or cancelled
        if (in_array($order->status, ['completed', 'cancelled']) || $order->payment_status === 'paid') {
            return redirect()->route('dashboard.orders.show', $order);
        }

        $netAmount = $order->net_amount;

        return Inertia::render('OrderPayment', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'discount_amount' => $order->discount_amount,
                'net_amount' => $netAmount,
                'formatted_total' => $order->formatted_total,
                'formatted_discount' => $order->formatted_discount,
                'formatted_net_amount' => $order->formatted_net_amount,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'product' => [
                    'name' => $order->product->name,
                    'thumbnail' => $order->product->thumbnail,
                    'manual_delivery' => $order->product->manual_delivery,
                ],
                'quantity' => $order->quantity,
                'created_at' => $order->created_at,
            ],
            'user_balance' => Auth::user()->balance,
            'formatted_user_balance' => Auth::user()->formatted_balance,
            'can_pay_with_balance' => Auth::user()->balance >= $netAmount,
        ]);
    }

    public function payWithBalance(Request $request, Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $user = Auth::user();
        $netAmount = $order->net_amount;

        if ($user->balance < $netAmount) {
            return back()->withErrors([
                'balance' => 'Insufficient balance'
            ]);
        }

        DB::beginTransaction();

        try {
            // Deduct balance
            $user->deductBalance($netAmount, "Payment for order {$order->order_number}", 'purchase');

            // Mark order as paid
            $order->markAsPaid('balance', 'BALANCE_' . now()->timestamp);

            // Handle delivery based on product type
            if ($order->product->manual_delivery) {
                // For manual delivery, mark as pending delivery
                $order->update([
                    'status' => 'pending_delivery',
                    'notes' => 'Order paid - awaiting manual delivery by admin'
                ]);

                $successMessage = 'Payment successful! Your order is being processed and you will receive your digital products via email once ready.';
            } else {
                // For automatic delivery, deliver access codes immediately
                $accessCodes = $order->deliverAccessCodes();
                $order->update(['status' => 'completed']);

                $successMessage = 'Payment successful! Your digital products have been delivered.';
            }

            DB::commit();

            return redirect()->route('dashboard.orders.show', $order)
                ->with('success', $successMessage);
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'payment' => 'Payment failed: ' . $e->getMessage()
            ]);
        }
    }

    public function validatePromoCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $promoCode = PromoCode::byCode($request->code)->valid()->first();

        if (!$promoCode) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired promo code',
            ], 422);
        }

        // Create a temporary order object for validation
        $product = Product::find($request->product_id);
        $tempOrder = new Order([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'total_amount' => $product->price * $request->quantity,
        ]);

        if (!$promoCode->isValidForOrder($tempOrder)) {
            return response()->json([
                'valid' => false,
                'message' => 'Promo code is not applicable to this order',
            ], 422);
        }

        $discount = $promoCode->calculateDiscount($tempOrder->total_amount);
        $newTotal = $tempOrder->total_amount - $discount;

        return response()->json([
            'valid' => true,
            'discount_amount' => $discount,
            'formatted_discount' => '$' . number_format($discount, 2),
            'new_total' => $newTotal,
            'formatted_new_total' => '$' . number_format($newTotal, 2),
            'message' => "Promo code applied! You saved {$promoCode->formatted_value}",
        ]);
    }

    public function cancel(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$order->can_be_cancelled) {
            return back()->withErrors([
                'cancel' => 'This order cannot be cancelled'
            ]);
        }

        $order->markAsCancelled('Cancelled by user');

        return redirect()->route('dashboard.orders.index')
            ->with('success', 'Order cancelled successfully');
    }
}
