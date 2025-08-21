// File: resources/js/Pages/Admin/Products/Edit.jsx

import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Save,
    ArrowLeft,
    Upload,
    X,
    Image as ImageIcon,
    AlertCircle,
    Trash2,
    Truck,
    Zap,
    Info,
    FileWarning
} from 'lucide-react';

export default function Edit({ product, categories }) {
    const [imagePreview, setImagePreview] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        features: product.features || '',
        price: product.price || '',
        category_id: product.category_id || '',
        min_purchase: product.min_purchase || 1,
        max_purchase: product.max_purchase || '',
        delivery_info: product.delivery_info || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active || true,
        manual_delivery: product.manual_delivery || false,
        images: [],
        remove_images: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Add images to remove to form data
        const formData = {
            ...data,
            remove_images: imagesToRemove,
            _method: 'PUT'
        };

        post(route('admin.products.update', product.id), {
            data: formData
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', [...data.images, ...files]);

        // Create preview URLs
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    url: e.target.result,
                    file: file,
                    isNew: true
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (indexToRemove) => {
        const newImages = data.images.filter((_, index) => index !== indexToRemove);
        setData('images', newImages);
        setImagePreview(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const removeExistingImage = (mediaId) => {
        setImagesToRemove(prev => [...prev, mediaId]);
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);
        // Only auto-generate slug if it matches the current product name's slug
        if (!data.slug || generateSlug(product.name) === data.slug) {
            setData('slug', generateSlug(name));
        }
    };

    const handleDeliveryMethodChange = (isManual) => {
        setData('manual_delivery', isManual);
    };

    // Check if switching from automatic to manual would affect existing access codes
    const willAffectAccessCodes = !product.manual_delivery && data.manual_delivery && product.access_codes && product.access_codes.length > 0;
    const switchingToAutomatic = product.manual_delivery && !data.manual_delivery;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                        <p className="text-gray-600">Update product information and settings</p>
                    </div>
                    <Link
                        href={route('admin.products.show', product.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Product
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter product name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.slug ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="product-slug"
                                />
                                {errors.slug && (
                                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.category_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className={`w-full pl-7 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Describe your product..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Features
                            </label>
                            <textarea
                                value={data.features}
                                onChange={(e) => setData('features', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="List the key features (one per line)..."
                            />
                            {errors.features && (
                                <p className="mt-1 text-sm text-red-600">{errors.features}</p>
                            )}
                        </div>
                    </div>

                    {/* Delivery Method */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Method</h3>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="flex items-center h-5">
                                    <input
                                        type="radio"
                                        id="automatic_delivery"
                                        name="delivery_method"
                                        checked={!data.manual_delivery}
                                        onChange={() => handleDeliveryMethodChange(false)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="automatic_delivery" className="flex items-center text-sm font-medium text-gray-900 cursor-pointer">
                                        <Zap className="w-4 h-4 mr-2 text-green-500" />
                                        Automatic Delivery
                                    </label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Access codes are automatically delivered upon payment confirmation. Requires pre-uploaded access codes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex items-center h-5">
                                    <input
                                        type="radio"
                                        id="manual_delivery"
                                        name="delivery_method"
                                        checked={data.manual_delivery}
                                        onChange={() => handleDeliveryMethodChange(true)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="manual_delivery" className="flex items-center text-sm font-medium text-gray-900 cursor-pointer">
                                        <Truck className="w-4 h-4 mr-2 text-blue-500" />
                                        Manual Delivery
                                    </label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Orders will be marked as pending delivery. Admin manually uploads and delivers access codes to customers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Warning when switching to manual with existing codes */}
                        {willAffectAccessCodes && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-start">
                                    <FileWarning className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-800">Warning: Switching to Manual Delivery</h4>
                                        <div className="mt-1 text-sm text-yellow-700">
                                            <p>This product currently has {product.access_codes?.length || 0} access codes. Switching to manual delivery will:</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Keep existing access codes but disable automatic assignment</li>
                                                <li>Set stock quantity to infinite</li>
                                                <li>Require manual processing for new orders</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info when switching to automatic without codes */}
                        {switchingToAutomatic && (!product.access_codes || product.access_codes.length === 0) && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-start">
                                    <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800">Switching to Automatic Delivery</h4>
                                        <div className="mt-1 text-sm text-blue-700">
                                            <p>You'll need to upload access codes after saving to enable automatic delivery. Until then, the product will show as out of stock.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Current manual delivery info */}
                        {data.manual_delivery && !willAffectAccessCodes && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-start">
                                    <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800">Manual Delivery Mode</h4>
                                        <div className="mt-1 text-sm text-blue-700">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Stock quantity will be infinite</li>
                                                <li>Access code upload will be disabled</li>
                                                <li>Orders will require manual processing</li>
                                                <li>Customers will be notified when their order is ready</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors.manual_delivery && (
                            <p className="mt-1 text-sm text-red-600">{errors.manual_delivery}</p>
                        )}
                    </div>

                    {/* Purchase Settings */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Purchase <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.min_purchase}
                                    onChange={(e) => setData('min_purchase', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.min_purchase ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                {errors.min_purchase && (
                                    <p className="mt-1 text-sm text-red-600">{errors.min_purchase}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Purchase
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.max_purchase}
                                    onChange={(e) => setData('max_purchase', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={data.manual_delivery ? "No limit (Manual Delivery)" : "No limit"}
                                />
                                {errors.max_purchase && (
                                    <p className="mt-1 text-sm text-red-600">{errors.max_purchase}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Information
                            </label>
                            <textarea
                                value={data.delivery_info}
                                onChange={(e) => setData('delivery_info', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Instructions for customers about delivery..."
                            />
                            {errors.delivery_info && (
                                <p className="mt-1 text-sm text-red-600">{errors.delivery_info}</p>
                            )}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>

                        <div className="space-y-4">
                            {/* Existing Images */}
                            {product.image_gallery && product.image_gallery.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {product.image_gallery.map((image) => (
                                            !imagesToRemove.includes(image.id) && (
                                                <div key={image.id} className="relative">
                                                    <img
                                                        src={image.preview}
                                                        alt="Product image"
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(image.id)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Images */}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> new images
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* New Image Previews */}
                            {imagePreview.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {imagePreview.map((preview, index) => (
                                            <div key={preview.id} className="relative">
                                                <img
                                                    src={preview.url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {errors.images && (
                                <div className="flex items-center space-x-2 text-red-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-sm">{errors.images}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                                    Featured Product
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                    Active (Visible to customers)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Link
                            href={route('admin.products.show', product.id)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
