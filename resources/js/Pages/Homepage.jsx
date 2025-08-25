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
    Shield,
    Mail,
    CheckCircle,
    Infinity
} from 'lucide-react';

export default function Homepage({
    categories,
    meta
}) {
    const getCategoryColor = (index) => {
        const colors = [
            'blue',
            'purple',
            'green',
            'orange',
            'red',
            'indigo',
            'pink',
            'yellow'
        ];
        return colors[index % colors.length];
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

    return (
        <AppLayout>
            <Head title={meta.title} />

            {categories.map((category, categoryIndex) => (
                <section key={category.id} className={`py-8 lg:py-12 ${categoryIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-6 lg:mb-8">
                            <div className="flex items-center mb-2">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-${getCategoryColor(categoryIndex)}-100 rounded-lg flex items-center justify-center mr-3`}>
                                    {React.createElement(getCategoryIcon(category.name), {
                                        className: `h-4 w-4 sm:h-5 sm:w-5 text-${getCategoryColor(categoryIndex)}-600`
                                    })}
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category.name}</h2>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600">
                                {category.description || `Verified ${category.name} accounts with instant delivery`}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {/* Desktop Table Header - Hidden on mobile */}
                            <div className="hidden md:block bg-gray-800 text-white">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium">
                                    <div className="col-span-1"></div>
                                    <div className="col-span-6">Product Description</div>
                                    <div className="col-span-2 text-center">Stock</div>
                                    <div className="col-span-2 text-center">Price</div>
                                    <div className="col-span-1"></div>
                                </div>
                            </div>

                            {/* Product Rows */}
                            <div className="divide-y divide-gray-200">
                                {category.products && category.products.length > 0 ? (
                                    // Show actual products from database
                                    category.products.map((product, index) => (
                                        <div key={product.id}>
                                            {/* Desktop Layout */}
                                            <div className="hidden md:grid grid-cols-13 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                                                <div className="col-span-1">
                                                    <div className={`w-12 h-12 bg-${getCategoryColor(categoryIndex)}-100 rounded-lg flex items-center justify-center`}>
                                                        {product.main_image ? <img
                                                            src={product.main_image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        /> : React.createElement(getCategoryIcon(category.name), {
                                                            className: `h-6 w-6 text-${getCategoryColor(categoryIndex)}-600`
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="col-span-6">
                                                    <Link href={`/products/${product.slug}`}>
                                                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                                    </Link>
                                                    <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description || `Premium quality ${category.name.toLowerCase()} with verified credentials` }}></div>
                                                    {product.features && (
                                                        <div className="flex items-center mt-2 text-xs text-green-600">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            <span dangerouslySetInnerHTML={{ __html: product.features.split('\n')[0] }}></span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-2 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.is_in_stock
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Limited'}
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500 mb-1">from</div>
                                                        <div className="text-lg font-bold text-gray-900">{product.formatted_price}</div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">Price per item</div>
                                                </div>

                                                <div className="col-span-2 text-right">
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors inline-flex items-center"
                                                    >
                                                        <ShoppingBag className="h-4 w-4 mr-1" />
                                                        Buy now
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Mobile Layout */}
                                            <div className="md:hidden p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start space-x-3">
                                                    <div className={`w-12 h-12 bg-${getCategoryColor(categoryIndex)}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                        {React.createElement(getCategoryIcon(category.name), {
                                                            className: `h-6 w-6 text-${getCategoryColor(categoryIndex)}-600`
                                                        })}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                                        <div className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: product.description || `Premium quality ${category.name.toLowerCase()} with verified credentials` }}></div>
                                                        {product.features && (
                                                            <div className="flex items-center mt-2 text-xs text-green-600">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                <span dangerouslySetInnerHTML={{ __html: product.features.split('\n')[0] }}></span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${product.is_in_stock
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Limited'}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-500">from</div>
                                                                <div className="text-lg font-bold text-gray-900">{product.formatted_price}</div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Link
                                                                href={`/products/${product.slug}`}
                                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors inline-flex items-center justify-center"
                                                            >
                                                                <ShoppingBag className="h-4 w-4 mr-1" />
                                                                Buy now
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Show message when no products available
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        <p>No products available in this category yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* View More */}
                            <div className="bg-gray-50 px-4 sm:px-6 py-4 text-center">
                                <Link
                                    href={`/categories/${category.slug}`}
                                    className="text-orange-500 hover:text-orange-600 font-medium transition-colors text-sm sm:text-base"
                                >
                                    View More
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Features Section */}
            <section className="py-8 lg:py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">Instant Delivery</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Receive your digital products immediately after payment confirmation.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Payments</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Pay with cryptocurrency or account balance. All transactions are encrypted.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">Quality Guaranteed</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                All products are tested and verified. Get support if you encounter issues.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
