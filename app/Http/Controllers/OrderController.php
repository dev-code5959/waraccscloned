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
    public function __construct()
    {

    }

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
            return response()->json([
                'message' => 'Product is not available in the requested quantity.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->price,
                'total_amount' => $product->price * $quantity,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Apply promo code if provided
            if ($request->promo_code) {
                $promoCode = PromoCode::byCode($request->promo_code)->valid()->first();

                if ($promoCode && $promoCode->isValidForOrder($order)) {
                    $discount = $promoCode->calculateDiscount($order->total_amount);
                    $order->update([
                        'promo_code' => $promoCode->code,
                        'discount_amount' => $discount,
                    ]);
                    $promoCode->incrementUsage();
                }
            }

            // Reserve access codes
            $accessCodes = $product->reserveAccessCodes($quantity);
            foreach ($accessCodes as $code) {
                $code->update(['order_id' => $order->id]);
            }

            DB::commit();

            return response()->json([
                'order' => $order->load('product'),
                'message' => 'Order created successfully',
                'redirect_url' => route('orders.payment', $order),
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
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
                ],
                'quantity' => $order->quantity,
                'created_at' => $order->created_at,
            ],
            'user_balance' => Auth::user()->balance,
            'formatted_user_balance' => Auth::user()->formatted_balance,
            'can_pay_with_balance' => Auth::user()->balance >= $netAmount,
        ]);
    }

    public function payWithBalance(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $user = Auth::user();
        $netAmount = $order->net_amount;

        if ($user->balance < $netAmount) {
            return response()->json([
                'message' => 'Insufficient balance',
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Deduct balance
            $user->deductBalance($netAmount, "Payment for order {$order->order_number}", 'purchase');

            // Mark order as paid
            $order->markAsPaid('balance', 'BALANCE_' . now()->timestamp);

            // Deliver access codes
            $accessCodes = $order->deliverAccessCodes();

            DB::commit();

            return response()->json([
                'message' => 'Payment successful! Your digital products have been delivered.',
                'redirect_url' => route('dashboard.orders.show', $order),
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Payment failed: ' . $e->getMessage(),
            ], 500);
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
            return response()->json([
                'message' => 'This order cannot be cancelled',
            ], 422);
        }

        $order->markAsCancelled('Cancelled by user');

        return response()->json([
            'message' => 'Order cancelled successfully',
            'redirect_url' => route('dashboard.orders.index'),
        ]);
    }
}
