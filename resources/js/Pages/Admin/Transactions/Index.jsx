// File: resources/js/Pages/Admin/Transactions/Index.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    CreditCard,
    Search,
    Filter,
    Plus,
    Eye,
    Download,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    TrendingUp,
    ArrowUpDown,
    Calendar,
    User,
    AlertCircle
} from 'lucide-react';

export default function Index({ transactions, stats, gateways, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedGateway, setSelectedGateway] = useState(filters.gateway || '');
    const [amountFrom, setAmountFrom] = useState(filters.amount_from || '');
    const [amountTo, setAmountTo] = useState(filters.amount_to || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(route('admin.transactions.index'), {
            search: searchTerm,
            type: selectedType,
            status: selectedStatus,
            gateway: selectedGateway,
            amount_from: amountFrom,
            amount_to: amountTo,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedStatus('');
        setSelectedGateway('');
        setAmountFrom('');
        setAmountTo('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.transactions.index'));
    };

    const handleSort = (field) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.transactions.index'), {
            ...filters,
            sort: field,
            direction: direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                <Icon className="w-3 h-3 mr-1" />
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const transactionTypes = [
        { value: 'deposit', label: 'Deposit' },
        { value: 'purchase', label: 'Purchase' },
        { value: 'refund', label: 'Refund' },
        { value: 'referral_commission', label: 'Referral Commission' }
    ];

    const statuses = [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
                        <p className="text-gray-600">Monitor and manage all financial transactions</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CreditCard className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Transactions
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total_transactions.toLocaleString()}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Volume
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {formatCurrency(stats.total_volume)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Clock className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Pending
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.pending_transactions}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Today's Volume
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {formatCurrency(stats.today_volume)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search transactions by ID, user, or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Search
                                </button>
                            </div>

                            {showFilters && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Type
                                            </label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="">All Types</option>
                                                {transactionTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="">All Status</option>
                                                {statuses.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Gateway
                                            </label>
                                            <select
                                                value={selectedGateway}
                                                onChange={(e) => setSelectedGateway(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="">All Gateways</option>
                                                <option value="manual">Manual</option>
                                                {gateways.map((gateway) => (
                                                    <option key={gateway} value={gateway}>
                                                        {gateway.charAt(0).toUpperCase() + gateway.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date Range
                                            </label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                    placeholder="From"
                                                />
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                    placeholder="To"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Amount Range
                                            </label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={amountFrom}
                                                    onChange={(e) => setAmountFrom(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                    placeholder="Min amount"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={amountTo}
                                                    onChange={(e) => setAmountTo(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                    placeholder="Max amount"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {(searchTerm || selectedType || selectedStatus || selectedGateway || amountFrom || amountTo || dateFrom || dateTo) && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-gray-600 hover:text-gray-900 text-sm"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('transaction_id')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Transaction</span>
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type & Status
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('amount')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Amount</span>
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gateway
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Date</span>
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.data.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.transaction_id}
                                                </div>
                                                {transaction.order && (
                                                    <div className="text-sm text-gray-500">
                                                        Order: {transaction.order.order_number}
                                                    </div>
                                                )}
                                                {transaction.gateway_transaction_id && (
                                                    <div className="text-sm text-gray-500 font-mono">
                                                        {transaction.gateway_transaction_id}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.user?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.user?.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {getTypeBadge(transaction.type)}
                                                {getStatusBadge(transaction.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 capitalize">
                                                {transaction.gateway || 'Manual'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={route('admin.transactions.show', transaction.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {transaction.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to approve this transaction?')) {
                                                                    router.post(route('admin.transactions.approve', transaction.id));
                                                                }
                                                            }}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Approve Transaction"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const reason = prompt('Please provide a reason for rejection:');
                                                                if (reason) {
                                                                    router.post(route('admin.transactions.reject', transaction.id), { reason });
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Reject Transaction"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {transaction.status === 'failed' && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to retry this transaction?')) {
                                                                router.post(route('admin.transactions.retry', transaction.id));
                                                            }
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Retry Transaction"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {transactions.prev_page_url && (
                                    <Link
                                        href={transactions.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {transactions.next_page_url && (
                                    <Link
                                        href={transactions.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">{transactions.from}</span>
                                        {' '}to{' '}
                                        <span className="font-medium">{transactions.to}</span>
                                        {' '}of{' '}
                                        <span className="font-medium">{transactions.total}</span>
                                        {' '}results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {transactions.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : link.url
                                                        ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                    } ${index === 0 ? 'rounded-l-md' : ''
                                                    } ${index === transactions.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {transactions.data.length === 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="text-center py-12">
                            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || selectedType || selectedStatus || selectedGateway
                                    ? 'Try adjusting your search criteria.'
                                    : 'Get started by creating a new transaction.'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
