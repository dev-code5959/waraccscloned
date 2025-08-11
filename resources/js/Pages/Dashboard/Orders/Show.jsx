// File: resources/js/Pages/Dashboard/Orders/Show.jsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    ArrowLeft,
    Package,
    CreditCard,
    Download,
    Eye,
    EyeOff,
    Copy,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Calendar,
    User,
    Hash,
    DollarSign,
    Shield,
    MessageCircle
} from 'lucide-react';

export default function OrderShow({ order, accessCodes, auth }) {
    const [showCredentials, setShowCredentials] = useState({});
    const [copiedItems, setCopiedItems] = useState({});

    const toggleCredentialVisibility = (codeId) => {
        setShowCredentials(prev => ({
            ...prev,
            [codeId]: !prev[codeId]
        }));
    };

    const copyToClipboard = (text, type, id) => {
        navigator.clipboard.writeText(text);
        setCopiedItems(prev => ({ ...prev, [`${type}_${id}`]: true }));
        setTimeout(() => {
            setCopiedItems(prev => ({ ...prev, [`${type}_${id}`]: false }));
        }, 2000);
    };

    const downloadCredentials = () => {
        window.location.href = `/dashboard/orders/${order.id}/download`;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-amber-600" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Package className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusBadgeClass = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Order #${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Link
                        href="/dashboard/orders"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                            <p className="text-gray-600 mt-1">Order details and digital products</p>
                        </div>
                        <div className="flex space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                                Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                Order Summary
                            </h2>

                            <div className="flex items-start space-x-4 mb-6">
                                {order.product.thumbnail && (
                                    <img
                                        src={order.product.thumbnail}
                                        alt={order.product.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">{order.product.name}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Hash className="h-4 w-4 mr-2" />
                                            <span>Quantity: {order.quantity}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            <span>Unit Price: ${order.unit_price}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            <span>Customer: {auth.user.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal ({order.quantity} items):</span>
                                    <span>${order.total_amount}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({order.promo_code}):</span>
                                        <span>-${order.discount_amount}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total Paid:</span>
                                        <span>${order.net_amount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Digital Products / Access Codes */}
                        {accessCodes && accessCodes.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Shield className="h-5 w-5 mr-2" />
                                        Digital Products
                                    </h2>
                                    {order.status === 'completed' && (
                                        <button
                                            onClick={downloadCredentials}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download All
                                        </button>
                                    )}
                                </div>

                                {order.status === 'completed' && order.payment_status === 'paid' ? (
                                    <div className="space-y-4">
                                        {accessCodes.map((code, index) => (
                                            <div key={code.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900">
                                                        Account #{index + 1}
                                                    </h4>
                                                    <button
                                                        onClick={() => toggleCredentialVisibility(code.id)}
                                                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm transition-colors"
                                                    >
                                                        {showCredentials[code.id] ? (
                                                            <>
                                                                <EyeOff className="h-4 w-4 mr-1" />
                                                                Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Show
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Email/Username */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email/Username
                                                        </label>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type={showCredentials[code.id] ? "text" : "password"}
                                                                value={code.email || code.username || ''}
                                                                readOnly
                                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none"
                                                            />
                                                            <button
                                                                onClick={() => copyToClipboard(code.email || code.username, 'email', code.id)}
                                                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedItems[`email_${code.id}`] ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Password */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Password
                                                        </label>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type={showCredentials[code.id] ? "text" : "password"}
                                                                value={code.password || ''}
                                                                readOnly
                                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none"
                                                            />
                                                            <button
                                                                onClick={() => copyToClipboard(code.password, 'password', code.id)}
                                                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedItems[`password_${code.id}`] ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Additional Info */}
                                                    {code.additional_info && (
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Additional Information
                                                            </label>
                                                            <textarea
                                                                value={code.additional_info}
                                                                readOnly
                                                                rows={3}
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Delivery Info */}
                                                {code.delivered_at && (
                                                    <div className="mt-3 text-sm text-green-600 flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Delivered on {new Date(code.delivered_at).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                            <div className="flex items-start space-x-3">
                                                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div className="text-blue-800 text-sm">
                                                    <p className="font-medium mb-1">Important Security Notice</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>Change passwords immediately after receiving access</li>
                                                        <li>Do not share these credentials with unauthorized persons</li>
                                                        <li>Use these accounts responsibly and follow platform terms</li>
                                                        <li>Contact support if you encounter any issues</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {order.payment_status === 'pending'
                                                ? 'Payment Required'
                                                : 'Processing Order'
                                            }
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {order.payment_status === 'pending'
                                                ? 'Complete your payment to receive digital products.'
                                                : 'Your digital products will be available once payment is confirmed.'
                                            }
                                        </p>
                                        {order.payment_status === 'pending' && (
                                            <Link
                                                href={`/orders/${order.id}/payment`}
                                                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Complete Payment
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Status Card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Order Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Payment Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                    </span>
                                </div>

                                {order.payment_method && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Payment Method:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                                        </span>
                                    </div>
                                )}

                                {order.transaction_id && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Transaction ID:</span>
                                        <span className="text-sm font-mono text-gray-900 truncate">
                                            {order.transaction_id}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Package className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Order Created</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {order.payment_status === 'paid' && (
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CreditCard className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Payment Received</p>
                                            <p className="text-sm text-gray-500">
                                                {order.paid_at ? new Date(order.paid_at).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'completed' && (
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Order Completed</p>
                                            <p className="text-sm text-gray-500">
                                                Digital products delivered
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

                            <div className="space-y-3">
                                {order.payment_status === 'pending' && (
                                    <Link
                                        href={`/orders/${order.id}/payment`}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Complete Payment
                                    </Link>
                                )}

                                {order.status === 'completed' && accessCodes && accessCodes.length > 0 && (
                                    <button
                                        onClick={downloadCredentials}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Products
                                    </button>
                                )}

                                <button
                                    onClick={() => copyToClipboard(order.order_number, 'order', 'number')}
                                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    {copiedItems['order_number'] ? 'Copied!' : 'Copy Order #'}
                                </button>

                                <Link
                                    href="/dashboard/tickets"
                                    className="w-full bg-amber-100 text-amber-700 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Get Support
                                </Link>
                            </div>
                        </div>

                        {/* Product Info */}
                        {order.product.delivery_info && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                                <p className="text-sm text-gray-600">
                                    {order.product.delivery_info}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
