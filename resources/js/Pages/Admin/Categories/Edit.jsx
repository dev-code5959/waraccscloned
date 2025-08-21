// File: resources/js/Pages/Admin/Categories/Edit.jsx

import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Tag,
    ArrowLeft,
    Save,
    Hash,
    FileText,
    Folder,
    ToggleLeft,
    ToggleRight,
    ArrowUpDown,
    AlertTriangle
} from 'lucide-react';

export default function Edit({ category, parentCategories }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '',
        parent_id: category.parent_id || '',
        sort_order: category.sort_order,
        is_active: category.is_active,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', category.id));
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);

        // Auto-update slug only if it matches the current pattern
        if (data.slug === generateSlug(category.name)) {
            setData('slug', generateSlug(name));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.categories.show', category.id)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Category
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
                        <p className="text-gray-600">Update category information and settings</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Category Information</h3>
                        <p className="text-sm text-gray-500 mt-1">Category ID: {category.id}</p>
                    </div>

                    <div className="px-6 py-4 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Tag className="w-4 h-4 inline mr-1" />
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter category name"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Hash className="w-4 h-4 inline mr-1" />
                                    URL Slug *
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.slug ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="category-url-slug"
                                    required
                                />
                                {errors.slug && (
                                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Used in URLs - should be unique and SEO-friendly
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-1" />
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter category description..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Icon and Parent */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon (Emoji or Text)
                                </label>
                                <input
                                    type="text"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.icon ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="📱"
                                />
                                {errors.icon && (
                                    <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Optional icon to display with category
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Folder className="w-4 h-4 inline mr-1" />
                                    Parent Category
                                </label>
                                <select
                                    value={data.parent_id}
                                    onChange={(e) => setData('parent_id', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parent_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">None (Root Category)</option>
                                    {parentCategories.map((parentCategory) => (
                                        <option key={parentCategory.id} value={parentCategory.id}>
                                            {parentCategory.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.parent_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Change parent to reorganize category hierarchy
                                </p>
                            </div>
                        </div>

                        {/* Sort Order and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <ArrowUpDown className="w-4 h-4 inline mr-1" />
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sort_order ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="0"
                                />
                                {errors.sort_order && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Controls display order within same parent
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', !data.is_active)}
                                        className="flex items-center space-x-2"
                                    >
                                        {data.is_active ? (
                                            <ToggleRight className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                                        )}
                                        <span className={`text-sm font-medium ${data.is_active ? 'text-green-700' : 'text-gray-500'
                                            }`}>
                                            {data.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </button>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Active categories are visible to customers
                                </p>
                            </div>
                        </div>

                        {/* Preview */}
                        {data.name && (
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
                                <div className="flex items-center space-x-3">
                                    {data.icon && (
                                        <div className="h-8 w-8 rounded bg-white flex items-center justify-center">
                                            <span className="text-sm">{data.icon}</span>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {data.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            /{data.slug}
                                        </div>
                                        {data.description && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                {data.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Current Category Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Tag className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Current Category Information
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div>Products: {category.products_count || 0}</div>
                                            <div>Sub-categories: {category.children?.length || 0}</div>
                                            <div>Created: {new Date(category.created_at).toLocaleDateString()}</div>
                                            <div>Last updated: {new Date(category.updated_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning for categories with products */}
                        {category.products_count > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Category Contains Products
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            This category has {category.products_count} products. Changes to the category
                                            structure may affect product visibility and URLs. Consider the impact on:
                                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                                <li>Product URLs and SEO</li>
                                                <li>Customer navigation and bookmarks</li>
                                                <li>Search engine indexing</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                        <Link
                            href={route('admin.categories.show', category.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Category
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
