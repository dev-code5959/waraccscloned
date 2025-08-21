// File: resources/js/Pages/Admin/Reports/Index.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    MessageCircle,
    Download,
    Calendar,
    Filter,
    Eye,
    FileText,
    Package,
    CreditCard
} from 'lucide-react';

export default function Index({ quickStats, chartData, recentActivity, period }) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        router.get(route('admin.reports.index'), { period: newPeriod });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    const getChangeIcon = (current, previous) => {
        const change = calculatePercentageChange(current, previous);
        return change >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
        );
    };

    const getChangeColor = (current, previous) => {
        const change = calculatePercentageChange(current, previous);
        return change >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const periods = [
        { value: '7', label: 'Last 7 days' },
        { value: '30', label: 'Last 30 days' },
        { value: '90', label: 'Last 90 days' },
        { value: '365', label: 'Last year' }
    ];

    const reportTypes = [
        {
            title: 'Sales Report',
            description: 'Comprehensive sales data and revenue analytics',
            icon: DollarSign,
            color: 'bg-green-500',
            href: route('admin.reports.sales')
        },
        {
            title: 'Users Report',
            description: 'User registrations, activity, and demographics',
            icon: Users,
            color: 'bg-blue-500',
            href: route('admin.reports.users')
        },
        {
            title: 'Products Report',
            description: 'Product performance and inventory analytics',
            icon: Package,
            color: 'bg-purple-500',
            href: route('admin.reports.products')
        },
        {
            title: 'Transactions Report',
            description: 'Payment transactions and financial data',
            icon: CreditCard,
            color: 'bg-orange-500',
            href: route('admin.reports.transactions')
        },
        {
            title: 'Support Report',
            description: 'Customer support tickets and resolution times',
            icon: MessageCircle,
            color: 'bg-red-500',
            href: route('admin.reports.support')
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="text-gray-600">Comprehensive business insights and downloadable reports</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            {periods.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        <dd className="text-lg font-medium text-gray-900">
                                            {formatCurrency(quickStats.revenue.current)}
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
                                    <MessageCircle className="h-6 w-6 text-orange-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Support Tickets
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">
                                                {quickStats.support_tickets.current.toLocaleString()}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Types */}
                {/* <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Available Reports</h3>
                        <p className="text-sm text-gray-500 mt-1">Generate detailed reports for different aspects of your business</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reportTypes.map((report, index) => (
                                <Link
                                    key={index}
                                    href={report.href}
                                    className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`flex-shrink-0 w-10 h-10 ${report.color} rounded-lg flex items-center justify-center`}>
                                            <report.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                                                {report.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {report.description}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div> */}

                {/* Quick Export Options */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Quick Export</h3>
                        <p className="text-sm text-gray-500 mt-1">Download reports for the current period</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button
                                onClick={() => window.open(route('admin.reports.sales', { format: 'csv' }), '_blank')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Sales (CSV)
                            </button>
                            <button
                                onClick={() => window.open(route('admin.reports.users', { format: 'csv' }), '_blank')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Users (CSV)
                            </button>
                            <button
                                onClick={() => window.open(route('admin.reports.products', { format: 'csv' }), '_blank')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Products (CSV)
                            </button>
                            <button
                                onClick={() => window.open(route('admin.reports.transactions', { format: 'csv' }), '_blank')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Transactions (CSV)
                            </button>
                            <button
                                onClick={() => window.open(route('admin.reports.support', { format: 'csv' }), '_blank')}
                                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Support (CSV)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {recentActivity.recent_orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                #{order.order_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.user?.name} • {order.product?.name}
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link
                                    href={route('admin.reports.sales')}
                                    className="text-sm text-blue-600 hover:text-blue-900"
                                >
                                    View sales report →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {recentActivity.recent_users.slice(0, 5).map((user) => (
                                    <div key={user.id} className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(user.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link
                                    href={route('admin.reports.users')}
                                    className="text-sm text-blue-600 hover:text-blue-900"
                                >
                                    View users report →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Tickets */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {recentActivity.recent_tickets.slice(0, 5).map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {ticket.subject}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {ticket.user?.name} • {formatDate(ticket.created_at)}
                                            </div>
                                        </div>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {ticket.priority}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link
                                    href={route('admin.reports.support')}
                                    className="text-sm text-blue-600 hover:text-blue-900"
                                >
                                    View support report →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
