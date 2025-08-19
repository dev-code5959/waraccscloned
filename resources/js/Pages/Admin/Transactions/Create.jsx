// File: resources/js/Pages/Admin/Transactions/Create.jsx

import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    CreditCard,
    User,
    DollarSign,
    FileText,
    ArrowLeft,
    Save,
    AlertCircle
} from 'lucide-react';

export default function Create({ users, selectedUserId }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: selectedUserId || '',
        type: 'deposit',
        amount: '',
        fee: '',
        description: '',
        status: 'completed',
    });

    const [selectedUser, setSelectedUser] = useState(
        selectedUserId ? users.find(u => u.id == selectedUserId) : null
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.transactions.store'));
    };

    const handleUserChange = (userId) => {
        setData('user_id', userId);
        setSelectedUser(users.find(u => u.id == userId));
    };

    const transactionTypes = [
        { value: 'deposit', label: 'Deposit', description: 'Add funds to user account' },
        { value: 'purchase', label: 'Purchase', description: 'Deduct funds for purchase' },
        { value: 'refund', label: 'Refund', description: 'Refund a previous transaction' },
        { value: 'referral_commission', label: 'Referral Commission', description: 'Commission from referral' }
    ];

    const statuses = [
        { value: 'pending', label: 'Pending', description: 'Transaction awaiting processing' },
        { value: 'completed', label: 'Completed', description: 'Transaction processed successfully' },
        { value: 'failed', label: 'Failed', description: 'Transaction processing failed' },
        { value: 'cancelled', label: 'Cancelled', description: 'Transaction was cancelled' }
    ];

    const calculateNetAmount = () => {
        const amount = parseFloat(data.amount) || 0;
        const fee = parseFloat(data.fee) || 0;
        return amount - fee;
    };

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.transactions.index')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Transactions
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Transaction</h1>
                        <p className="text-gray-600">Create a manual transaction for a user</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Transaction Information</h3>
                    </div>

                    <div className="px-6 py-4 space-y-6">
                        {/* User Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline mr-1" />
                                Select User *
                            </label>
                            <select
                                value={data.user_id}
                                onChange={(e) => handleUserChange(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.user_id ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">Select a user...</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                            )}
                            {selectedUser && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm">
                                        <span className="font-medium">Selected User:</span> {selectedUser.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Email: {selectedUser.email} | ID: {selectedUser.id}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transaction Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CreditCard className="w-4 h-4 inline mr-1" />
                                Transaction Type *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {transactionTypes.map((type) => (
                                    <div
                                        key={type.value}
                                        className={`relative border rounded-lg p-3 cursor-pointer transition-colors ${data.type === type.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onClick={() => setData('type', type.value)}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type.value}
                                                checked={data.type === type.value}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {type.label}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {type.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                            )}
                        </div>

                        {/* Amount and Fee */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Amount *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.amount ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                    required
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    {data.type === 'purchase' ? 'Amount to deduct (use positive value)' : 'Amount to add'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Fee (Optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.fee}
                                    onChange={(e) => setData('fee', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fee ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0.00"
                                />
                                {errors.fee && (
                                    <p className="mt-1 text-sm text-red-600">{errors.fee}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Processing fee (if applicable)
                                </p>
                            </div>
                        </div>

                        {/* Net Amount Display */}
                        {data.amount && (
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Net Amount:</span>
                                    <span className={`text-lg font-bold ${calculateNetAmount() >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        ${calculateNetAmount().toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    This is the amount that will be {data.type === 'purchase' ? 'deducted from' : 'added to'} the user's balance
                                </p>
                            </div>
                        )}

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Status *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {statuses.map((status) => (
                                    <div
                                        key={status.value}
                                        className={`relative border rounded-lg p-3 cursor-pointer transition-colors ${data.status === status.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onClick={() => setData('status', status.value)}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status.value}
                                                checked={data.status === status.value}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {status.label}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {status.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-1" />
                                Description *
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter a description for this transaction..."
                                required
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                Provide a clear description of the reason for this transaction
                            </p>
                        </div>

                        {/* Warning Notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Important Notes
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Completed transactions will immediately affect the user's balance</li>
                                            <li>For purchase transactions, ensure the user has sufficient balance</li>
                                            <li>Manual transactions will be marked with "manual" gateway</li>
                                            <li>All transactions are logged and auditable</li>
                                            <li>Pending transactions can be approved/rejected later</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                        <Link
                            href={route('admin.transactions.index')}
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
                                    Create Transaction
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
