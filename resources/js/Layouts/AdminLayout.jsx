// File: resources/js/Layouts/AdminLayout.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    CreditCard,
    MessageCircle,
    Tag,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    Bell,
    Shield,
    Check,
    Clock,
    ShoppingBag,
    AlertCircle,
    UserCheck
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { auth, flash } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Initial notification count fetch
    useEffect(() => {
        fetchNotificationCount();
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const response = await fetch(route('api.notifications'));
            const data = await response.json();
            setNotificationCount(data.unread_count ?? 0);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
            setNotificationCount(0);
        }
    };

    const fetchNotifications = async () => {
        if (isLoadingNotifications) return;

        setIsLoadingNotifications(true);
        try {
            const response = await fetch(route('api.notifications'));
            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const handleNotificationClick = async () => {
        setShowNotifications(!showNotifications);

        if (!showNotifications && notifications.length === 0) {
            await fetchNotifications();
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(route('api.notifications.mark-read', notificationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            // Update local state
            setNotifications(notifications.map(notif =>
                notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif
            ));

            // Update notification count
            if (notificationCount > 0) {
                setNotificationCount(prev => prev - 1);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(route('api.notifications.mark-all-read'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            // Update local state
            setNotifications(notifications.map(notif => ({ ...notif, read_at: new Date().toISOString() })));
            setNotificationCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_confirmed':
            case 'order_completed':
            case 'new_order':
                return <ShoppingBag className="h-5 w-5 text-blue-600" />;
            case 'payment_received':
            case 'funds_added':
                return <CreditCard className="h-5 w-5 text-green-600" />;
            case 'ticket_created':
            case 'ticket_replied':
                return <MessageCircle className="h-5 w-5 text-yellow-600" />;
            case 'new_user':
            case 'user_registered':
                return <UserCheck className="h-5 w-5 text-purple-600" />;
            case 'system_alert':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Tag },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
        { name: 'Support', href: '/admin/support', icon: MessageCircle },
        { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
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
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Admin Info */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-sm text-red-600 truncate">
                                Administrator
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = window.location.pathname === item.href ||
                                window.location.pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-red-50 text-red-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="border-t border-gray-200 mt-6 pt-6">
                        <Link
                            href="/dashboard"
                            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            User Dashboard
                        </Link>
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
            <div className="w-full max-w-[calc(100vw-256px)]">
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
                            {/* Notifications Dropdown */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={handleNotificationClick}
                                    className="text-gray-500 hover:text-gray-700 relative focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-2"
                                >
                                    <Bell className="h-6 w-6" />
                                    {notificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                            {notificationCount > 99 ? '99+' : notificationCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-gray-900">Admin Notifications</h3>
                                                {notificationCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {isLoadingNotifications ? (
                                                <div className="p-4 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                                                    <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200">
                                                    {notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read_at ? 'bg-red-50' : ''
                                                                }`}
                                                            onClick={() => {
                                                                if (!notification.read_at) {
                                                                    markAsRead(notification.id);
                                                                }
                                                                // Navigate to relevant admin page if needed
                                                                if (notification.data?.url) {
                                                                    window.location.href = notification.data.url;
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0 mt-1">
                                                                    {getNotificationIcon(notification.type)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                                            {notification.data?.title || 'Admin Notification'}
                                                                        </p>
                                                                        {!notification.read_at && (
                                                                            <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 ml-2"></div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {notification.data?.message || notification.data?.body || 'New admin notification'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {getTimeAgo(notification.created_at)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {notifications.length > 0 && (
                                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                                <Link
                                                    href="/admin/notifications"
                                                    className="block text-center text-sm text-red-600 hover:text-red-800 font-medium"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    View all notifications
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Admin badge */}
                            <div className="hidden sm:block">
                                <div className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                                    <Shield className="h-4 w-4" />
                                    <span>Admin Access</span>
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
