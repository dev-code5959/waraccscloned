// File: resources/js/Pages/Dashboard/Tickets/Index.jsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import {
    Search,
    Filter,
    Plus,
    MessageCircle,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function TicketsIndex({
    tickets,
    stats,
    filters,
    filter_options
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dashboard.tickets.index'), {
            ...filters,
            search: searchTerm,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters };

        if (value === '') {
            delete newFilters[filterType];
        } else {
            newFilters[filterType] = value;
        }

        router.get(route('dashboard.tickets.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        router.get(route('dashboard.tickets.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
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

    const activeFiltersCount = Object.keys(filters).filter(key => filters[key] && key !== 'page').length;

    return (
        <DashboardLayout>
            <Head title="Support Tickets" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Support Tickets</h1>
                            <p className="text-orange-100">
                                Get help with your orders, account, or any questions
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('dashboard.tickets.create')}
                                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Ticket
                            </Link>
                            <div className="hidden md:block">
                                <MessageCircle className="h-16 w-16 text-orange-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Tickets"
                        value={stats.total_tickets}
                        icon={MessageCircle}
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Open Tickets"
                        value={stats.open_tickets}
                        icon={AlertCircle}
                        color="bg-orange-600"
                    />
                    <StatCard
                        title="Closed Tickets"
                        value={stats.closed_tickets}
                        icon={CheckCircle}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Pending Reply"
                        value={stats.pending_reply}
                        icon={Clock}
                        color="bg-purple-600"
                    />
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search tickets..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </form>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${showFilters || activeFiltersCount > 0
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Statuses</option>
                                            {Object.entries(filter_options.statuses).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={filters.priority || ''}
                                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Priorities</option>
                                            {Object.entries(filter_options.priorities).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {activeFiltersCount > 0 && (
                                    <div className="mt-4">
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tickets List */}
                    <div className="divide-y divide-gray-200">
                        {tickets.data && tickets.data.length > 0 ? (
                            tickets.data.map((ticket) => (
                                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="font-medium text-gray-900">
                                                    {ticket.subject}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status_badge_class}`}>
                                                    {ticket.status_display}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.priority_badge_class}`}>
                                                    {ticket.priority_display}
                                                </span>
                                                {ticket.unread_messages > 0 && (
                                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                        {ticket.unread_messages} new
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {ticket.ticket_number}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Created {ticket.created_at_human}
                                                </span>
                                                {ticket.latest_message_at && (
                                                    <span className="flex items-center">
                                                        <MessageCircle className="h-3 w-3 mr-1" />
                                                        Last reply {ticket.latest_message_at}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Link
                                            href={route('dashboard.tickets.show', ticket.id)}
                                            className="ml-4 flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg font-medium mb-2">No tickets found</p>
                                <p className="text-sm mb-4">
                                    {activeFiltersCount > 0
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Create your first support ticket to get help with your account.'
                                    }
                                </p>
                                <Link
                                    href={route('dashboard.tickets.create')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Ticket
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {tickets.data && tickets.data.length > 0 && (tickets.prev_page_url || tickets.next_page_url) && (
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {tickets.prev_page_url && (
                                        <Link
                                            href={tickets.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {tickets.next_page_url && (
                                        <Link
                                            href={tickets.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">{tickets.from || 0}</span>
                                            {' '}to{' '}
                                            <span className="font-medium">{tickets.to || 0}</span>
                                            {' '}of{' '}
                                            <span className="font-medium">{tickets.total || 0}</span>
                                            {' '}results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {tickets.prev_page_url && (
                                                <Link
                                                    href={tickets.prev_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}
                                            {tickets.next_page_url && (
                                                <Link
                                                    href={tickets.next_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
