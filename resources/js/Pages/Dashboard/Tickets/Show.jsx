// File: resources/js/Pages/Dashboard/Tickets/Show.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    ArrowLeft,
    MessageCircle,
    Send,
    User,
    Shield,
    Calendar,
    ShoppingBag,
    X,
    CheckCircle
} from 'lucide-react';

export default function TicketsShow({
    ticket,
    related_order,
    messages,
    can_reply
}) {
    const [isClosing, setIsClosing] = useState(false);
    const messagesEndRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dashboard.tickets.message', ticket.id), {
            onSuccess: () => {
                reset();
                scrollToBottom();
            },
        });
    };

    const handleClose = () => {
        if (confirm('Are you sure you want to close this ticket? You won\'t be able to add new messages after closing.')) {
            setIsClosing(true);
            router.post(route('dashboard.tickets.close', ticket.id), {}, {
                onFinish: () => setIsClosing(false),
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Ticket ${ticket.ticket_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('dashboard.tickets.index')}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {ticket.subject}
                            </h1>
                            <p className="text-gray-600">
                                Ticket #{ticket.ticket_number}
                            </p>
                        </div>
                    </div>

                    {can_reply && ticket.status !== 'closed' && (
                        <button
                            onClick={handleClose}
                            disabled={isClosing}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {isClosing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                    Closing...
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 mr-2" />
                                    Close Ticket
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Messages */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2" />
                                    Conversation
                                </h2>
                            </div>

                            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                                {messages.map((message, index) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`flex max-w-3xl ${message.is_admin_reply ? 'flex-row' : 'flex-row-reverse'}`}>
                                            {/* Avatar */}
                                            <div className={`flex-shrink-0 ${message.is_admin_reply ? 'mr-3' : 'ml-3'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.is_admin_reply
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-300 text-gray-600'
                                                    }`}>
                                                    {message.is_admin_reply ? (
                                                        <Shield className="h-4 w-4" />
                                                    ) : (
                                                        <User className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className={`flex-1 ${message.is_admin_reply ? 'text-left' : 'text-right'}`}>
                                                <div className={`inline-block max-w-full p-4 rounded-lg ${message.is_admin_reply
                                                        ? 'bg-blue-50 text-blue-900'
                                                        : 'bg-gray-100 text-gray-900'
                                                    }`}>
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="font-medium text-sm">
                                                            {message.is_admin_reply ? 'Support Team' : message.user.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {message.created_at_formatted}
                                                        </span>
                                                    </div>
                                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                        {message.message}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Form */}
                            {can_reply ? (
                                <div className="p-6 border-t border-gray-200">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Add Reply
                                            </label>
                                            <textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                rows={4}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Type your message here..."
                                                required
                                            />
                                            {errors.message && (
                                                <p className="text-red-600 text-sm mt-1">{errors.message}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500">
                                                Your reply will be sent to our support team
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={processing || !data.message.trim()}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send Reply
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-center text-gray-500">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        <span>This ticket has been closed. No new messages can be added.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ticket Details */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Ticket Details</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="text-gray-600">Status:</label>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status_badge_class}`}>
                                            {ticket.status_display}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-600">Priority:</label>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.priority_badge_class}`}>
                                            {ticket.priority_display}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-600">Category:</label>
                                    <div className="mt-1 text-gray-900">
                                        {ticket.category_display}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-600">Created:</label>
                                    <div className="mt-1 text-gray-900 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {ticket.created_at_formatted}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-600">Last Updated:</label>
                                    <div className="mt-1 text-gray-900">
                                        {ticket.updated_at_human || 'Never'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Order */}
                        {related_order && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Related Order
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="text-gray-600">Order Number:</label>
                                        <div className="mt-1 font-mono text-gray-900">
                                            {related_order.order_number}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-600">Product:</label>
                                        <div className="mt-1 text-gray-900">
                                            {related_order.product_name}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-600">Total:</label>
                                        <div className="mt-1 text-gray-900">
                                            {related_order.formatted_total}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-600">Status:</label>
                                        <div className="mt-1">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                                {related_order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('dashboard.orders.show', related_order.id)}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        View Order Details
                                        <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Help */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">Need More Help?</h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <p>If you need immediate assistance, you can also:</p>
                                <div className="space-y-1">
                                    <div>📧 Email: support@waraccounts.com</div>
                                    <div>💬 Live Chat (business hours)</div>
                                    <div>📱 Telegram: @WarAccountsSupport</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
