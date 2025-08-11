// File: resources/js/Pages/Dashboard/Transactions/Index.jsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    Search,
    Filter,
    Download,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Eye
} from 'lucide-react';

export default function TransactionsIndex({
    transactions,
    stats,
    filters,
    filter_options
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard.transactions.index'), {
            ...filters,
            search: searchTerm,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters };

        if (value === '') {
            delete newFilters[filterType];
        } else {
            newFilters[filterType] = value;
        }

        router.get(route('dashboard.transactions.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        router.get(route('dashboard.transactions.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'purchase':
                return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
            case 'refund':
                return <ArrowDownLeft className="h-4 w-4 text-purple-600" />;
            default:
                return <CreditCard className="h-4 w-4 text-gray-600" />;
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, change }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {change && (
                        <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {change}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const activeFiltersCount = Object.keys(filters).filter(key => filters[key] && key !== 'page').length;

    return (
        <DashboardLayout>
            <Head title="Transactions" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
                            <p className="text-blue-100">
                                Track all your deposits, purchases, and account activity
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <CreditCard className="h-16 w-16 text-blue-300" />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Deposits"
                        value={`$${stats.total_deposits.toFixed(2)}`}
                        icon={TrendingDown}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Total Purchases"
                        value={`$${stats.total_purchases.toFixed(2)}`}
                        icon={TrendingUp}
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Total Transactions"
                        value={stats.total_transactions}
                        icon={CreditCard}
                        color="bg-purple-600"
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pending_transactions}
                        icon={Clock}
                        color="bg-orange-600"
                    />
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search transactions..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </form>

                            {/* Filter Toggle */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${showFilters || activeFiltersCount > 0
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Type Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={filters.type || ''}
                                            onChange={(e) => handleFilterChange('type', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Types</option>
                                            {Object.entries(filter_options.types).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Statuses</option>
                                            {Object.entries(filter_options.statuses).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_from || ''}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_to || ''}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {activeFiltersCount > 0 && (
                                    <div className="mt-4">
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Transactions List */}
                    <div className="divide-y divide-gray-200">
                        {transactions.data.length > 0 ? (
                            transactions.data.map((transaction) => (
                                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className="flex-shrink-0">
                                                {getTransactionIcon(transaction.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {transaction.description}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type_badge_class}`}>
                                                        {transaction.type_display}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status_badge_class}`}>
                                                        {transaction.status_display}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {transaction.transaction_id}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {transaction.created_at_formatted}
                                                    </span>
                                                    {transaction.payment_currency && (
                                                        <span>
                                                            {transaction.payment_amount} {transaction.payment_currency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {transaction.formatted_amount}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {transaction.currency}
                                                </p>
                                            </div>

                                            <Link
                                                href={route('dashboard.transactions.show', transaction.id)}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg font-medium mb-2">No transactions found</p>
                                <p className="text-sm">
                                    {activeFiltersCount > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Your transaction history will appear here when you make deposits or purchases.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {transactions.data.length > 0 && (transactions.prev_page_url || transactions.next_page_url) && (
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
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
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {transactions.prev_page_url && (
                                                <Link
                                                    href={transactions.prev_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}
                                            {transactions.next_page_url && (
                                                <Link
                                                    href={transactions.next_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
