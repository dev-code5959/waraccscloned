// File: resources/js/Pages/Admin/Users/Index.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Edit,
    Eye,
    UserX,
    UserCheck,
    DollarSign,
    Calendar,
    Mail,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    Download
} from 'lucide-react';

export default function Index({ users, stats, roles, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(route('admin.users.index'), {
            search: searchTerm,
            role: selectedRole,
            status: selectedStatus,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.users.index'));
    };

    const handleSort = (field) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.users.index'), {
            ...filters,
            sort: field,
            direction: direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getUserStatusBadge = (user) => {
        if (!user.is_active) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Suspended
                </span>
            );
        }
        if (!user.email_verified_at) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Unverified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
            </span>
        );
    };

    const getRoleBadge = (roles) => {
        if (!roles || roles.length === 0) return null;

        const role = roles[0];
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            customer: 'bg-blue-100 text-blue-800',
            support: 'bg-gray-100 text-gray-800',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role.name] || 'bg-gray-100 text-gray-800'}`}>
                <Shield className="w-3 h-3 mr-1" />
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
                    </div>
                    <Link
                        href={route('admin.users.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New User
                    </Link>
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
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total_users.toLocaleString()}
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
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Active Users
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.active_users.toLocaleString()}
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
                                            Total Balance
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {formatCurrency(stats.total_balance)}
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
                                    <Calendar className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            New Today
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.new_users_today}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search users by name, email, or referral code..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Search
                                </button>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="">All Roles</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>
                                                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>
                            )}

                            {(searchTerm || selectedRole || selectedStatus || dateFrom || dateTo) && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-gray-600 hover:text-gray-900 text-sm"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        User
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('email')}
                                    >
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role & Status
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('balance')}
                                    >
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-800">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.email}
                                            </div>
                                            {user.referral_code && (
                                                <div className="text-sm text-gray-500">
                                                    Ref: {user.referral_code}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {getRoleBadge(user.roles)}
                                                {getUserStatusBadge(user)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(user.balance)}
                                            </div>
                                            {user.referral_earnings > 0 && (
                                                <div className="text-sm text-green-600">
                                                    +{formatCurrency(user.referral_earnings)} referral
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{user.orders_count} orders</div>
                                            <div>{user.transactions_count} transactions</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={route('admin.users.show', user.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('admin.users.edit', user.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Edit User"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                {user.is_active ? (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to suspend this user?')) {
                                                                router.post(route('admin.users.suspend', user.id), {
                                                                    reason: 'Suspended by admin'
                                                                });
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Suspend User"
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to activate this user?')) {
                                                                router.post(route('admin.users.activate', user.id));
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Activate User"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {users.prev_page_url && (
                                    <Link
                                        href={users.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {users.next_page_url && (
                                    <Link
                                        href={users.next_page_url}
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
                                        <span className="font-medium">{users.from}</span>
                                        {' '}to{' '}
                                        <span className="font-medium">{users.to}</span>
                                        {' '}of{' '}
                                        <span className="font-medium">{users.total}</span>
                                        {' '}results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {users.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : link.url
                                                            ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                    } ${index === 0 ? 'rounded-l-md' : ''
                                                    } ${index === users.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {users.data.length === 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || selectedRole || selectedStatus
                                    ? 'Try adjusting your search criteria.'
                                    : 'Get started by creating a new user.'
                                }
                            </p>
                            {!searchTerm && !selectedRole && !selectedStatus && (
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.users.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New User
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
