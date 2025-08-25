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
    Infinity,
    Users
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
        return iconMap[categoryName.toLowerCase()] || Mail;
    };

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

            {/* Breadcrumb and Title - Minimal */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <nav className="flex items-center text-sm text-gray-500 mb-3">
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
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h1>
                            {category.description && (
                                <p className="text-gray-600 text-sm">
                                    {category.description}
                                </p>
                            )}
                        </div>
                        <div className="hidden lg:flex items-center text-sm text-gray-500">
                            <Package className="h-4 w-4 mr-1" />
                            <span>{products.total || products.data.length} products</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 py-6">
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
                                    className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Browse All Categories
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            {/* Table Header - Black */}
                            <div className="bg-gray-800 text-white px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-3">
                                            {React.createElement(getCategoryIcon(category.name), {
                                                className: "h-4 w-4 text-white"
                                            })}
                                        </div>
                                        <h2 className="text-sm font-medium">{category.name}</h2>
                                    </div>
                                    <div className="flex items-center space-x-32">
                                        <span className="text-sm text-gray-300">In Stock</span>
                                        <span className="text-sm text-gray-300">Price</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Rows */}
                            <div className="divide-y divide-gray-100">
                                {products.data.map((product) => (
                                    <div key={product.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Desktop Layout */}
                                        <div className="hidden md:flex items-center px-6 py-4">
                                            <div className="flex items-center flex-1">
                                                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-4 flex-shrink-0">
                                                    {product.main_image ? (
                                                        <img
                                                            src={product.main_image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        React.createElement(getCategoryIcon(category.name), {
                                                            className: "h-5 w-5 text-red-600"
                                                        })
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-900 leading-relaxed">
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="w-24 text-center mr-20">
                                                    <div className="text-sm text-gray-700">
                                                        {(product.available_stock || product.stock_quantity || 0)} pcs.
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Price per pc
                                                    </div>
                                                </div>

                                                <div className="w-20 text-right mr-6">
                                                    <div className="text-sm text-gray-900">
                                                        from {product.formatted_price}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors inline-flex items-center"
                                                >
                                                    <ShoppingBag className="h-3 w-3 mr-1" />
                                                    Buy
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Mobile Layout */}
                                        <div className="md:hidden px-4 py-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                                    {React.createElement(getCategoryIcon(category.name), {
                                                        className: "h-4 w-4 text-red-600"
                                                    })}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-900 mb-2">
                                                        {product.name}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-gray-500">
                                                            {(product.available_stock || product.stock_quantity || 0)} pcs. - Price per pc
                                                        </div>
                                                        <div className="text-sm text-gray-900">
                                                            from {product.formatted_price}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors w-full inline-flex items-center justify-center"
                                                        >
                                                            <ShoppingBag className="h-3 w-3 mr-1" />
                                                            Buy
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination - Clean */}
                            {pagination && pagination.total > pagination.per_page && (
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Showing {pagination.from} to {pagination.to} of {pagination.total} results
                                        </div>
                                        <nav className="flex items-center space-x-1">
                                            {pagination.prev_page_url && (
                                                <Link
                                                    href={pagination.prev_page_url}
                                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
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
                                                        className={`px-3 py-1.5 text-sm border rounded ${isCurrentPage
                                                            ? 'bg-orange-500 text-white border-orange-500'
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
                                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
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
