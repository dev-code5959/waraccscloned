// File: resources/js/Pages/Admin/Support/Show.jsx

import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MessageCircle,
    User,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Send,
    Paperclip,
    Download,
    Eye,
    UserCheck,
    Tag,
    Calendar,
    Hash,
    Package,
    MessageSquare
} from 'lucide-react';

export default function Show({ ticket, staffUsers }) {
    const [replyMessage, setReplyMessage] = useState('');
    const [replyStatus, setReplyStatus] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const { data: assignData, setData: setAssignData, post: postAssign, processing: assignProcessing } = useForm({
        assigned_to: ticket.assigned_to || '',
    });

    const { data: statusData, setData: setStatusData, post: postStatus, processing: statusProcessing } = useForm({
        status: ticket.status,
    });

    const { data: priorityData, setData: setPriorityData, post: postPriority, processing: priorityProcessing } = useForm({
        priority: ticket.priority,
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            open: { class: 'bg-blue-100 text-blue-800', icon: MessageCircle },
            in_progress: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            waiting_response: { class: 'bg-orange-100 text-orange-800', icon: MessageSquare },
            resolved: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
            closed: { class: 'bg-gray-100 text-gray-800', icon: XCircle }
        };

        const badge = badges[status] || badges.open;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            low: { class: 'bg-gray-100 text-gray-800' },
            medium: { class: 'bg-blue-100 text-blue-800' },
            high: { class: 'bg-orange-100 text-orange-800' },
            urgent: { class: 'bg-red-100 text-red-800' }
        };

        const badge = badges[priority] || badges.medium;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    const handleAssign = (e) => {
        e.preventDefault();
        postAssign(route('admin.support.assign', ticket.id));
    };

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        postStatus(route('admin.support.status', ticket.id));
    };

    const handlePriorityUpdate = (e) => {
        e.preventDefault();
        postPriority(route('admin.support.priority', ticket.id));
    };

    const handleReply = (e) => {
        e.preventDefault();

        if (!replyMessage.trim()) {
            return;
        }

        const formData = new FormData();
        formData.append('message', replyMessage);
        if (replyStatus) {
            formData.append('status', replyStatus);
        }

        selectedFiles.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        router.post(route('admin.support.reply', ticket.id), formData, {
            onSuccess: () => {
                setReplyMessage('');
                setReplyStatus('');
                setSelectedFiles([]);
            }
        });
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const statuses = [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'waiting_response', label: 'Waiting Response' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.support.index')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Support
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Support Ticket</h1>
                            <p className="text-gray-600">Ticket: {ticket.ticket_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Conversation */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Details */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Created {formatDate(ticket.created_at)}</span>
                                    {ticket.resolved_at && (
                                        <span>Resolved {formatDate(ticket.resolved_at)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Conversation</h3>
                            </div>
                            <div className="px-6 py-4 max-h-96 overflow-y-auto">
                                <div className="space-y-4">
                                    {ticket.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.is_staff_reply ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.is_staff_reply
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}>
                                                <div className="text-sm">
                                                    <div className="font-medium mb-1">
                                                        {message.user.name}
                                                        {message.is_staff_reply && (
                                                            <span className="ml-1 text-blue-200 text-xs">(Staff)</span>
                                                        )}
                                                    </div>
                                                    <p className="whitespace-pre-wrap">{message.message}</p>

                                                    {message.attachments && message.attachments.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {message.attachments.map((attachment, index) => (
                                                                <div key={index} className="flex items-center space-x-2 text-xs">
                                                                    <Paperclip className="w-3 h-3" />
                                                                    <span>{attachment.name}</span>
                                                                    <a
                                                                        href={attachment.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="hover:underline"
                                                                    >
                                                                        <Download className="w-3 h-3" />
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className={`text-xs mt-1 ${message.is_staff_reply ? 'text-blue-200' : 'text-gray-500'
                                                        }`}>
                                                        {formatDate(message.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reply Section */}
                        {!['resolved', 'closed'].includes(ticket.status) && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Reply to Ticket</h3>
                                </div>
                                <div className="px-6 py-4 space-y-4">
                                    <div>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            rows="4"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Type your reply..."
                                            required
                                        />
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Attachments (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {selectedFiles.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Update */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Update Status (Optional)
                                        </label>
                                        <select
                                            value={replyStatus}
                                            onChange={(e) => setReplyStatus(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="">Keep current status</option>
                                            {statuses.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyMessage.trim()}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                {/* Status Update */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={statusData.status}
                                        onChange={(e) => setStatusData('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={statusProcessing || statusData.status === ticket.status}
                                        className="mt-2 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Update Status
                                    </button>
                                </div>

                                {/* Priority Update */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={priorityData.priority}
                                        onChange={(e) => setPriorityData('priority', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        {priorities.map((priority) => (
                                            <option key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handlePriorityUpdate}
                                        disabled={priorityProcessing || priorityData.priority === ticket.priority}
                                        className="mt-2 w-full px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Update Priority
                                    </button>
                                </div>

                                {/* Assignment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assign To
                                    </label>
                                    <select
                                        value={assignData.assigned_to}
                                        onChange={(e) => setAssignData('assigned_to', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">Unassigned</option>
                                        {staffUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        disabled={assignProcessing || assignData.assigned_to == ticket.assigned_to}
                                        className="mt-2 w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Assign Ticket
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Ticket Information</h3>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Ticket Number</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {ticket.ticket_number}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Created</div>
                                        <div className="text-sm text-gray-900">
                                            {formatDate(ticket.created_at)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Last Updated</div>
                                        <div className="text-sm text-gray-900">
                                            {formatDate(ticket.updated_at)}
                                        </div>
                                    </div>
                                </div>

                                {ticket.resolved_at && (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Resolved</div>
                                            <div className="text-sm text-gray-900">
                                                {formatDate(ticket.resolved_at)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <MessageCircle className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Messages</div>
                                        <div className="text-sm text-gray-900">
                                            {ticket.messages ? ticket.messages.length : 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                            </div>
                            <div className="px-6 py-4">
                                {ticket.user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {ticket.user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {ticket.user.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Link
                                                href={route('admin.users.show', ticket.user.id)}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View User Profile
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">User information not available</div>
                                )}
                            </div>
                        </div>

                        {/* Related Order */}
                        {ticket.order && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Related Order</h3>
                                </div>
                                <div className="px-6 py-4 space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Package className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm text-gray-500">Order Number</div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {ticket.order.order_number}
                                            </div>
                                        </div>
                                    </div>

                                    {ticket.order.product && (
                                        <div className="flex items-center space-x-2">
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Product</div>
                                                <div className="text-sm text-gray-900">
                                                    {ticket.order.product.name}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Link
                                            href={route('admin.orders.show', ticket.order.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Order
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Assignment Information */}
                        {ticket.assigned_user && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Assigned Staff</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <UserCheck className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {ticket.assigned_user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Staff Member
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
