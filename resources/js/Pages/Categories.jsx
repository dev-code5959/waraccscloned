// File: resources/js/Pages/Categories.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    Package,
    Mail,
    ShoppingBag,
    ArrowRight,
    Grid,
    Users,
    TrendingUp,
    Star,
    ChevronRight
} from 'lucide-react';

export default function Categories({ categories, stats, meta }) {
    const getCategoryIcon = (category) => {
        // You can customize icons based on category names or add an icon field
        const iconMap = {
            'gmail': Mail,
            'facebook': Users,
            'instagram': Users,
            'twitter': Users,
            'linkedin': Users,
            'youtube': Users,
            'discord': Users,
            'social': Users,
        };

        const IconComponent = iconMap[category.name.toLowerCase()] || Package;
        return <IconComponent className="h-8 w-8" />;
    };

    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-blue-600 rounded-full p-4">
                                <Grid className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Browse Categories
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Discover our wide range of digital products. From verified accounts to premium services,
                            find exactly what you need with instant delivery and secure payments.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="text-3xl font-bold text-blue-400">{stats.total_categories}</div>
                                <div className="text-sm text-gray-300">Categories</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="text-3xl font-bold text-green-400">{stats.total_products}</div>
                                <div className="text-sm text-gray-300">Products</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="text-3xl font-bold text-orange-400">{stats.in_stock_products}</div>
                                <div className="text-sm text-gray-300">In Stock</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <div key={category.id} className="group">
                                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                                    {/* Category Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 group-hover:bg-blue-200 rounded-lg p-3 transition-colors">
                                                    <div className="text-blue-600">
                                                        {getCategoryIcon(category)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {category.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {category.products_count} products available
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </div>

                                        {category.description && (
                                            <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Subcategories */}
                                    {category.children && category.children.length > 0 && (
                                        <div className="p-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Popular Types:
                                            </h4>
                                            <div className="space-y-2">
                                                {category.children.slice(0, 4).map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        href={`/categories/${child.slug}`}
                                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group/child"
                                                    >
                                                        <span className="text-sm text-gray-600 group-hover/child:text-gray-900">
                                                            {child.name}
                                                        </span>
                                                        <div className="flex items-center text-xs text-gray-400">
                                                            <span>{child.products_count}</span>
                                                            <ChevronRight className="h-3 w-3 ml-1 group-hover/child:translate-x-0.5 transition-transform" />
                                                        </div>
                                                    </Link>
                                                ))}
                                                {category.children.length > 4 && (
                                                    <div className="text-xs text-gray-500 pt-2">
                                                        +{category.children.length - 4} more types
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Link */}
                                    <div className="px-6 pb-6">
                                        <Link
                                            href={`/categories/${category.slug}`}
                                            className="block w-full bg-gray-900 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-medium transition-colors"
                                        >
                                            Browse {category.name}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Categories CTA */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-4">
                                    Can't Find What You're Looking For?
                                </h2>
                                <p className="text-blue-100 mb-6 text-lg">
                                    Use our powerful search to find specific products, or contact our support team
                                    for custom requests and bulk orders.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href="/search"
                                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                                    >
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        Search Products
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                                    >
                                        Contact Support
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                        <Star className="h-8 w-8 text-yellow-400 mb-2" />
                                        <div className="text-sm">Premium Quality</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                        <ShoppingBag className="h-8 w-8 text-green-400 mb-2" />
                                        <div className="text-sm">Instant Delivery</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                        <Package className="h-8 w-8 text-blue-400 mb-2" />
                                        <div className="text-sm">Secure Payments</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                        <Users className="h-8 w-8 text-purple-400 mb-2" />
                                        <div className="text-sm">24/7 Support</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
