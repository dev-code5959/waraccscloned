// File: resources/js/Pages/Admin/Dashboard.jsx

import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Clock,
    Activity
} from 'lucide-react';

export default function Dashboard({
    stats,
    revenueData,
    ordersByStatus,
    topProducts,
    recentOrders,
    recentUsers,
    lowStockProducts,
    outOfStockProducts
}) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getOrderStatusBadge = (status) => {
        const badges = {
            pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
            processing: { class: 'bg-blue-100 text-blue-800', icon: Activity },
            completed: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { class: 'bg-red-100 text-red-800', icon: AlertCircle },
            refunded: { class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Overview of your store performance and key metrics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Users className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Users
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {stats.total_users.toLocaleString()}
                                            </div>
                                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                                                <span className="sr-only">Increased by</span>
                                                {stats.new_users_today} today
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Products
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {stats.total_products}
                                            </div>
                                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                                {stats.active_products} active
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingCart className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Orders
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {stats.total_orders.toLocaleString()}
                                            </div>
                                            {stats.pending_orders > 0 && (
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
                                                    <Clock className="self-center flex-shrink-0 h-4 w-4 text-yellow-500" />
                                                    {stats.pending_orders} pending
                                                </div>
                                            )}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Revenue
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {formatCurrency(stats.total_revenue)}
                                            </div>
                                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                                                {formatCurrency(stats.revenue_today)} today
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {(stats.open_tickets > 0 || stats.pending_transactions > 0 || outOfStockProducts > 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Attention Required
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {stats.open_tickets > 0 && (
                                            <li>{stats.open_tickets} open support tickets need attention</li>
                                        )}
                                        {stats.pending_transactions > 0 && (
                                            <li>{stats.pending_transactions} pending transactions require review</li>
                                        )}
                                        {outOfStockProducts > 0 && (
                                            <li>{outOfStockProducts} products are out of stock</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                        </div>
                        <div className="p-6">
                            <div className="flow-root">
                                <ul className="-my-5 divide-y divide-gray-200">
                                    {recentOrders.slice(0, 5).map((order) => (
                                        <li key={order.id} className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        Order #{order.order_number}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {order.user?.name} - {order.product?.name}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    {getOrderStatusBadge(order.status)}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
                        </div>
                        <div className="p-6">
                            <div className="flow-root">
                                <ul className="-my-5 divide-y divide-gray-200">
                                    {recentUsers.slice(0, 5).map((user) => (
                                        <li key={user.id} className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-800">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products & Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
                        </div>
                        <div className="p-6">
                            <div className="flow-root">
                                <ul className="-my-5 divide-y divide-gray-200">
                                    {topProducts.map((product) => (
                                        <li key={product.id} className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {product.thumbnail ? (
                                                        <img
                                                            className="h-8 w-8 rounded object-cover"
                                                            src={product.thumbnail}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatCurrency(product.price)}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.total_sold || 0} sold
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Products */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
                        </div>
                        <div className="p-6">
                            {lowStockProducts.length > 0 ? (
                                <div className="flow-root">
                                    <ul className="-my-5 divide-y divide-gray-200">
                                        {lowStockProducts.map((product) => (
                                            <li key={product.id} className="py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {product.category?.name}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-medium text-red-600">
                                                        {product.stock_quantity} left
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
                                    <p className="mt-2 text-sm text-gray-500">All products are well stocked</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
