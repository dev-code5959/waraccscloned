// File: resources/js/Pages/Admin/Users/Create.jsx

import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    User,
    Mail,
    Lock,
    Shield,
    DollarSign,
    ArrowLeft,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';

export default function Create({ roles }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        balance: '',
        is_active: true,
        email_verified: false,
        kyc_verified: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.users.index')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Users
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
                        <p className="text-gray-600">Add a new user to the system</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">User Information</h3>
                    </div>

                    <div className="px-6 py-4 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter full name"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter email address"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        {/* Role and Balance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Shield className="w-4 h-4 inline mr-1" />
                                    User Role *
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.role ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    required
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Initial Balance
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.balance}
                                    onChange={(e) => setData('balance', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.balance ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                                {errors.balance && (
                                    <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Optional: Set an initial balance for the user
                                </p>
                            </div>
                        </div>

                        {/* Status Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Account Settings
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        Account is active
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="email_verified"
                                        checked={data.email_verified}
                                        onChange={(e) => setData('email_verified', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="email_verified" className="ml-2 block text-sm text-gray-900">
                                        Email is verified
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="kyc_verified"
                                        checked={data.kyc_verified}
                                        onChange={(e) => setData('kyc_verified', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="kyc_verified" className="ml-2 block text-sm text-gray-900">
                                        KYC is verified
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Information Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <User className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        User Creation Notes
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Customer users will automatically get a referral code generated</li>
                                            <li>If initial balance is set, a deposit transaction will be created</li>
                                            <li>Email verification can be set manually or user can verify later</li>
                                            <li>Account can be activated/deactivated after creation</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                        <Link
                            href={route('admin.users.index')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create User
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
