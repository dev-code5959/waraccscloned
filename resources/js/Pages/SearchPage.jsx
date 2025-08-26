// File: resources/js/Pages/SearchPage.jsx

import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    Search,
    Filter,
    Grid,
    List,
    Mail,
    CheckCircle,
    Clock,
    TrendingUp,
    Package,
    X,
    ArrowUpDown
} from 'lucide-react';

export default function SearchPage({
    query,
    results,
    categories,
    filters,
    meta,
    pagination,
    suggestions,
    popularSearches
}) {
    const [searchQuery, setSearchQuery] = useState(query || '');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', {
                q: searchQuery.trim(),
                category: selectedCategory,
                sort: sortBy,
                price_min: priceRange[0],
                price_max: priceRange[1]
            });
        }
    };

    const handleFilterChange = () => {
        router.get('/search', {
            q: query,
            category: selectedCategory,
            sort: sortBy,
            price_min: priceRange[0],
            price_max: priceRange[1]
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange([0, 100]);
        setSortBy('relevance');
        router.get('/search', { q: query });
    };

    const getStockBadge = (product) => {
        if (!product.is_in_stock) {
            return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Out of Stock</span>;
        }
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">In Stock</span>;
    };

    useEffect(() => {
        setSearchQuery(query || '');
    }, [query]);

    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Search Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1 max-w-2xl">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for Gmail accounts, social media accounts..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {query && (
                            <div className="flex items-center text-sm text-gray-600">
                                <span>Search results for: </span>
                                <span className="font-medium text-gray-900 ml-1">"{query}"</span>
                                {results?.total && (
                                    <span className="ml-2 text-gray-500">({results.total} results)</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popular Searches / Suggestions */}
            {!query && (
                <div className="bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Popular Searches */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                                    Popular Searches
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {popularSearches?.map((search, index) => (
                                        <Link
                                            key={index}
                                            href={`/search?q=${encodeURIComponent(search)}`}
                                            className="bg-white hover:bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                                        >
                                            {search}
                                        </Link>
                                    )) || [
                                        'Gmail PVA',
                                        'Gmail SMTP',
                                        'Facebook accounts',
                                        'Instagram accounts',
                                        'LinkedIn accounts',
                                        'Twitter accounts',
                                        'YouTube accounts',
                                        'Discord accounts'
                                    ].map((search, index) => (
                                        <Link
                                            key={index}
                                            href={`/search?q=${encodeURIComponent(search)}`}
                                            className="bg-white hover:bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                                        >
                                            {search}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Browse Categories */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-blue-500" />
                                    Browse Categories
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {categories?.slice(0, 6).map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/categories/${category.slug}`}
                                            className="bg-white hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-colors group"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {category.products_count || 0} products
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )) || []}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {query && (
                <div className="bg-gray-50 min-h-screen">
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
                                    </button>

                                    {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 100) && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center text-red-600 hover:text-red-700 text-sm"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Clear Filters
                                        </button>
                                    )}

                                    <div className="text-sm text-gray-500">
                                        {results?.total || 0} results found
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="relevance">Most Relevant</option>
                                            <option value="name">Name A-Z</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                            <option value="created_at">Newest First</option>
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
                                        {/* Category Filter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">All Categories</option>
                                                {categories?.map((category) => (
                                                    <option key={category.id} value={category.slug}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

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

                                        {/* Apply Filters Button */}
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleFilterChange}
                                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {!results?.data || results.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                                <p className="text-gray-500 mb-4">
                                    Try adjusting your search terms or filters.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Suggestions:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {suggestions?.map((suggestion, index) => (
                                            <Link
                                                key={index}
                                                href={`/search?q=${encodeURIComponent(suggestion)}`}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm transition-colors"
                                            >
                                                {suggestion}
                                            </Link>
                                        )) || [
                                            'Gmail accounts',
                                            'PVA accounts',
                                            'SMTP accounts'
                                        ].map((suggestion, index) => (
                                            <Link
                                                key={index}
                                                href={`/search?q=${encodeURIComponent(suggestion)}`}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm transition-colors"
                                            >
                                                {suggestion}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.data.map((product) => (
                                            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Mail className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        {getStockBadge(product)}
                                                    </div>

                                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                        <Link href={`/products/${product.slug}`} className="hover:underline">
                                                            {product.name}
                                                        </Link>
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
                                                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                                                        >
                                                            Buy Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {results.data.map((product) => (
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
                                                                        <Link href={`/products/${product.slug}`} className="hover:underline">
                                                                            {product.name}
                                                                        </Link>
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
                                                                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                                                                      >
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

                                            {[...Array(Math.min(pagination.last_page, 5))].map((_, index) => {
                                                const page = index + 1;
                                                const isCurrentPage = page === pagination.current_page;
                                                return (
                                                    <Link
                                                        key={page}
                                                        href={`${pagination.path}?page=${page}&q=${encodeURIComponent(query)}`}
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
            )}
        </AppLayout>
    );
}
