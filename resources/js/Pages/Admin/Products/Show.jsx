// File: resources/js/Pages/Admin/Products/Show.jsx

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Upload,
    Download,
    Eye,
    ToggleLeft,
    ToggleRight,
    Package,
    DollarSign,
    ShoppingCart,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Truck,
    Zap,
    Info,
    Hash
} from 'lucide-react';

export default function Show({ product, stats }) {
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [uploadData, setUploadData] = useState({
        codes: '',
        format: 'email:password'
    });

    const toggleProductStatus = () => {
        router.post(route('admin.products.toggle-status', product.id), {}, {
            preserveScroll: true
        });
    };

    const deleteProduct = () => {
        if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            router.delete(route('admin.products.destroy', product.id));
        }
    };

    const handleBulkUpload = (e) => {
        e.preventDefault();
        router.post(route('admin.products.codes.bulk', product.id), uploadData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowBulkUpload(false);
                setUploadData({ codes: '', format: 'email:password' });
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            available: {
                icon: CheckCircle,
                class: 'bg-green-100 text-green-800',
                text: 'Available'
            },
            sold: {
                icon: XCircle,
                class: 'bg-red-100 text-red-800',
                text: 'Sold'
            },
            reserved: {
                icon: Clock,
                class: 'bg-yellow-100 text-yellow-800',
                text: 'Reserved'
            }
        };

        const badge = badges[status] || badges.available;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                <Icon className="w-3 h-3 mr-1" />
                {badge.text}
            </span>
        );
    };

    const getDeliveryTypeBadge = () => {
        if (product.manual_delivery) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Truck className="w-3 h-3 mr-1" />
                    Manual Delivery
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Automatic Delivery
            </span>
        );
    };

    const getStockDisplay = () => {
        if (product.manual_delivery) {
            const total = stats.stock_quantity || 0;
            const ordered = stats.total_orders || 0;
            return total - ordered;
        }
        return stats.available_codes;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.products.index')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Products
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                {getDeliveryTypeBadge()}
                            </div>
                            <p className="text-gray-600">Product Details & Inventory</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={toggleProductStatus}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${product.is_active
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {product.is_active ? (
                                <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Activate
                                </>
                            )}
                        </button>
                        <Link
                            href={route('admin.products.edit', product.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <button
                            onClick={deleteProduct}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Manual Delivery Info Banner */}
                {product.manual_delivery && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">Manual Delivery Product</h3>
                                <div className="mt-1 text-sm text-blue-700">
                                    <p>This product uses manual delivery. Orders will be marked as "pending delivery" and require admin intervention to complete. Stock quantity is managed manually.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {product.manual_delivery ? 'Manual Delivery' : 'Total Codes'}
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {product.manual_delivery ? 'Enabled' : stats.total_codes}
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
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Available Stock
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {getStockDisplay()}
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
                                    <ShoppingCart className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Orders
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total_orders}
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
                                    <DollarSign className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Revenue
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            ${stats.total_revenue}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>

                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Slug</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.slug}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.category?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                                    <dd className="mt-1 text-sm text-gray-900">${product.price}</dd>
                                </div>
                                {product.product_code_number && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Product Code</dt>
                                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                            <Hash className="w-4 h-4 mr-1 text-gray-400" />
                                            {product.product_code_number}
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Delivery Method</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {product.manual_delivery ? 'Manual Delivery' : 'Automatic Delivery'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Stock Quantity</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {product.manual_delivery ? (stats.stock_quantity || 0) : product.stock_quantity}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Min Purchase</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.min_purchase}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Max Purchase</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {product.max_purchase || 'No limit'}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900 prose" dangerouslySetInnerHTML={{ __html: product.description }}></dd>
                                </div>
                                {product.features && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Features</dt>
                                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line prose" dangerouslySetInnerHTML={{ __html: product.features }}></dd>
                                    </div>
                                )}
                                {product.delivery_info && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Delivery Info</dt>
                                        <dd className="mt-1 text-sm text-gray-900 prose" dangerouslySetInnerHTML={{ __html: product.delivery_info }}></dd>
                                    </div>
                                )}
                                {product.product_code_number && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Product Code Number</dt>
                                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                            <Hash className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                                {product.product_code_number}
                                            </span>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    <div>
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Settings</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Featured</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_featured
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {product.is_featured ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Delivery Type</span>
                                    {getDeliveryTypeBadge()}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Created</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500">Updated</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(product.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Access Codes Management - Only show for automatic delivery */}
                {!product.manual_delivery && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Access Codes Management</h3>
                            <button
                                onClick={() => setShowBulkUpload(!showBulkUpload)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Upload
                            </button>
                        </div>

                        {showBulkUpload && (
                            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <form onSubmit={handleBulkUpload} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Format
                                        </label>
                                        <select
                                            value={uploadData.format}
                                            onChange={(e) => setUploadData(prev => ({ ...prev, format: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="email:password">Email:Password</option>
                                            <option value="username:password">Username:Password</option>
                                            <option value="email_only">Email Only</option>
                                            <option value="custom">Custom (Additional Info)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Access Codes (one per line)
                                        </label>
                                        <textarea
                                            value={uploadData.codes}
                                            onChange={(e) => setUploadData(prev => ({ ...prev, codes: e.target.value }))}
                                            rows={6}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="example@email.com:password123&#10;user2@email.com:pass456"
                                        />
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Upload Codes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowBulkUpload(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Access Codes Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email/Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Password
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {product.access_codes.slice(0, 10).map((code) => (
                                        <tr key={code.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {code.email || code.username || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {code.password ? '••••••••' : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(code.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {code.order_id ? `#${code.order_id}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(code.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {product.access_codes.length > 10 && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Showing 10 of {product.access_codes.length} access codes
                                </p>
                            </div>
                        )}

                        {product.access_codes.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No access codes</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Upload access codes to start selling this product automatically.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Delivery Info Section */}
                {product.manual_delivery && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Manual Delivery Information</h3>
                        </div>

                        <div className="text-center py-8">
                            <Truck className="mx-auto h-12 w-12 text-blue-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Manual Delivery Enabled</h3>
                            <div className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                <p>This product uses manual delivery. Orders will be processed manually by administrators.</p>
                                <ul className="mt-3 text-left list-disc list-inside space-y-1">
                                    <li>Stock quantity: {stats.stock_quantity || 0}</li>
                                    <li>Access code upload is disabled</li>
                                    <li>Orders require manual processing</li>
                                    <li>Customers receive email notifications when ready</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
