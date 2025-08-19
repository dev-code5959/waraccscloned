// File: resources/js/Pages/Admin/Transactions/Show.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    CreditCard,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    Copy,
    ExternalLink,
    DollarSign,
    Calendar,
    Hash,
    Building,
    FileText,
    Eye
} from 'lucide-react';

export default function Show({ transaction, relatedTransactions }) {
    const [showGatewayResponse, setShowGatewayResponse] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            completed: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
            failed: { class: 'bg-red-100 text-red-800', icon: XCircle },
            cancelled: { class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const badges = {
            deposit: { class: 'bg-green-100 text-green-800' },
            purchase: { class: 'bg-blue-100 text-blue-800' },
            refund: { class: 'bg-purple-100 text-purple-800' },
            referral_commission: { class: 'bg-orange-100 text-orange-800' }
        };

        const badge = badges[type] || { class: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You might want to show a toast notification here
    };

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve this transaction?')) {
            router.post(route('admin.transactions.approve', transaction.id));
        }
    };

    const handleReject = () => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(route('admin.transactions.reject', transaction.id), { reason });
        }
    };

    const handleCancel = () => {
        const reason = prompt('Please provide a reason for cancellation:');
        if (reason) {
            router.post(route('admin.transactions.cancel', transaction.id), { reason });
        }
    };

    const handleRetry = () => {
        if (confirm('Are you sure you want to retry this transaction?')) {
            router.post(route('admin.transactions.retry', transaction.id));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.transactions.index')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Transactions
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
                            <p className="text-gray-600">Transaction ID: {transaction.transaction_id}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {transaction.status === 'pending' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </button>
                            </>
                        )}
                        {transaction.status === 'failed' && (
                            <button
                                onClick={handleRetry}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </button>
                        )}
                        {(transaction.status === 'pending' || transaction.status === 'completed') && (
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50"
                            >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Transaction Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Transaction Info */}
                    <div className="lg:col-span-2 bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Transaction Information</h3>
                        </div>
                        <div className="px-6 py-4 space-y-6">
                            {/* Status and Type */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {getStatusBadge(transaction.status)}
                                    {getTypeBadge(transaction.type)}
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                    </div>
                                    {transaction.fee > 0 && (
                                        <div className="text-sm text-gray-500">
                                            Fee: {formatCurrency(transaction.fee)}
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        Net: {formatCurrency(transaction.net_amount)}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Hash className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Transaction ID</div>
                                            <div className="text-sm font-mono text-gray-900 flex items-center">
                                                {transaction.transaction_id}
                                                <button
                                                    onClick={() => copyToClipboard(transaction.transaction_id)}
                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Gateway</div>
                                            <div className="text-sm text-gray-900 capitalize">
                                                {transaction.gateway || 'Manual'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Currency</div>
                                            <div className="text-sm text-gray-900">
                                                {transaction.currency}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {transaction.gateway_transaction_id && (
                                        <div className="flex items-center space-x-2">
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Gateway Transaction ID</div>
                                                <div className="text-sm font-mono text-gray-900 flex items-center">
                                                    {transaction.gateway_transaction_id}
                                                    <button
                                                        onClick={() => copyToClipboard(transaction.gateway_transaction_id)}
                                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Created At</div>
                                            <div className="text-sm text-gray-900">
                                                {formatDate(transaction.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Last Updated</div>
                                            <div className="text-sm text-gray-900">
                                                {formatDate(transaction.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {transaction.description && (
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Description</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                        {transaction.description}
                                    </div>
                                </div>
                            )}

                            {/* Gateway Response */}
                            {transaction.gateway_response && (
                                <div>
                                    <button
                                        onClick={() => setShowGatewayResponse(!showGatewayResponse)}
                                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Gateway Response</span>
                                        <span className="text-xs">({showGatewayResponse ? 'Hide' : 'Show'})</span>
                                    </button>
                                    {showGatewayResponse && (
                                        <div className="mt-2 bg-gray-50 rounded-lg p-3">
                                            <pre className="text-xs text-gray-700 overflow-x-auto">
                                                {JSON.stringify(transaction.gateway_response, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User & Order Info */}
                    <div className="space-y-6">
                        {/* User Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">User Information</h3>
                            </div>
                            <div className="px-6 py-4">
                                {transaction.user ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {transaction.user.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {transaction.user.id}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">User information not available</div>
                                )}

                                {transaction.user && (
                                    <div className="mt-4">
                                        <Link
                                            href={route('admin.users.show', transaction.user.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View User
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Information */}
                        {transaction.order && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Related Order</h3>
                                </div>
                                <div className="px-6 py-4 space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Order Number</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {transaction.order.order_number}
                                        </div>
                                    </div>

                                    {transaction.order.product && (
                                        <div>
                                            <div className="text-sm text-gray-500">Product</div>
                                            <div className="text-sm text-gray-900">
                                                {transaction.order.product.name}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <Link
                                            href={route('admin.orders.show', transaction.order.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Order
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transaction Summary */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Amount</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(transaction.amount)}
                                    </span>
                                </div>

                                {transaction.fee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Fee</span>
                                        <span className="text-sm text-gray-900">
                                            -{formatCurrency(transaction.fee)}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-900">Net Amount</span>
                                        <span className={`text-sm font-medium ${transaction.net_amount >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatCurrency(transaction.net_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Transactions */}
                {relatedTransactions && relatedTransactions.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Related Transactions</h3>
                            <p className="text-sm text-gray-500">Recent transactions by the same user</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {relatedTransactions.map((relatedTransaction) => (
                                        <tr key={relatedTransaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {relatedTransaction.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getTypeBadge(relatedTransaction.type)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={relatedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {relatedTransaction.amount >= 0 ? '+' : ''}{formatCurrency(relatedTransaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(relatedTransaction.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(relatedTransaction.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.transactions.show', relatedTransaction.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Action Log */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Transaction Timeline</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flow-root">
                            <ul className="-mb-8">
                                <li>
                                    <div className="relative pb-8">
                                        <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                                    <CheckCircle className="h-5 w-5 text-white" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Transaction created
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    {formatDate(transaction.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                {transaction.updated_at !== transaction.created_at && (
                                    <li>
                                        <div className="relative pb-8">
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${transaction.status === 'completed' ? 'bg-green-500' :
                                                            transaction.status === 'failed' ? 'bg-red-500' :
                                                                transaction.status === 'cancelled' ? 'bg-gray-500' :
                                                                    'bg-yellow-500'
                                                        }`}>
                                                        {transaction.status === 'completed' && <CheckCircle className="h-5 w-5 text-white" />}
                                                        {transaction.status === 'failed' && <XCircle className="h-5 w-5 text-white" />}
                                                        {transaction.status === 'cancelled' && <AlertCircle className="h-5 w-5 text-white" />}
                                                        {transaction.status === 'pending' && <Clock className="h-5 w-5 text-white" />}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Status updated to <span className="font-medium">{transaction.status}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        {formatDate(transaction.updated_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
