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
    featuredProducts,
    categories,
    popularProducts,
    stats,
    meta
}) {
    const getStockBadge = (product) => {
        if (!product.is_in_stock) {
            return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>;
        }
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">In Stock</span>;
    };

    const getPriceDisplay = (product) => {
        return (
            <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">from</div>
                <div className="text-lg font-bold text-gray-900">{product.formatted_price}</div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={meta.title} />



            {/* Gmail Products Section */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gmail - PVA</h2>
                        <p className="text-gray-600">Phone verified Gmail accounts with instant delivery</p>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-gray-800 text-white">
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
                            {featuredProducts.slice(0, 6).map((product) => (
                                <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                                    <div className="col-span-1">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Mail className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="col-span-6">
                                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                        {product.features && (
                                            <div className="flex items-center mt-2 text-xs text-green-600">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                <span>{product.features.split('\n')[0]}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2 text-center">
                                        {getStockBadge(product)}
                                        <div className="text-sm text-gray-500 mt-1">
                                            {product.manual_delivery ? <Infinity className="w-4 h-4 mx-auto" /> : (product.available_stock || product.stock_quantity) + ' pc'}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        {getPriceDisplay(product)}
                                        <div className="text-xs text-gray-500 mt-1">Price per pc</div>
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors inline-flex items-center"
                                        >
                                            <ShoppingBag className="h-4 w-4 mr-1" />
                                            Buy
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View More */}
                        <div className="bg-gray-50 px-6 py-4 text-center">
                            <Link
                                href="/categories/gmail"
                                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                            >
                                view more
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gmail SMTP Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gmail - SMTP</h2>
                        <p className="text-gray-600">SMTP enabled Gmail accounts for email marketing</p>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-gray-800 text-white">
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
                            {popularProducts.slice(0, 4).map((product, index) => (
                                <div key={product.id || index} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                                    <div className="col-span-1">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Mail className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>

                                    <div className="col-span-6">
                                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-600">SMTP enabled account with app password active</p>
                                        <div className="flex items-center mt-2 text-xs text-green-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            <span>2FA Enabled | SMS Verified | Additional Email Included</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-center">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">In Stock</span>
                                        <div className="text-sm text-gray-500 mt-1">0 pcs.</div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 mb-1">from</div>
                                            <div className="text-lg font-bold text-gray-900">{product.formatted_price || '$0.50'}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Price per pc</div>
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors inline-flex items-center"
                                        >
                                            <ShoppingBag className="h-4 w-4 mr-1" />
                                            Buy
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View More */}
                        <div className="bg-gray-50 px-6 py-4 text-center">
                            <Link
                                href="/categories/gmail-smtp"
                                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                            >
                                view more
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* Features Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
                            <p className="text-gray-600">
                                Receive your digital products immediately after payment confirmation.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                            <p className="text-gray-600">
                                Pay with cryptocurrency or account balance. All transactions are encrypted.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Award className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                            <p className="text-gray-600">
                                All products are tested and verified. Get support if you encounter issues.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
