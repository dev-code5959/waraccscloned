// File: resources/js/Pages/OrderPayment.jsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    CreditCard,
    Wallet,
    Shield,
    ArrowLeft,
    Clock,
    Package,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Copy
} from 'lucide-react';

export default function OrderPayment({ order, user_balance, formatted_user_balance, can_pay_with_balance, auth, errors, flash }) {
    const [paymentMethod, setPaymentMethod] = useState(can_pay_with_balance ? 'balance' : 'crypto');
    const [copied, setCopied] = useState(false);

    const { post, processing } = useForm();

    const handleBalancePayment = () => {
        post(route('orders.pay-balance', order.id));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-800 bg-green-100';
            case 'pending':
                return 'text-amber-800 bg-amber-100';
            case 'cancelled':
                return 'text-red-800 bg-red-100';
            default:
                return 'text-gray-800 bg-gray-100';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'text-green-800 bg-green-100';
            case 'pending':
                return 'text-amber-800 bg-amber-100';
            case 'failed':
                return 'text-red-800 bg-red-100';
            default:
                return 'text-gray-800 bg-gray-100';
        }
    };

    return (
        <AppLayout>
            <Head title={`Payment - Order #${order.order_number}`} />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/dashboard/orders"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
                                <p className="text-gray-600 mt-2">Order #{order.order_number}</p>
                            </div>
                            <div className="flex space-x-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                    Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {flash.error}
                        </div>
                    )}

                    {/* Error Messages */}
                    {errors?.balance && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {errors.balance}
                        </div>
                    )}

                    {errors?.payment && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {errors.payment}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Order Summary
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        {order.product.thumbnail && (
                                            <img
                                                src={order.product.thumbnail}
                                                alt={order.product.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{order.product.name}</h3>
                                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Quantity:</span> {order.quantity}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Unit Price:</span> ${order.unit_price}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Order Time:</span> {new Date(order.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing Breakdown */}
                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>{order.formatted_total}</span>
                                        </div>
                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount:</span>
                                                <span>-{order.formatted_discount}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span>Total Amount:</span>
                                                <span>{order.formatted_net_amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {order.payment_status === 'pending' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                    <div className="flex items-start space-x-3">
                                        <Clock className="h-6 w-6 text-amber-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-amber-900">Payment Pending</h3>
                                            <p className="text-amber-700 text-sm mt-1">
                                                Your order has been created and is waiting for payment.
                                                Choose a payment method below to complete your purchase.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-6">
                            {/* Account Balance */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Balance</h2>

                                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Wallet className="h-5 w-5 text-gray-600 mr-2" />
                                            <span className="font-medium">Available Balance:</span>
                                        </div>
                                        <span className="text-lg font-semibold">{formatted_user_balance}</span>
                                    </div>
                                </div>

                                {can_pay_with_balance ? (
                                    <button
                                        onClick={handleBalancePayment}
                                        disabled={processing}
                                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                    >
                                        <Wallet className="h-5 w-5 mr-2" />
                                        {processing ? 'Processing...' : 'Pay with Balance'}
                                    </button>
                                ) : (
                                    <div>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                            <div className="flex items-start space-x-2">
                                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                                <div className="text-red-800 text-sm">
                                                    <p className="font-medium">Insufficient Balance</p>
                                                    <p>You need ${(order.net_amount - user_balance).toFixed(2)} more to pay with balance.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard/funds"
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                                        >
                                            <Wallet className="h-5 w-5 mr-2" />
                                            Add Funds
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Crypto Payment */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Crypto Payment</h2>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                    <div className="flex items-start space-x-2">
                                        <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="text-blue-800 text-sm">
                                            <p className="font-medium">Coming Soon</p>
                                            <p>Crypto payment integration with NowPayments will be available soon.</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled
                                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center"
                                >
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Pay with Crypto (Coming Soon)
                                </button>
                            </div>

                            {/* Order Actions */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Actions</h2>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => copyToClipboard(order.order_number)}
                                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        {copied ? 'Copied!' : 'Copy Order Number'}
                                    </button>

                                    <Link
                                        href="/dashboard/orders"
                                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View All Orders
                                    </Link>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <Shield className="h-4 w-4" />
                                <span>Secure payment processing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
