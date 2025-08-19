// File: resources/js/Pages/Admin/Users/Show.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    User,
    Mail,
    Calendar,
    DollarSign,
    ShoppingCart,
    CreditCard,
    MessageCircle,
    Users,
    Edit,
    UserX,
    UserCheck,
    Plus,
    ArrowLeft,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Download,
    AlertCircle
} from 'lucide-react';

export default function Show({ user, userStats }) {
    const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceDescription, setBalanceDescription] = useState('');
    const [balanceType, setBalanceType] = useState('deposit');

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
            minute: '2-digit'
        });
    };

    const getUserStatusBadge = () => {
        if (!user.is_active) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Suspended
                </span>
            );
        }
        if (!user.email_verified_at) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Email Unverified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
            </span>
        );
    };

    const getRoleBadge = () => {
        if (!user.roles || user.roles.length === 0) return null;

        const role = user.roles[0];
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            customer: 'bg-blue-100 text-blue-800',
            support: 'bg-gray-100 text-gray-800',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[role.name] || 'bg-gray-100 text-gray-800'}`}>
                <Shield className="w-4 h-4 mr-1" />
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </span>
        );
    };

    const getOrderStatusBadge = (status) => {
        const badges = {
            pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            processing: { class: 'bg-blue-100 text-blue-800', icon: Clock },
            completed: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { class: 'bg-red-100 text-red-800', icon: XCircle },
            refunded: { class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const handleAddBalance = (e) => {
        e.preventDefault();

        if (!balanceAmount || !balanceDescription) {
            alert('Please fill in all fields');
            return;
        }

        router.post(route('admin.users.add-balance', user.id), {
            amount: parseFloat(balanceAmount),
            description: balanceDescription,
            type: balanceType
        }, {
            onSuccess: () => {
                setShowAddBalanceModal(false);
                setBalanceAmount('');
                setBalanceDescription('');
                setBalanceType('deposit');
            }
        });
    };

    const handleSuspendUser = () => {
        const reason = prompt('Please provide a reason for suspension:');
        if (reason) {
            router.post(route('admin.users.suspend', user.id), { reason });
        }
    };

    const handleActivateUser = () => {
        if (confirm('Are you sure you want to activate this user?')) {
            router.post(route('admin.users.activate', user.id));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.users.index')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Users
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600">User ID: {user.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowAddBalanceModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Balance
                        </button>
                        <Link
                            href={route('admin.users.edit', user.id)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                        </Link>
                        {user.is_active ? (
                            <button
                                onClick={handleSuspendUser}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend
                            </button>
                        ) : (
                            <button
                                onClick={handleActivateUser}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                            </button>
                        )}
                    </div>
                </div>

                {/* User Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-lg font-medium text-blue-800">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-gray-900">{user.name}</p>
                                    <div className="flex items-center space-x-2">
                                        {getRoleBadge()}
                                        {getUserStatusBadge()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{user.email}</span>
                                    {user.email_verified_at && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        Joined {formatDate(user.created_at)}
                                    </span>
                                </div>

                                {user.last_login_at && (
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            Last login {formatDate(user.last_login_at)}
                                        </span>
                                    </div>
                                )}

                                {user.referral_code && (
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            Referral Code: <span className="font-mono">{user.referral_code}</span>
                                        </span>
                                    </div>
                                )}

                                {user.referred_by && (
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            Referred by: {user.referred_by?.name || `User ${user.referred_by.id}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Account Statistics</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-600">Current Balance</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(user.balance)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-gray-600">Total Orders</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {userStats.total_orders}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-600">Completed Orders</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {userStats.completed_orders}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-gray-600">Total Spent</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(userStats.total_spent)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm text-gray-600">Total Deposited</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(userStats.total_deposited)}
                                </span>
                            </div>

                            {userStats.referral_earnings > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-600">Referral Earnings</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(userStats.referral_earnings)}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-gray-600">Referrals</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {userStats.referrals_count}
                                </span>
                            </div>

                            {userStats.active_tickets > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <MessageCircle className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-gray-600">Active Tickets</span>
                                    </div>
                                    <span className="text-sm font-medium text-red-600">
                                        {userStats.active_tickets}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Security & Verification</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Email Verified</span>
                                {user.email_verified_at ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Two-Factor Auth</span>
                                {user.two_factor_enabled ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">KYC Verified</span>
                                {user.kyc_verified ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Account Status</span>
                                {user.is_active ? (
                                    <span className="text-sm text-green-600 font-medium">Active</span>
                                ) : (
                                    <span className="text-sm text-red-600 font-medium">Suspended</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                {user.orders && user.orders.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                            <Link
                                href={route('admin.orders.index', { user: user.id })}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                                View All Orders
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
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
                                    {user.orders.slice(0, 5).map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.order_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.product?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getOrderStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.orders.show', order.id)}
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

                {/* Recent Transactions */}
                {user.transactions && user.transactions.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                            <Link
                                href={route('admin.transactions.index', { user: user.id })}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                                View All Transactions
                            </Link>
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
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {user.transactions.slice(0, 5).map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {transaction.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' :
                                                        transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                                                            transaction.type === 'refund' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Balance Modal */}
                {showAddBalanceModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Balance</h3>
                                <form onSubmit={handleAddBalance} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transaction Type
                                        </label>
                                        <select
                                            value={balanceType}
                                            onChange={(e) => setBalanceType(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="deposit">Deposit</option>
                                            <option value="refund">Refund</option>
                                            <option value="referral_commission">Referral Commission</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={balanceAmount}
                                            onChange={(e) => setBalanceAmount(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={balanceDescription}
                                            onChange={(e) => setBalanceDescription(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Reason for adding balance..."
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddBalanceModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Add Balance
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
