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
    ArrowUpDown
} from 'lucide-react';

export default function CategoryPage({
    category,
    products,
    subcategories,
    filters,
    meta,
    pagination
}) {
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [selectedFilters, setSelectedFilters] = useState({});

    const getStockBadge = (product) => {
        if (!product.is_in_stock) {
            return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Out of Stock</span>;
        }
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">In Stock</span>;
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        router.get(window.location.pathname, {
            ...router.page.props.filters,
            sort: newSort
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
            ...newFilters,
            sort: sortBy
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Category Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <nav className="flex text-sm text-gray-300 mb-4">
                                <Link href="/" className="hover:text-white">Home</Link>
                                <span className="mx-2">/</span>
                                <span>Categories</span>
                                <span className="mx-2">/</span>
                                <span className="text-white">{category.name}</span>
                            </nav>
                            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
                            {category.description && (
                                <p className="text-xl text-gray-300 max-w-3xl">
                                    {category.description}
                                </p>
                            )}
                            <div className="flex items-center mt-4 text-sm text-gray-400">
                                <Package className="h-4 w-4 mr-2" />
                                <span>{products.data.length} products available</span>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                                <div className="flex items-center text-center">
                                    <div className="mr-6">
                                        <div className="text-2xl font-bold text-white">{products.data.length}</div>
                                        <div className="text-xs text-gray-300">Products</div>
                                    </div>
                                    <div className="mr-6">
                                        <div className="text-2xl font-bold text-green-400">
                                            {products.data.filter(p => p.is_in_stock).length}
                                        </div>
                                        <div className="text-xs text-gray-300">In Stock</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-400">24/7</div>
                                        <div className="text-xs text-gray-300">Support</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subcategories */}
            {subcategories && subcategories.length > 0 && (
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {subcategories.map((subcategory) => (
                                <Link
                                    key={subcategory.id}
                                    href={`/categories/${subcategory.slug}`}
                                    className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <Mail className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 text-sm">{subcategory.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {subcategory.products_count || 0} products
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Controls */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center text-gray-700 hover:text-gray-900"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                            <div className="text-sm text-gray-500">
                                Showing {products.data.length} of {pagination?.total || products.data.length} results
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="created_at">Newest First</option>
                                    <option value="popularity">Most Popular</option>
                                </select>
                                <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:text-gray-700'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Range
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
                                        />
                                    </div>
                                </div>

                                {/* Stock Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Availability
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Features
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={(e) => handleFilterChange('phone_verified', e.target.checked)}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Phone Verified</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={(e) => handleFilterChange('smtp_enabled', e.target.checked)}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">SMTP Enabled</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {products.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-4">
                                Try adjusting your filters or browse other categories.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse All Categories
                            </Link>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.data.map((product) => (
                                        <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Mail className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    {getStockBadge(product)}
                                                </div>

                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {product.name}
                                                </h3>

                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {product.description}
                                                </p>

                                                {product.features && (
                                                    <div className="flex items-center text-xs text-green-600 mb-4">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        <span className="line-clamp-1">{product.features.split('\n')[0]}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm text-gray-500">from</div>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {product.formatted_price}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors inline-flex items-center"
                                                    >
                                                        <ShoppingBag className="h-4 w-4 mr-1" />
                                                        Buy Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.data.map((product) => (
                                        <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                            <div className="p-6">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                        <Mail className="h-6 w-6 text-blue-600" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 mr-4">
                                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                                    {product.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                                    {product.description}
                                                                </p>
                                                                {product.features && (
                                                                    <div className="flex items-center text-xs text-green-600">
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                        <span>{product.features.split('\n')[0]}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center space-x-4">
                                                                {getStockBadge(product)}
                                                                <div className="text-center">
                                                                    <div className="text-sm text-gray-500">from</div>
                                                                    <div className="text-lg font-bold text-gray-900">
                                                                        {product.formatted_price}
                                                                    </div>
                                                                </div>
                                                                <Link
                                                                    href={`/products/${product.slug}`}
                                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors inline-flex items-center"
                                                                >
                                                                    <ShoppingBag className="h-4 w-4 mr-1" />
                                                                    Buy Now
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination && pagination.total > pagination.per_page && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex items-center space-x-2">
                                        {pagination.prev_page_url && (
                                            <Link
                                                href={pagination.prev_page_url}
                                                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}

                                        {[...Array(pagination.last_page)].map((_, index) => {
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
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
