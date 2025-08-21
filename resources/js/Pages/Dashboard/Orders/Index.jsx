// File: resources/js/Pages/Dashboard/Orders/Index.jsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    ShoppingBag,
    Eye,
    Download,
    Filter,
    Search,
    Calendar,
    Package,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    ExternalLink,
    ArrowRight,
    DollarSign
} from 'lucide-react';

export default function OrdersIndex({ orders, filters, stats, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters.payment_status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/dashboard/orders', {
            search: searchTerm,
            status: statusFilter,
            payment_status: paymentStatusFilter
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPaymentStatusFilter('');
        router.get('/dashboard/orders');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-amber-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Package className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'pending_delivery':
                return 'bg-amber-100 text-amber-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusBadgeClass = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <Head title="My Orders" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">Track and manage your digital product orders</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Orders"
                            value={stats.total_orders}
                            icon={ShoppingBag}
                            color="bg-blue-600"
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completed_orders}
                            icon={CheckCircle}
                            color="bg-green-600"
                        />
                        <StatCard
                            title="Pending"
                            value={stats.pending_orders}
                            icon={Clock}
                            color="bg-amber-600"
                        />
                        <StatCard
                            title="Total Spent"
                            value={`$${stats.total_spent}`}
                            icon={DollarSign}
                            color="bg-purple-600"
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Orders</h2>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Orders
                            </label>
                            <div className="relative">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Order number or product name"
                                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Payment Status</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Your Orders</h2>
                    </div>

                    {orders.data && orders.data.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {orders.data.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            {order.product.thumbnail && (
                                                <img
                                                    src={order.product.thumbnail}
                                                    alt={order.product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {order.product.name}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Order:</span> #{order.order_number}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Quantity:</span> {order.quantity}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Payment:</span>
                                                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {order.formatted_net_amount}
                                                </div>
                                                {order.discount_amount > 0 && (
                                                    <div className="text-sm text-green-600">
                                                        -{order.formatted_discount} discount
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Link>

                                                {/* Invoice Download - Available for all orders */}
                                                <Link
                                                    href={`/dashboard/orders/${order.id}/invoice`}
                                                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors flex items-center"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Invoice
                                                </Link>

                                                {/* Credentials Download - Only for completed orders */}
                                                {order.status === 'completed' && order.payment_status === 'paid' && !order.product.manual_delivery && (
                                                    <Link
                                                        href={`/dashboard/orders/${order.id}/download`}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Products
                                                    </Link>
                                                )}

                                                {order.payment_status === 'pending' && (
                                                    <Link
                                                        href={`/orders/${order.id}/payment`}
                                                        className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors flex items-center"
                                                    >
                                                        <CreditCard className="h-4 w-4 mr-1" />
                                                        Pay Now
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || statusFilter || paymentStatusFilter
                                    ? "No orders match your current filters."
                                    : "You haven't placed any orders yet."}
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Browse Products
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {orders.from} to {orders.to} of {orders.total} results
                            </div>
                            <div className="flex space-x-1">
                                {orders.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
