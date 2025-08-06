// File: resources/js/Layouts/DashboardLayout.jsx

import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    ShoppingCart,
    Wallet,
    MessageCircle,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    Bell,
    Users,
    BarChart3
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { auth, flash } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
        { name: 'Add Funds', href: '/dashboard/funds', icon: Wallet },
        { name: 'Transactions', href: '/dashboard/transactions', icon: BarChart3 },
        { name: 'Support Tickets', href: '/dashboard/tickets', icon: MessageCircle },
        { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
        { name: 'Profile', href: '/dashboard/profile', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">ACCSZone</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                                {auth.user.formatted_balance}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = window.location.pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-200 mt-6 pt-6">
                        <Link
                            href="/"
                            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Back to Store
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="group flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 hover:text-red-900 transition-colors w-full text-left"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                            Sign Out
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="w-full">
                {/* Top bar */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex items-center space-x-4 ml-auto">
                            {/* Notifications */}
                            <button className="text-gray-500 hover:text-gray-700 relative">
                                <Bell className="h-6 w-6" />
                                {/* Notification badge */}
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            {/* Quick balance display */}
                            <div className="hidden sm:block">
                                <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Balance: {auth.user.formatted_balance}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="bg-green-500 text-white p-4 text-center">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="bg-red-500 text-white p-4 text-center">
                        {flash.error}
                    </div>
                )}

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
