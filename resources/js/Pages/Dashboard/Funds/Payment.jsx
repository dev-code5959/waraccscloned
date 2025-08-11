// File: resources/js/Pages/Dashboard/Funds/Payment.jsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    Copy,
    CheckCircle,
    Clock,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    Wallet,
    QrCode,
    ArrowLeft
} from 'lucide-react';

export default function FundsPayment({ transaction, payment }) {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (payment.expiration_estimate_date) {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const expiry = new Date(payment.expiration_estimate_date).getTime();
                const distance = expiry - now;

                if (distance > 0) {
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                } else {
                    setTimeLeft('Expired');
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [payment.expiration_estimate_date]);

    // Auto-refresh payment status
    useEffect(() => {
        if (payment.payment_status === 'waiting') {
            const interval = setInterval(() => {
                refreshPaymentStatus();
            }, 30000); // Check every 30 seconds

            return () => clearInterval(interval);
        }
    }, [payment.payment_status]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const refreshPaymentStatus = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false)
        });
    };

    const getStatusIcon = () => {
        switch (payment.payment_status) {
            case 'finished':
            case 'confirmed':
                return <CheckCircle className="h-8 w-8 text-green-500" />;
            case 'waiting':
            case 'confirming':
                return <Clock className="h-8 w-8 text-yellow-500" />;
            case 'failed':
            case 'expired':
                return <AlertTriangle className="h-8 w-8 text-red-500" />;
            default:
                return <Clock className="h-8 w-8 text-gray-500" />;
        }
    };

    const getStatusMessage = () => {
        switch (payment.payment_status) {
            case 'waiting':
                return {
                    title: 'Waiting for Payment',
                    description: 'Send the exact amount to the address below',
                    color: 'text-yellow-700'
                };
            case 'confirming':
                return {
                    title: 'Payment Received',
                    description: 'Waiting for blockchain confirmation',
                    color: 'text-blue-700'
                };
            case 'confirmed':
            case 'finished':
                return {
                    title: 'Payment Confirmed',
                    description: 'Funds have been added to your account',
                    color: 'text-green-700'
                };
            case 'failed':
                return {
                    title: 'Payment Failed',
                    description: 'The payment could not be processed',
                    color: 'text-red-700'
                };
            case 'expired':
                return {
                    title: 'Payment Expired',
                    description: 'This payment request has expired',
                    color: 'text-red-700'
                };
            default:
                return {
                    title: 'Processing',
                    description: 'Please wait...',
                    color: 'text-gray-700'
                };
        }
    };

    const statusInfo = getStatusMessage();
    const progressPercentage = payment.amount_received && payment.pay_amount
        ? Math.min((payment.amount_received / payment.pay_amount) * 100, 100)
        : 0;

    return (
        <DashboardLayout>
            <Head title="Complete Payment" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('dashboard.funds.index')}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                        <p className="text-gray-600">Transaction ID: {transaction.transaction_id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Payment Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                {getStatusIcon()}
                                <div>
                                    <h2 className={`text-xl font-semibold ${statusInfo.color}`}>
                                        {statusInfo.title}
                                    </h2>
                                    <p className="text-gray-600">{statusInfo.description}</p>
                                </div>
                                <button
                                    onClick={refreshPaymentStatus}
                                    disabled={isRefreshing}
                                    className="ml-auto p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {payment.payment_status === 'waiting' && payment.amount_received > 0 && (
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Payment Progress</span>
                                        <span>{progressPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Received: {payment.amount_received} {payment.pay_currency.toUpperCase()}
                                    </p>
                                </div>
                            )}

                            {/* Payment Details */}
                            {payment.payment_status === 'waiting' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Send Exactly This Amount
                                        </label>
                                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                            <span className="font-mono text-lg flex-1">
                                                {payment.pay_amount} {payment.pay_currency.toUpperCase()}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(payment.pay_amount.toString())}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            To This Address
                                        </label>
                                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                            <span className="font-mono text-sm flex-1 break-all">
                                                {payment.pay_address}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(payment.pay_address)}
                                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${copied
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        {payment.network && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Network: {payment.network.toUpperCase()}
                                            </p>
                                        )}
                                    </div>

                                    {/* QR Code Placeholder */}
                                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">QR Code</p>
                                        <p className="text-xs text-gray-400">Use your wallet app to scan</p>
                                    </div>
                                </div>
                            )}

                            {/* Success Actions */}
                            {(payment.payment_status === 'confirmed' || payment.payment_status === 'finished') && (
                                <div className="text-center space-y-4">
                                    <div className="text-green-600">
                                        <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">Payment Successful!</h3>
                                        <p className="text-sm text-gray-600">
                                            ${transaction.amount} has been added to your account
                                        </p>
                                    </div>
                                    <div className="flex space-x-3 justify-center">
                                        <Link
                                            href={route('dashboard')}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Go to Dashboard
                                        </Link>
                                        <Link
                                            href={route('search')}
                                            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                                        >
                                            Browse Products
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Failed/Expired Actions */}
                            {(payment.payment_status === 'failed' || payment.payment_status === 'expired') && (
                                <div className="text-center space-y-4">
                                    <div className="text-red-600">
                                        <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">
                                            {payment.payment_status === 'expired' ? 'Payment Expired' : 'Payment Failed'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {payment.payment_status === 'expired'
                                                ? 'This payment request has expired. Please create a new one.'
                                                : 'The payment could not be processed. Please try again.'
                                            }
                                        </p>
                                    </div>
                                    <div className="flex space-x-3 justify-center">
                                        <Link
                                            href={route('dashboard.funds.index')}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Try Again
                                        </Link>
                                        <Link
                                            href={route('dashboard.tickets.create')}
                                            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                                        >
                                            Get Support
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount (USD):</span>
                                    <span className="font-medium">{transaction.formatted_amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pay With:</span>
                                    <span className="font-medium">{payment.pay_currency.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pay Amount:</span>
                                    <span className="font-medium">{payment.pay_amount} {payment.pay_currency.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium capitalize ${statusInfo.color}`}>
                                        {payment.payment_status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timer */}
                        {timeLeft && payment.payment_status === 'waiting' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Time Remaining
                                </h3>
                                <div className="text-2xl font-mono font-bold text-yellow-800">
                                    {timeLeft}
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Payment will expire if not completed in time
                                </p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">Instructions</h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <div className="flex items-start">
                                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</div>
                                    <span>Copy the exact amount and address</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</div>
                                    <span>Send from your crypto wallet</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</div>
                                    <span>Wait for blockchain confirmation</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">4</div>
                                    <span>Funds automatically added to balance</span>
                                </div>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>If you have any issues with your payment:</p>
                                <Link
                                    href={route('dashboard.tickets.create')}
                                    className="block text-blue-600 hover:text-blue-700"
                                >
                                    → Create Support Ticket
                                </Link>
                                <div className="text-xs text-gray-500 mt-2">
                                    <div>📧 support@accszone.com</div>
                                    <div>💬 Live chat available</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
