// File: resources/js/Pages/Dashboard/Referrals/Index.jsx

import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    Users,
    DollarSign,
    Share2,
    Copy,
    TrendingUp,
    Gift,
    Star,
    ExternalLink,
    Calendar,
    ShoppingBag
} from 'lucide-react';

export default function ReferralsIndex({
    user,
    stats,
    referrals,
    recent_commissions,
    program_settings
}) {
    const [copied, setCopied] = useState(false);

    const { post, processing } = useForm();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateCode = () => {
        post(route('dashboard.referrals.generate'));
    };

    const requestPayout = () => {
        if (confirm(`Request payout of $${stats.total_earnings.toFixed(2)}?`)) {
            post(route('dashboard.referrals.payout'));
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, description, action }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-semibold text-gray-900">{value}</p>
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                </div>
                {action && (
                    <div className="ml-4">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Referral Program" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Referral Program</h1>
                            <p className="text-green-100">
                                Earn {program_settings.commission_rate}% commission on every purchase made by your referrals
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Users className="h-16 w-16 text-green-300" />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Referrals"
                        value={stats.total_referrals}
                        icon={Users}
                        color="bg-blue-600"
                        description="People you've referred"
                    />
                    <StatCard
                        title="Active Referrals"
                        value={stats.active_referrals}
                        icon={Star}
                        color="bg-purple-600"
                        description="Referrals who made purchases"
                    />
                    <StatCard
                        title="Total Earnings"
                        value={`$${stats.total_earnings.toFixed(2)}`}
                        icon={DollarSign}
                        color="bg-green-600"
                        description="All time commissions"
                        action={stats.total_earnings >= program_settings.minimum_payout && (
                            <button
                                onClick={requestPayout}
                                disabled={processing}
                                className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50 disabled:opacity-50"
                            >
                                Request Payout
                            </button>
                        )}
                    />
                    <StatCard
                        title="Pending Earnings"
                        value={`$${stats.pending_earnings.toFixed(2)}`}
                        icon={TrendingUp}
                        color="bg-yellow-600"
                        description="Awaiting confirmation"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Referral Link */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Share2 className="h-5 w-5 mr-2" />
                                    Your Referral Link
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {user.referral_code ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Referral Code
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg font-mono text-lg">
                                                    {user.referral_code}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(user.referral_code)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Referral URL
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={user.referral_url}
                                                    readOnly
                                                    className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm"
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(user.referral_url)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${copied
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <button
                                                onClick={() => {
                                                    const text = `Check out ACCSZone for digital products! Use my referral link: ${user.referral_url}`;
                                                    copyToClipboard(text);
                                                }}
                                                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Message
                                            </button>
                                            <a
                                                href={`https://twitter.com/intent/tweet?text=Check%20out%20ACCSZone%20for%20digital%20products!&url=${encodeURIComponent(user.referral_url)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Tweet
                                            </a>
                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(user.referral_url)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Share
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Your Referral Code</h3>
                                        <p className="text-gray-600 mb-4">
                                            Create your unique referral code to start earning commissions
                                        </p>
                                        <button
                                            onClick={generateCode}
                                            disabled={processing}
                                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Generating...' : 'Generate Code'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Commissions */}
                        <div className="mt-6 bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Recent Commissions
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {recent_commissions.length > 0 ? (
                                    recent_commissions.map((commission) => (
                                        <div key={commission.id} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="font-medium text-gray-900">
                                                            Commission from {commission.referred_user}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${commission.status_badge_class}`}>
                                                            {commission.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {commission.product_name} • {commission.order_number}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {commission.created_at_human}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">
                                                        {commission.formatted_amount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500">
                                        <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No commissions yet</p>
                                        <p className="text-sm">Share your referral link to start earning!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Program Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Program Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Commission Rate:</span>
                                    <span className="font-medium text-green-600">{program_settings.commission_rate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Minimum Payout:</span>
                                    <span className="font-medium">${program_settings.minimum_payout}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Cookie Duration:</span>
                                    <span className="font-medium">{program_settings.cookie_duration} days</span>
                                </div>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-4">How It Works</h3>
                            <div className="space-y-3 text-sm text-blue-800">
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        1
                                    </div>
                                    <span>Share your unique referral link</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        2
                                    </div>
                                    <span>Friends sign up using your link</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        3
                                    </div>
                                    <span>Earn {program_settings.commission_rate}% on their purchases</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                        4
                                    </div>
                                    <span>Request payout when you reach ${program_settings.minimum_payout}</span>
                                </div>
                            </div>
                        </div>

                        {/* Your Referrals */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                Your Referrals
                            </h3>

                            {referrals.data.length > 0 ? (
                                <div className="space-y-3">
                                    {referrals.data.slice(0, 5).map((referral) => (
                                        <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-sm text-gray-900">{referral.name}</div>
                                                <div className="text-xs text-gray-600">
                                                    {referral.orders_count} orders • {referral.formatted_total_spent}
                                                </div>
                                                <div className="text-xs text-gray-500">{referral.created_at_human}</div>
                                            </div>
                                        </div>
                                    ))}

                                    {referrals.data.length > 5 && (
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">
                                                +{referrals.data.length - 5} more referrals
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No referrals yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
