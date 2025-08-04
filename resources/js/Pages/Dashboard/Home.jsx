// File: resources/js/Pages/Dashboard/Home.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import {
    ShoppingBag,
    Wallet,
    MessageCircle,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    ArrowRight,
    DollarSign
} from 'lucide-react';

export default function DashboardHome({
    stats,
    recent_orders,
    recent_transactions,
    open_tickets,
    user
}) {
    const StatCard = ({ title, value, icon: Icon, color, change }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
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

    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
                            <p className="text-blue-100 mt-1">
                                Here's what's happening with your account today.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">Current Balance</p>
                            <p className="text-3xl font-bold">{user.formatted_balance}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Orders"
                        value={stats.total_orders}
                        icon={ShoppingBag}
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Completed Orders"
                        value={stats.completed_orders}
                        icon={CheckCircle}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Total Spent"
                        value={`$${Math.abs(stats.total_spent).toFixed(2)}`}
                        icon={DollarSign}
                        color="bg-purple-600"
                    />
                    <StatCard
                        title="Open Tickets"
                        value={stats.open_tickets}
                        icon={MessageCircle}
                        color="bg-orange-600"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/dashboard/funds"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="bg-green-100 p-3 rounded-lg mr-4">
                                <Wallet className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Add Funds</h3>
                                <p className="text-sm text-gray-600">Top up your account balance</p>
                            </div>
                        </Link>

                        <Link
                            href="/search"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Browse Products</h3>
                                <p className="text-sm text-gray-600">Find digital products</p>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/tickets"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="bg-orange-100 p-3 rounded-lg mr-4">
                                <MessageCircle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Get Support</h3>
                                <p className="text-sm text-gray-600">Contact customer support</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                                <Link
                                    href="/dashboard/orders"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {recent_orders.length > 0 ? (
                                recent_orders.map((order) => (
                                    <div key={order.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {order.product_name}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status_badge_class}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {order.order_number} • Qty: {order.quantity}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {order.created_at_human}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{order.formatted_total}</p>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.payment_status_badge_class}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No orders yet</p>
                                    <Link
                                        href="/search"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Browse products
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                                <Link
                                    href="/dashboard/transactions"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {recent_transactions.length > 0 ? (
                                recent_transactions.map((transaction) => (
                                    <div key={transaction.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {transaction.type_display}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status_badge_class}`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {transaction.transaction_id}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {transaction.created_at_human}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {transaction.formatted_amount}
                                                </p>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${transaction.type_badge_class}`}>
                                                    {transaction.type_display}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Open Support Tickets */}
                {open_tickets.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Open Support Tickets</h2>
                                <Link
                                    href="/dashboard/tickets"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {open_tickets.map((ticket) => (
                                <div key={ticket.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {ticket.subject}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status_badge_class}`}>
                                                    {ticket.status_display}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {ticket.ticket_number}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Created {ticket.created_at_human}
                                                {ticket.latest_message_at && ` • Last reply ${ticket.latest_message_at}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ticket.priority_badge_class}`}>
                                                {ticket.priority} priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Referral Program */}
                {user.referral_code && (
                    <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">Referral Program</h2>
                                <p className="text-green-100 mb-4">
                                    Earn commission by referring friends to ACCSZone
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-green-100 text-sm">Your Referral Code</p>
                                        <p className="font-mono text-lg">{user.referral_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-100 text-sm">Total Earnings</p>
                                        <p className="text-2xl font-bold">${user.referral_earnings}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Users className="h-16 w-16 text-green-300" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/dashboard/referrals"
                                className="inline-flex items-center bg-white text-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                            >
                                Manage Referrals
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
