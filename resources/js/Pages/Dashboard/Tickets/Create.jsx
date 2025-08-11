// File: resources/js/Pages/Dashboard/Tickets/Create.jsx

import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    ArrowLeft,
    MessageCircle,
    ShoppingBag,
    AlertTriangle,
    Info
} from 'lucide-react';

export default function TicketsCreate({
    recent_orders,
    categories,
    priorities
}) {
    const [selectedOrder, setSelectedOrder] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        category: '',
        priority: 'medium',
        message: '',
        order_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.tickets.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleOrderSelect = (orderId) => {
        setSelectedOrder(orderId);
        setData('order_id', orderId);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-gray-600',
            medium: 'text-blue-600',
            high: 'text-orange-600',
            urgent: 'text-red-600',
        };
        return colors[priority] || 'text-gray-600';
    };

    const getCategoryDescription = (category) => {
        const descriptions = {
            order_issue: 'Problems with your order, delivery, or credentials',
            payment_issue: 'Payment problems, refunds, or billing questions',
            account_issue: 'Account access, balance, or security concerns',
            product_issue: 'Issues with specific products or their quality',
            billing_issue: 'Invoice questions or payment disputes',
            technical_issue: 'Website bugs or technical difficulties',
            general_inquiry: 'General questions about our services',
            feature_request: 'Suggestions for new features or improvements',
            other: 'Any other questions or concerns',
        };
        return descriptions[category] || '';
    };

    return (
        <DashboardLayout>
            <Head title="Create Support Ticket" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('dashboard.tickets.index')}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Support Ticket</h1>
                        <p className="text-gray-600">Get help with your account, orders, or any questions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2" />
                                    Ticket Details
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Brief description of your issue"
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {Object.entries(categories).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    {data.category && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {getCategoryDescription(data.category)}
                                        </p>
                                    )}
                                    {errors.category && (
                                        <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                                    )}
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {Object.entries(priorities).map(([key, label]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setData('priority', key)}
                                                className={`p-3 border rounded-lg text-center transition-all ${data.priority === key
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className={`font-medium ${getPriorityColor(key)}`}>
                                                    {label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.priority && (
                                        <p className="text-red-600 text-sm mt-1">{errors.priority}</p>
                                    )}
                                </div>

                                {/* Related Order */}
                                {recent_orders.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Related Order (Optional)
                                        </label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            <button
                                                type="button"
                                                onClick={() => handleOrderSelect('')}
                                                className={`w-full p-3 border rounded-lg text-left transition-all ${selectedOrder === ''
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium">No related order</div>
                                                <div className="text-sm text-gray-600">
                                                    General inquiry not related to a specific order
                                                </div>
                                            </button>
                                            {recent_orders.map((order) => (
                                                <button
                                                    key={order.id}
                                                    type="button"
                                                    onClick={() => handleOrderSelect(order.id.toString())}
                                                    className={`w-full p-3 border rounded-lg text-left transition-all ${selectedOrder === order.id.toString()
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{order.product_name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {order.order_number} • {order.created_at_human}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {errors.order_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.order_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        rows={6}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Please describe your issue in detail. Include any relevant information that might help us assist you."
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Minimum 10 characters required
                                    </p>
                                    {errors.message && (
                                        <p className="text-red-600 text-sm mt-1">{errors.message}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Create Ticket
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href={route('dashboard.tickets.index')}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tips */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                                <Info className="h-5 w-5 mr-2" />
                                Tips for Better Support
                            </h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                    <span>Be specific about your issue</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                    <span>Include order numbers when relevant</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                    <span>Provide screenshots if helpful</span>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                    <span>Use appropriate priority levels</span>
                                </div>
                            </div>
                        </div>

                        {/* Response Times */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Expected Response Times
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-red-600 font-medium">Urgent:</span>
                                    <span className="text-gray-600">Within 1 hour</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-600 font-medium">High:</span>
                                    <span className="text-gray-600">Within 4 hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600 font-medium">Medium:</span>
                                    <span className="text-gray-600">Within 24 hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Low:</span>
                                    <span className="text-gray-600">Within 48 hours</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Alternative Contact Methods
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>For urgent issues, you can also reach us at:</p>
                                <div className="space-y-1">
                                    <div>📧 support@accszone.com</div>
                                    <div>💬 Live chat (business hours)</div>
                                    <div>📱 Telegram: @ACCSZoneSupport</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
