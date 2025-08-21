// File: resources/js/Pages/Admin/Categories/Show.jsx

import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Tag,
    ArrowLeft,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Package,
    Folder,
    FolderOpen,
    Hash,
    Calendar,
    ArrowUpDown,
    Eye,
    Plus
} from 'lucide-react';

export default function Show({ category, stats }) {
    const toggleStatus = () => {
        router.post(route('admin.categories.toggle-status', category.id));
    };

    const deleteCategory = () => {
        if (confirm('Are you sure you want to delete this category? Any child categories will be moved to the parent level.')) {
            router.delete(route('admin.categories.destroy', category.id));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Inactive
            </span>
        );
    };

    const getBreadcrumb = () => {
        if (!category.breadcrumb) return null;

        return category.breadcrumb.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                <Link
                    href={route('admin.categories.show', crumb.id)}
                    className={`text-sm ${index === category.breadcrumb.length - 1
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {crumb.name}
                </Link>
            </span>
        ));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.categories.index')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Categories
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                {category.icon && (
                                    <span className="mr-3 text-2xl">{category.icon}</span>
                                )}
                                {category.name}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                {getBreadcrumb()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleStatus}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${category.is_active
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            {category.is_active ? (
                                <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Activate
                                </>
                            )}
                        </button>
                        <Link
                            href={route('admin.categories.edit', category.id)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Category
                        </Link>
                        <button
                            onClick={deleteCategory}
                            className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Status and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Products
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total_products}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Active Products
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.active_products}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Folder className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Sub-Categories
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.children_count}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ArrowUpDown className="h-6 w-6 text-orange-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Category Depth
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            Level {stats.depth + 1}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Category Details</h3>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-500">Name</span>
                                        </div>
                                        <p className="text-sm text-gray-900">{category.name}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Hash className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-500">Slug</span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-mono">{category.slug}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-500">Sort Order</span>
                                        </div>
                                        <p className="text-sm text-gray-900">{category.sort_order}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Folder className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-500">Parent Category</span>
                                        </div>
                                        <p className="text-sm text-gray-900">
                                            {category.parent ? (
                                                <Link
                                                    href={route('admin.categories.show', category.parent.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {category.parent.name}
                                                </Link>
                                            ) : (
                                                'Root Category'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {category.description && (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-sm font-medium text-gray-500">Description</span>
                                        </div>
                                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                                            {category.description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Status: </span>
                                        {getStatusBadge(category.is_active)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Created {formatDate(category.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub-Categories */}
                        {category.children && category.children.length > 0 && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Sub-Categories</h3>
                                    <Link
                                        href={route('admin.categories.create', { parent_id: category.id })}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Sub-Category
                                    </Link>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="space-y-3">
                                        {category.children.map((child) => (
                                            <div key={child.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                                                <div className="flex items-center space-x-3">
                                                    {child.icon && (
                                                        <span className="text-lg">{child.icon}</span>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {child.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {child.products_count || 0} products
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {child.is_active ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                    <Link
                                                        href={route('admin.categories.show', child.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Products */}
                        {category.products && category.products.length > 0 && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
                                    <Link
                                        href={route('admin.products.index', { category: category.id })}
                                        className="text-blue-600 hover:text-blue-900 text-sm"
                                    >
                                        View All Products
                                    </Link>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="space-y-3">
                                        {category.products.slice(0, 5).map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ${parseFloat(product.price).toFixed(2)} • Stock: {product.stock_quantity}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {product.is_active ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                    <Link
                                                        href={route('admin.products.show', product.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <Link
                                    href={route('admin.categories.edit', category.id)}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Category
                                </Link>

                                <Link
                                    href={route('admin.categories.create', { parent_id: category.id })}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Sub-Category
                                </Link>

                                <Link
                                    href={route('admin.products.create', { category_id: category.id })}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    Add Product
                                </Link>
                            </div>
                        </div>

                        {/* Category Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Category Information</h3>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500">Category ID</div>
                                    <div className="text-sm font-medium text-gray-900">{category.id}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Full Path</div>
                                    <div className="text-sm text-gray-900">
                                        {category.full_name || category.name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Created</div>
                                    <div className="text-sm text-gray-900">
                                        {formatDate(category.created_at)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Last Updated</div>
                                    <div className="text-sm text-gray-900">
                                        {formatDate(category.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
