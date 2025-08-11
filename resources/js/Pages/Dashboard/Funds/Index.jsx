// File: resources/js/Pages/Dashboard/Funds/Index.jsx

import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    Wallet,
    CreditCard,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Bitcoin,
    DollarSign,
    ArrowUpRight,
    Copy,
    ExternalLink
} from 'lucide-react';

export default function FundsIndex({
    user,
    recent_deposits,
    supported_currencies,
    minimum_amount,
    maximum_amount,
    message
}) {
    const [selectedCurrency, setSelectedCurrency] = useState('btc');
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        currency: 'btc',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.funds.add'), {
            onSuccess: () => {
                reset();
                setShowPaymentForm(false);
            },
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const getCurrencyIcon = (currency) => {
        const icons = {
            btc: '₿',
            eth: 'Ξ',
            usdt: '₮',
            usdc: '$',
            ltc: 'Ł',
            bch: '₿',
        };
        return icons[currency] || '$';
    };

    const StatCard = ({ title, value, icon: Icon, color, description }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {description && (
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Add Funds" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Add Funds</h1>
                            <p className="text-green-100">
                                Add cryptocurrency to your account balance for purchasing digital products
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-green-100 text-sm">Current Balance</p>
                            <p className="text-3xl font-bold">{user.formatted_balance}</p>
                        </div>
                    </div>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`rounded-lg p-4 ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 mr-2" />
                            ) : (
                                <AlertCircle className="h-5 w-5 mr-2" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Deposits"
                        value={`$${recent_deposits.reduce((sum, deposit) => parseFloat(sum) + parseFloat(deposit.net_amount), 0)}`}
                        icon={TrendingUp}
                        color="bg-blue-600"
                        description="All time"
                    />
                    <StatCard
                        title="Pending Deposits"
                        value={recent_deposits.filter(d => d.status === 'pending').length}
                        icon={Clock}
                        color="bg-yellow-600"
                        description="Awaiting confirmation"
                    />
                    <StatCard
                        title="Successful Deposits"
                        value={recent_deposits.filter(d => d.status === 'completed').length}
                        icon={CheckCircle}
                        color="bg-green-600"
                        description="Last 30 days"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Funds Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add Cryptocurrency
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Choose your preferred cryptocurrency and amount
                                </p>
                            </div>

                            <div className="p-6">
                                {!showPaymentForm ? (
                                    <div className="space-y-6">
                                        {/* Currency Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Select Cryptocurrency
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {Object.entries(supported_currencies).map(([key, currency]) => (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCurrency(key);
                                                            setData('currency', key);
                                                        }}
                                                        className={`p-4 border rounded-lg flex items-center space-x-3 transition-all ${selectedCurrency === key
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <span className="text-xl font-bold">
                                                            {getCurrencyIcon(key)}
                                                        </span>
                                                        <div className="text-left">
                                                            <div className="font-medium">{currency.symbol}</div>
                                                            <div className="text-xs text-gray-500">{currency.name}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Amount Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount (USD)
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={data.amount}
                                                    onChange={(e) => setData('amount', e.target.value)}
                                                    min={minimum_amount}
                                                    max={maximum_amount}
                                                    step="0.01"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder={`${minimum_amount} - ${maximum_amount}`}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Minimum: ${minimum_amount} • Maximum: ${maximum_amount}
                                            </p>
                                            {errors.amount && (
                                                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                                            )}
                                        </div>

                                        {/* Quick Amount Buttons */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quick Select
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[25, 50, 100, 250].map((amount) => (
                                                    <button
                                                        key={amount}
                                                        type="button"
                                                        onClick={() => setData('amount', amount.toString())}
                                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        ${amount}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={() => setShowPaymentForm(true)}
                                            disabled={!data.amount || processing}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            <Wallet className="h-5 w-5 mr-2" />
                                            Continue to Payment
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Payment Summary */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-2">Payment Summary</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Amount:</span>
                                                    <span className="font-medium">${data.amount} USD</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Currency:</span>
                                                    <span className="font-medium">
                                                        {supported_currencies[data.currency]?.name} ({supported_currencies[data.currency]?.symbol})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Payment Method:</span>
                                                    <span className="font-medium">Cryptocurrency</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowPaymentForm(false)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Proceed to Payment
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Information Panel */}
                    <div className="space-y-6">
                        {/* Payment Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Payment Information
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Instant processing with crypto payments</span>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Secure and encrypted transactions</span>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>No additional fees or charges</span>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>24/7 customer support</span>
                                </div>
                            </div>
                        </div>

                        {/* Supported Currencies */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Bitcoin className="h-5 w-5 mr-2" />
                                Supported Currencies
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(supported_currencies).map(([key, currency]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <span className="font-mono text-lg mr-2">
                                                {getCurrencyIcon(key)}
                                            </span>
                                            <span>{currency.name}</span>
                                        </div>
                                        <span className="text-gray-500">{currency.symbol}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Deposits */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Recent Deposits
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {recent_deposits.length > 0 ? (
                            recent_deposits.map((deposit) => (
                                <div key={deposit.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {deposit.description}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${deposit.status_badge_class}`}>
                                                    {deposit.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {deposit.transaction_id}
                                            </p>
                                            {deposit.payment_currency && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {deposit.payment_amount} {deposit.payment_currency}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {deposit.created_at_human}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {deposit.formatted_amount}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {deposit.payment_method}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No deposits yet</p>
                                <p className="text-sm">Your deposit history will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
