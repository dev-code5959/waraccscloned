// File: resources/js/Pages/Dashboard/Profile/Edit.jsx

import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    User,
    Mail,
    Lock,
    Shield,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle,
    AlertTriangle,
    Calendar,
    Activity,
    Settings
} from 'lucide-react';

export default function ProfileEdit({
    user,
    stats,
    recent_activity
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Profile form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Delete account form
    const deleteForm = useForm({
        password: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.patch(route('dashboard.profile.update'), {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.patch(route('dashboard.profile.password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        if (confirm('Are you absolutely sure? This action cannot be undone.')) {
            deleteForm.delete(route('dashboard.profile.destroy'));
        }
    };

    const StatCard = ({ title, value, description }) => (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-600">{title}</div>
            {description && (
                <div className="text-xs text-gray-500 mt-1">{description}</div>
            )}
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
                            <p className="text-purple-100">
                                Manage your account information and security settings
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Settings className="h-16 w-16 text-purple-300" />
                        </div>
                    </div>
                </div>

                {/* Account Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Orders"
                            value={stats.total_orders}
                            description="Lifetime orders"
                        />
                        <StatCard
                            title="Completed Orders"
                            value={stats.completed_orders}
                            description="Successfully completed"
                        />
                        <StatCard
                            title="Total Spent"
                            value={`$${stats.total_spent.toFixed(2)}`}
                            description="All time spending"
                        />
                        <StatCard
                            title="Current Balance"
                            value={user.formatted_balance}
                            description="Available funds"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Profile Information
                                </h2>
                            </div>
                            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {profileForm.errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{profileForm.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={(e) => profileForm.setData('email', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {user.email_verified_at && (
                                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                                        )}
                                    </div>
                                    {profileForm.errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{profileForm.errors.email}</p>
                                    )}
                                    {user.email_verified_at ? (
                                        <p className="text-green-600 text-sm mt-1 flex items-center">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Email verified
                                        </p>
                                    ) : (
                                        <p className="text-orange-600 text-sm mt-1 flex items-center">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Email not verified
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-sm text-gray-600">
                                        Member since {user.created_at_formatted}
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Lock className="h-5 w-5 mr-2" />
                                    Change Password
                                </h2>
                            </div>
                            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="text-red-600 text-sm mt-1">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.password && (
                                        <p className="text-red-600 text-sm mt-1">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Two-Factor Authentication */}
                        {/* <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Two-Factor Authentication
                                </h2>
                            </div>
                            <div className="p-6">
                                {user.two_factor_enabled ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                <span className="font-medium text-gray-900">Two-factor authentication is enabled</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Your account is protected with two-factor authentication
                                            </p>
                                        </div>
                                        <Link
                                            href={route('dashboard.profile.2fa.disable')}
                                            method="delete"
                                            as="button"
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                                        >
                                            Disable 2FA
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center">
                                                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                                                <span className="font-medium text-gray-900">Two-factor authentication is disabled</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Add an extra layer of security to your account
                                            </p>
                                        </div>
                                        <Link
                                            href={route('dashboard.profile.2fa.enable')}
                                            method="post"
                                            as="button"
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                                        >
                                            Enable 2FA
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div> */}

                        {/* Delete Account */}
                        {/* <div className="bg-white rounded-lg shadow border-2 border-red-200">
                            <div className="p-6 border-b border-red-200">
                                <h2 className="text-lg font-semibold text-red-900 flex items-center">
                                    <Trash2 className="h-5 w-5 mr-2" />
                                    Delete Account
                                </h2>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-4">
                                    Once your account is deleted, all of its resources and data will be permanently deleted.
                                    Before deleting your account, please download any data or information that you wish to retain.
                                </p>

                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <form onSubmit={handleDeleteSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-red-700 mb-2">
                                                Confirm your password to delete your account
                                            </label>
                                            <input
                                                type="password"
                                                value={deleteForm.data.password}
                                                onChange={(e) => deleteForm.setData('password', e.target.value)}
                                                className="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                placeholder="Password"
                                                required
                                            />
                                            {deleteForm.errors.password && (
                                                <p className="text-red-600 text-sm mt-1">{deleteForm.errors.password}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="submit"
                                                disabled={deleteForm.processing}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div> */}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Activity className="h-4 w-4 mr-2" />
                                Account Statistics
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Deposits:</span>
                                    <span className="font-medium">${stats.total_deposits.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Active Tickets:</span>
                                    <span className="font-medium">{stats.active_tickets}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Success Rate:</span>
                                    <span className="font-medium">
                                        {stats.total_orders > 0 ? Math.round((stats.completed_orders / stats.total_orders) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {recent_activity.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                            <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                                            <p className="text-xs text-gray-500">{activity.created_at_human}</p>
                                        </div>
                                    </div>
                                ))}
                                {recent_activity.length === 0 && (
                                    <p className="text-sm text-gray-500">No recent activity</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <Link
                                    href={route('dashboard.orders.index')}
                                    className="block text-sm text-blue-600 hover:text-blue-700"
                                >
                                    → View Order History
                                </Link>
                                <Link
                                    href={route('dashboard.transactions.index')}
                                    className="block text-sm text-blue-600 hover:text-blue-700"
                                >
                                    → Transaction History
                                </Link>
                                <Link
                                    href={route('dashboard.funds.index')}
                                    className="block text-sm text-blue-600 hover:text-blue-700"
                                >
                                    → Add Funds
                                </Link>
                                <Link
                                    href={route('dashboard.tickets.index')}
                                    className="block text-sm text-blue-600 hover:text-blue-700"
                                >
                                    → Support Tickets
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
