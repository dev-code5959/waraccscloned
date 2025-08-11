// File: resources/js/Pages/Dashboard/Transactions/Show.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    ArrowLeft,
    CreditCard,
    Calendar,
    Hash,
    DollarSign,
    ShoppingBag,
    ExternalLink,
    Copy,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function TransactionShow({
    transaction,
    related_order
}) {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending':
            case 'processing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'failed':
            case 'cancelled':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const DetailRow = ({ label, value, copyable = false }) => (
        <div className="py-3 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-600">{label}</dt>
                <dd className="text-sm text-gray-900 flex items-center">
                    {copyable ? (
                        <div className="flex items-center space-x-2">
                            <span className="font-mono">{value}</span>
                            <button
                                onClick={() => copyToClipboard(value)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                title="Copy to clipboard"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <span>{value}</span>
                    )}
                </dd>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title={`Transaction ${transaction.transaction_id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('dashboard.transactions.index')}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Transaction Details
                        </h1>
                        <p className="text-gray-600">
                            {transaction.transaction_id}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Transaction Overview */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Transaction Overview
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(transaction.status)}
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${transaction.status_badge_class}`}>
                                            {transaction.status_display}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3">Transaction Details</h3>
                                        <dl className="space-y-2">
                                            <DetailRow
                                                label="Transaction ID"
                                                value={transaction.transaction_id}
                                                copyable={true}
                                            />
                                            <DetailRow
                                                label="Type"
                                                value={
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type_badge_class}`}>
                                                        {transaction.type_display}
                                                    </span>
                                                }
                                            />
                                            <DetailRow
                                                label="Amount"
                                                value={
                                                    <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {transaction.formatted_amount}
                                                    </span>
                                                }
                                            />
                                            <DetailRow
                                                label="Currency"
                                                value={transaction.currency}
                                            />
                                            <DetailRow
                                                label="Payment Method"
                                                value={transaction.payment_method ?
                                                    transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1)
                                                    : 'N/A'
                                                }
                                            />
                                        </dl>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3">Timestamps</h3>
                                        <dl className="space-y-2">
                                            <DetailRow
                                                label="Created"
                                                value={transaction.created_at_formatted}
                                            />
                                            <DetailRow
                                                label="Completed"
                                                value={transaction.completed_at_formatted || 'Not completed'}
                                            />
                                            <DetailRow
                                                label="Time Ago"
                                                value={transaction.created_at_human}
                                            />
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        {(transaction.payment_currency || transaction.payment_amount || transaction.payment_address) && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <DollarSign className="h-5 w-5 mr-2" />
                                        Payment Details
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <dl className="space-y-3">
                                        {transaction.payment_currency && (
                                            <DetailRow
                                                label="Payment Currency"
                                                value={transaction.payment_currency}
                                            />
                                        )}
                                        {transaction.payment_amount && (
                                            <DetailRow
                                                label="Payment Amount"
                                                value={`${transaction.payment_amount} ${transaction.payment_currency}`}
                                            />
                                        )}
                                        {transaction.payment_address && (
                                            <DetailRow
                                                label="Payment Address"
                                                value={transaction.payment_address}
                                                copyable={true}
                                            />
                                        )}
                                        {transaction.gateway_transaction_id && (
                                            <DetailRow
                                                label="External Transaction ID"
                                                value={transaction.gateway_transaction_id}
                                                copyable={true}
                                            />
                                        )}
                                    </dl>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {transaction.description && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-700">{transaction.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Raw Metadata */}
                        {transaction.metadata && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Technical Details</h2>
                                </div>
                                <div className="p-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                                            {JSON.stringify(transaction.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Related Order */}
                        {related_order && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Related Order
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Number</label>
                                        <div className="mt-1 font-mono text-sm text-gray-900">{related_order.order_number}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product</label>
                                        <div className="mt-1 text-sm text-gray-900">{related_order.product_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                                        <div className="mt-1 text-sm text-gray-900">{related_order.quantity}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</label>
                                        <div className="mt-1 text-sm font-semibold text-gray-900">{related_order.formatted_total}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                                        <div className="mt-1">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                                {related_order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('dashboard.orders.show', related_order.id)}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        View Order Details
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Transaction Status Guide */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">Status Guide</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-blue-800"><strong>Completed:</strong> Transaction successful</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                                    <span className="text-blue-800"><strong>Pending:</strong> Awaiting confirmation</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                    <span className="text-blue-800"><strong>Processing:</strong> Being processed</span>
                                </div>
                                <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                    <span className="text-blue-800"><strong>Failed:</strong> Transaction failed</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                {transaction.type === 'deposit' && transaction.status === 'failed' && (
                                    <Link
                                        href={route('dashboard.funds.index')}
                                        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                                    >
                                        Try Again
                                    </Link>
                                )}

                                <Link
                                    href={route('dashboard.transactions.index')}
                                    className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                                >
                                    Back to Transactions
                                </Link>

                                {(transaction.status === 'failed' || transaction.amount < 0) && (
                                    <Link
                                        href={route('dashboard.tickets.create', { transaction_id: transaction.id })}
                                        className="block w-full text-center border border-orange-300 text-orange-700 py-2 px-4 rounded-lg hover:bg-orange-50"
                                    >
                                        Get Support
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Transaction Timeline */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Timeline
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">Transaction Created</div>
                                        <div className="text-xs text-gray-500">{transaction.created_at_formatted}</div>
                                    </div>
                                </div>

                                {transaction.status !== 'pending' && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">Status Updated</div>
                                            <div className="text-xs text-gray-500">
                                                Changed to {transaction.status_display}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {transaction.completed_at_formatted && (
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">Transaction Completed</div>
                                            <div className="text-xs text-gray-500">{transaction.completed_at_formatted}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
