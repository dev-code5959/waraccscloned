// File: resources/js/Layouts/AppLayout.jsx

import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ShoppingBag,
    User,
    Search,
    Menu,
    X,
    Home,
    Wallet,
    ShoppingCart,
    MessageCircle,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';

export default function AppLayout({ children, title }) {
    const { auth, flash, navigationCategories } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
    ];

    const userNavigation = auth.user ? [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
        { name: 'Add Funds', href: '/dashboard/funds', icon: Wallet },
        { name: 'Support', href: '/dashboard/tickets', icon: MessageCircle },
        { name: 'Profile', href: '/dashboard/profile', icon: Settings },
    ] : [];

    // Function to handle category dropdown toggle
    const toggleCategoryDropdown = (categoryId) => {
        setActiveCategoryDropdown(activeCategoryDropdown === categoryId ? null : categoryId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-slate-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                            >
                                <img src="/assets/images/logo.png" alt="Logo" className="h-14" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {/* Category Dropdowns */}
                            {navigationCategories && navigationCategories.map((category) => (
                                <div key={category.id} className="relative">
                                    <button
                                        onClick={() => toggleCategoryDropdown(category.id)}
                                        className="flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                        onMouseEnter={() => setActiveCategoryDropdown(category.id)}
                                        onMouseLeave={() => setActiveCategoryDropdown(null)}
                                    >
                                        <span>{category.name}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    {activeCategoryDropdown === category.id && (
                                        <div
                                            className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50"
                                            onMouseEnter={() => setActiveCategoryDropdown(category.id)}
                                            onMouseLeave={() => setActiveCategoryDropdown(null)}
                                        >
                                            <div className="py-1">
                                                <Link
                                                    href={`/categories/${category.slug}`}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
                                                >
                                                    All {category.name}
                                                </Link>
                                                {category.children && category.children.length > 0 && (
                                                    <>
                                                        <hr className="my-1" />
                                                        {category.children.map((subcategory) => (
                                                            <Link
                                                                key={subcategory.id}
                                                                href={`/categories/${subcategory.slug}`}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                {subcategory.name}
                                                                <span className="text-gray-400 text-xs ml-1">
                                                                    ({subcategory.products_count})
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Search Link */}
                            <Link
                                href="/search"
                                className="flex items-center space-x-1 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                <Search className="h-4 w-4" />
                                <span>Search</span>
                            </Link>
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            {auth.user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <User className="h-5 w-5" />
                                        <span className="hidden md:block">{auth.user.name}</span>
                                        <span className="hidden md:block bg-green-600 text-white px-2 py-1 rounded text-xs">
                                            {auth.user.formatted_balance}
                                        </span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                            <div className="py-1">
                                                {userNavigation.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                                <hr className="my-1" />
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    <span>Sign out</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/login"
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden text-gray-300 hover:text-white"
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-700">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center space-x-2 text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Category Links */}
                            {navigationCategories && navigationCategories.map((category) => (
                                <div key={category.id} className="space-y-1">
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="flex items-center justify-between text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>{category.name}</span>
                                        <span className="text-xs text-gray-400">({category.products_count})</span>
                                    </Link>
                                    {category.children && category.children.length > 0 && (
                                        <div className="pl-6 space-y-1">
                                            {category.children.map((subcategory) => (
                                                <Link
                                                    key={subcategory.id}
                                                    href={`/categories/${subcategory.slug}`}
                                                    className="flex items-center justify-between text-gray-400 hover:text-white px-3 py-1 rounded-md text-sm"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <span>{subcategory.name}</span>
                                                    <span className="text-xs text-gray-500">({subcategory.products_count})</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Mobile Search */}
                            <Link
                                href="/search"
                                className="flex items-center space-x-2 text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Search className="h-4 w-4" />
                                <span>Search</span>
                            </Link>

                            {auth.user && (
                                <>
                                    <hr className="my-2 border-slate-600" />
                                    {userNavigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center space-x-2 text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

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

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/assets/images/logo.png" alt="Logo" className="h-14" />
                            </div>
                            <p className="text-gray-400 mb-4">
                                Your trusted marketplace for digital products. Fast delivery, secure payments, and excellent customer support.
                            </p>
                            <div className="flex space-x-4">
                                <span className="text-green-400 text-sm">✓ Instant Delivery</span>
                                <span className="text-green-400 text-sm">✓ Secure Payments</span>
                                <span className="text-green-400 text-sm">✓ 24/7 Support</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                                <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Categories</Link></li>
                                <li><Link href="/search" className="text-gray-400 hover:text-white transition-colors">Search</Link></li>
                                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} WarAccounts.com</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
