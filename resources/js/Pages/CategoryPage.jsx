// File: resources/js/Pages/CategoryPage.jsx

import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    Filter,
    Grid,
    List,
    Star,
    ShoppingBag,
    ChevronDown,
    Search,
    Mail,
    CheckCircle,
    Package,
    ArrowUpDown,
    Home,
    ChevronRight,
    Infinity
} from 'lucide-react';

export default function CategoryPage({
    category,
    products,
    subcategories,
    filters,
    meta,
    pagination
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState(filters.sort || 'name');
    const [priceRange, setPriceRange] = useState([filters.price_min || 0, filters.price_max || 100]);
    const [selectedFilters, setSelectedFilters] = useState({
        in_stock: filters.in_stock || false,
        phone_verified: filters.phone_verified || false,
        smtp_enabled: filters.smtp_enabled || false,
    });

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

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        router.get(window.location.pathname, {
            sort: newSort,
            price_min: priceRange[0],
            price_max: priceRange[1],
            ...selectedFilters
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            ...selectedFilters,
            [filterType]: value
        };
        setSelectedFilters(newFilters);

        router.get(window.location.pathname, {
            sort: sortBy,
            price_min: priceRange[0],
            price_max: priceRange[1],
            ...newFilters
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handlePriceRangeChange = () => {
        router.get(window.location.pathname, {
            sort: sortBy,
            price_min: priceRange[0],
            price_max: priceRange[1],
            ...selectedFilters
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Breadcrumb and Title */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <nav className="flex items-center text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-gray-700 flex items-center">
                            <Home className="h-4 w-4 mr-1" />
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <Link href="/categories" className="hover:text-gray-700">Categories</Link>
                        {category.breadcrumb && category.breadcrumb.length > 1 && (
                            category.breadcrumb.slice(0, -1).map((breadcrumb) => (
                                <React.Fragment key={breadcrumb.id}>
                                    <ChevronRight className="h-4 w-4 mx-2" />
                                    <Link href={`/categories/${breadcrumb.slug}`} className="hover:text-gray-700">
                                        {breadcrumb.name}
                                    </Link>
                                </React.Fragment>
                            ))
                        )}
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="text-gray-900 font-medium">{category.name}</span>
                    </nav>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                            {category.description && (
                                <p className="text-gray-600 max-w-3xl">
                                    {category.description}
                                </p>
                            )}
                        </div>
                        <div className="hidden lg:flex items-center text-sm text-gray-500">
                            <Package className="h-4 w-4 mr-2" />
                            <span>{products.total || products.data.length} products available</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Products Table */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {products.data.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white rounded-lg shadow p-8">
                                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-4">
                                    Try adjusting your filters or browse other categories.
                                </p>
                                <Link
                                    href="/categories"
                                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Browse All Categories
                                </Link>
                            </div>
                        </div>
                    ) : (
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
                                {products.data.map((product) => (
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

                            {/* Pagination */}
                            {pagination && pagination.total > pagination.per_page && (
                                <div className="bg-gray-50 px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Showing {pagination.from} to {pagination.to} of {pagination.total} results
                                        </div>
                                        <nav className="flex items-center space-x-2">
                                            {pagination.prev_page_url && (
                                                <Link
                                                    href={pagination.prev_page_url}
                                                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}

                                            {[...Array(Math.min(pagination.last_page, 10))].map((_, index) => {
                                                const page = index + 1;
                                                const isCurrentPage = page === pagination.current_page;
                                                return (
                                                    <Link
                                                        key={page}
                                                        href={`${pagination.path}?page=${page}`}
                                                        className={`px-3 py-2 text-sm border rounded-lg ${isCurrentPage
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </Link>
                                                );
                                            })}

                                            {pagination.next_page_url && (
                                                <Link
                                                    href={pagination.next_page_url}
                                                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
