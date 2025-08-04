// File: resources/js/Pages/Homepage.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    Star,
    ShoppingBag,
    Users,
    Award,
    ArrowRight,
    TrendingUp,
    Package,
    Shield
} from 'lucide-react';

export default function Homepage({
    featuredProducts,
    categories,
    popularProducts,
    stats,
    meta
}) {
    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Premium Digital Products
                            <span className="block text-blue-400">Delivered Instantly</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Get verified accounts, digital licenses, and premium access codes with automatic delivery and secure crypto payments.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/categories"
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                            >
                                Browse Products
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/search"
                                className="border border-gray-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                            >
                                Search Products
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
                            <p className="text-gray-600">
                                Receive your digital products immediately after payment confirmation. No waiting, no delays.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                            <p className="text-gray-600">
                                Pay with cryptocurrency or account balance. All transactions are encrypted and secure.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Award className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                            <p className="text-gray-600">
                                All products are tested and verified. Get support if you encounter any issues.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {stats.total_products.toLocaleString()}
                            </div>
                            <div className="text-gray-600">Products Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {stats.total_sales.toLocaleString()}
                            </div>
                            <div className="text-gray-600">Products Sold</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                {stats.happy_customers.toLocaleString()}
                            </div>
                            <div className="text-gray-600">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                                {stats.total_categories}
                            </div>
                            <div className="text-gray-600">Categories</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover our most popular and trending digital products, handpicked for quality and reliability.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                                {product.thumbnail && (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <div className="text-sm text-blue-600 mb-1">{product.category.name}</div>
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-gray-900">{product.formatted_price}</span>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                            {product.sold_count} sold
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm px-2 py-1 rounded ${product.is_in_stock
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.is_in_stock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                        </span>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            href="/search"
                            className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Find exactly what you're looking for in our organized product categories.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
                            >
                                <div className="flex items-center mb-4">
                                    {category.icon && (
                                        <img src={category.icon} alt="" className="h-8 w-8 mr-3" />
                                    )}
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </h3>
                                </div>

                                {category.description && (
                                    <p className="text-gray-600 mb-4">{category.description}</p>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {category.products_count} products
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>

                                {category.children.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-2">
                                            {category.children.slice(0, 3).map((child) => (
                                                <span
                                                    key={child.id}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                                >
                                                    {child.name}
                                                </span>
                                            ))}
                                            {category.children.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{category.children.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Products */}
            {popularProducts.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Products</h2>
                            <p className="text-gray-600">
                                See what other customers are buying
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="flex items-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 group"
                                >
                                    {product.thumbnail && (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-lg mr-4"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                            {product.name}
                                        </h3>
                                        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900">{product.formatted_price}</span>
                                            <span className="text-sm text-gray-500">{product.sold_count} sold</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </AppLayout>
    );
}
