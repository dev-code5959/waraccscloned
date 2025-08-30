// File: resources/js/Pages/Categories.jsx

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
    Shield,
    Mail,
    CheckCircle
} from 'lucide-react';

export default function Categories({ categories, stats, meta }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getCategoryIcon = (categoryName) => {
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

        const IconComponent = iconMap[categoryName.toLowerCase()] || Mail;
        return IconComponent;
    };

    const getCategoryColor = (index) => {
        const colors = [
            'red',
            'blue',
            'green',
            'purple',
            'orange',
            'indigo',
            'pink',
            'yellow'
        ];
        return colors[index % colors.length];
    };

    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Dynamic Category Sections */}
            {categories.map((category, categoryIndex) => (
                <section key={category.id} className="py-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4">
                        {/* Category Table */}
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <table className="w-full">
                                {/* Table Header */}
                                <thead>
                                    <tr className="bg-gray-800 text-white">
                                        <th className="px-6 py-3 text-left w-[55%]">
                                            <h2 className="text-sm font-medium">{category.name}</h2>
                                        </th>
                                        <th className="hidden md:table-cell px-4 py-3 text-center w-[15%]">
                                            <span className="text-sm text-gray-300">In Stock</span>
                                        </th>
                                        <th className="hidden md:table-cell px-4 py-3 text-right w-[15%]">
                                            <span className="text-sm text-gray-300">Price</span>
                                        </th>
                                        <th className="hidden md:table-cell px-6 py-3 w-[15%]">
                                            {/* Action column header - empty */}
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody>
                                    {category.products && category.products.length > 0 ? (
                                        category.products.map((product, index) => (
                                            <tr key={product.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                {/* Desktop Layout */}
                                                <td className="hidden md:table-cell px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 bg-${getCategoryColor(categoryIndex)}-100 rounded flex items-center justify-center mr-4 flex-shrink-0`}>
                                                            {product.main_image ? (
                                                                <img
                                                                    src={product.main_image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover rounded"
                                                                />
                                                            ) : (
                                                                React.createElement(getCategoryIcon(category.name), {
                                                                    className: `h-5 w-5 text-${getCategoryColor(categoryIndex)}-600`
                                                                })
                                                            )}
                                                        </div>
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            className="text-sm text-gray-900 leading-relaxed hover:underline"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                    </div>
                                                </td>

                                                <td className="hidden md:table-cell px-4 py-4 text-center">
                                                    <div className="text-sm text-gray-700">
                                                        {product.stock_quantity || 0} pcs.
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Price per pc
                                                    </div>
                                                </td>

                                                <td className="hidden md:table-cell px-4 py-4 text-right">
                                                    <div className="text-sm text-gray-900">
                                                        from {formatCurrency(product.price)}
                                                    </div>
                                                </td>

                                                <td className="hidden md:table-cell px-6 py-4">
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors inline-block ${product.is_in_stock
                                                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {product.is_in_stock ? 'Buy Now' : 'Out of Stock'}
                                                    </Link>
                                                </td>

                                                {/* Mobile Layout - Single Column */}
                                                <td className="md:hidden px-4 py-3" colSpan="4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className={`w-8 h-8 bg-${getCategoryColor(categoryIndex)}-100 rounded flex items-center justify-center flex-shrink-0`}>
                                                            {product.main_image ? (
                                                                <img
                                                                    src={product.main_image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover rounded"
                                                                />
                                                            ) : (
                                                                React.createElement(getCategoryIcon(category.name), {
                                                                    className: `h-4 w-4 text-${getCategoryColor(categoryIndex)}-600`
                                                                })
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-900 mb-2">
                                                                <Link href={`/products/${product.slug}`} className="hover:underline">
                                                                    {product.name}
                                                                </Link>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-xs text-gray-500">
                                                                    {product.stock_quantity || 0} pcs. - Price per pc
                                                                </div>
                                                                <div className="text-sm text-gray-900">
                                                                    from {formatCurrency(product.price)}
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <Link
                                                                    href={`/products/${product.slug}`}
                                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors inline-block w-full text-center ${product.is_in_stock
                                                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                        }`}
                                                                >
                                                                    {product.is_in_stock ? 'Buy Now' : 'Out of Stock'}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                                No products available in this category yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* View More Link */}
                        <div className="text-center py-4">
                            <Link
                                href={`/categories/${category.slug}`}
                                className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
                            >
                                view more
                            </Link>
                        </div>
                    </div>
                </section>
            ))}

            {/* Show message if no categories */}
            {categories.length === 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Categories Available</h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            We're currently setting up our product catalog. Please check back soon for amazing digital products!
                        </p>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="py-8 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-500 rounded-full p-2 w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Instant Delivery</h3>
                            <p className="text-xs text-gray-600">
                                Receive your digital products immediately after payment confirmation.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-500 rounded-full p-2 w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Secure Payments</h3>
                            <p className="text-xs text-gray-600">
                                Pay with cryptocurrency or account balance. All transactions are encrypted.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-500 rounded-full p-2 w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Quality Guaranteed</h3>
                            <p className="text-xs text-gray-600">
                                All products are tested and verified. Get support if you encounter issues.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {stats && (
                <section className="py-8 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {stats.total_categories}
                                </div>
                                <div className="text-gray-400">Categories Available</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {stats.total_products}
                                </div>
                                <div className="text-gray-400">Total Products</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {stats.in_stock_products}
                                </div>
                                <div className="text-gray-400">In Stock Now</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </AppLayout>
    );
}
