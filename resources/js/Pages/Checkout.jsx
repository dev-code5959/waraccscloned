// File: resources/js/Pages/Checkout.jsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    ShoppingCart,
    Package,
    CreditCard,
    Wallet,
    Shield,
    ArrowLeft,
    Check,
    AlertCircle
} from 'lucide-react';

export default function Checkout({ product, quantity, subtotal, formatted_subtotal, user_balance, formatted_user_balance, auth, errors, flash }) {
    const [promoCode, setPromoCode] = useState('');
    const [promoCodeData, setPromoCodeData] = useState(null);
    const [promoCodeLoading, setPromoCodeLoading] = useState(false);
    const [promoCodeError, setPromoCodeError] = useState('');

    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        quantity: quantity,
        promo_code: '',
    });

    const finalTotal = promoCodeData ? promoCodeData.new_total : subtotal;
    const canPayWithBalance = user_balance >= finalTotal;

    const handlePromoCodeCheck = async () => {
        if (!promoCode.trim()) return;

        setPromoCodeLoading(true);
        setPromoCodeError('');

        try {
            const response = await axios.post('/validate-promo-code', {
                code: promoCode,
                product_id: product.id,
                quantity: quantity
            });

            setPromoCodeData(response.data);
            setData('promo_code', promoCode);
        } catch (error) {
            setPromoCodeError(error.response?.data?.message || 'Invalid promo code');
            setPromoCodeData(null);
            setData('promo_code', '');
        } finally {
            setPromoCodeLoading(false);
        }
    };

    const handleSubmit = () => {
        post(route('orders.store'));
    };

    return (
        <AppLayout>
            <Head title="Checkout" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={`/products/${product.slug}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Product
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                        <p className="text-gray-600 mt-2">Review your order and complete your purchase</p>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {flash.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Summary */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Details */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Order Details
                                </h2>

                                <div className="flex items-start space-x-4">
                                    {product.thumbnail && (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Price per item:</span>
                                                <span>{product.formatted_price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Quantity:</span>
                                                <span>{quantity}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                                                <span>Subtotal:</span>
                                                <span>{formatted_subtotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                {product.delivery_info && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-start space-x-2">
                                            <Package className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-blue-800">
                                                <strong>Delivery:</strong> {product.delivery_info}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Promo Code */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Promo Code</h2>

                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter promo code"
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={promoCodeLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePromoCodeCheck}
                                        disabled={promoCodeLoading || !promoCode.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {promoCodeLoading ? 'Checking...' : 'Apply'}
                                    </button>
                                </div>

                                {promoCodeError && (
                                    <div className="mt-2 flex items-center text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {promoCodeError}
                                    </div>
                                )}

                                {promoCodeData && (
                                    <div className="mt-2 flex items-center text-green-600 text-sm">
                                        <Check className="h-4 w-4 mr-1" />
                                        {promoCodeData.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-6">
                            {/* Order Total */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Total</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>{formatted_subtotal}</span>
                                    </div>

                                    {promoCodeData && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount:</span>
                                            <span>-{promoCodeData.formatted_discount}</span>
                                        </div>
                                    )}

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total:</span>
                                            <span>${finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>

                                {/* Balance Info */}
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Wallet className="h-5 w-5 text-gray-600 mr-2" />
                                            <span className="text-sm font-medium">Account Balance:</span>
                                        </div>
                                        <span className="font-semibold">{formatted_user_balance}</span>
                                    </div>

                                    {!canPayWithBalance && (
                                        <div className="mt-2 text-sm text-amber-600">
                                            <AlertCircle className="h-4 w-4 inline mr-1" />
                                            Insufficient balance. Please add funds to your account.
                                        </div>
                                    )}
                                </div>

                                {/* Payment Options */}
                                <div className="space-y-3">
                                    {canPayWithBalance && (
                                        <div className="flex items-center p-3 border border-green-200 bg-green-50 rounded-lg">
                                            <Check className="h-5 w-5 text-green-600 mr-3" />
                                            <div>
                                                <div className="font-medium text-green-800">Pay with Balance</div>
                                                <div className="text-sm text-green-600">Instant payment using your account balance</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-75">
                                        <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-medium text-gray-600">Crypto Payment</div>
                                            <div className="text-sm text-gray-500">Available after order creation</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                {processing ? 'Processing...' : 'Place Order'}
                            </button>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <Shield className="h-4 w-4" />
                                <span>Secure checkout powered by encryption</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
