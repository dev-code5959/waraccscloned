// File: resources/js/Pages/ProductDetail.jsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import {
    ShoppingCart,
    Star,
    Check,
    Package,
    Shield,
    ArrowRight,
    Plus,
    Minus,
    TrendingUp
} from 'lucide-react';

export default function ProductDetail({ product, relatedProducts, meta, auth }) {
    const [quantity, setQuantity] = useState(product.min_purchase || 1);
    const [selectedImage, setSelectedImage] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        quantity: quantity,
    });

    const handleQuantityChange = (newQuantity) => {
        const minQty = product.min_purchase || 1;
        const maxQty = product.max_purchase || product.available_stock;

        if (newQuantity >= minQty && newQuantity <= maxQty && newQuantity <= product.available_stock) {
            setQuantity(newQuantity);
            setData('quantity', newQuantity);
        }
    };

    const handlePurchase = () => {
        if (!auth.user) {
            window.location.href = '/login';
            return;
        }

        post(route('orders.create', product.slug), {
            data: { quantity }
        });
    };

    const subtotal = product.price * quantity;

    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Breadcrumb */}
            <nav className="bg-gray-50 px-4 py-3">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        {product.category.breadcrumb.map((cat, index) => (
                            <React.Fragment key={cat.id}>
                                <span>/</span>
                                <Link
                                    href={`/categories/${cat.slug}`}
                                    className="hover:text-blue-600"
                                >
                                    {cat.name}
                                </Link>
                            </React.Fragment>
                        ))}
                        <span>/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </div>
                </div>
            </nav>

            {/* Product Detail */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImage]?.preview || product.main_image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="h-24 w-24" />
                                </div>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === index
                                                ? 'border-blue-600'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={image.thumb}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
                                <span>{product.category.name}</span>
                                <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    <span>{product.sold_count} sold</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                            <p className="text-gray-600 mb-6">{product.description}</p>
                        </div>

                        {/* Features */}
                        {product.features && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                                <div className="space-y-2">
                                    {product.features.split('\n').map((feature, index) => (
                                        <div key={index} className="flex items-start space-x-2">
                                            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{product.formatted_price}</div>
                                    <div className="text-sm text-gray-500">per item</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${product.is_in_stock
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.is_in_stock
                                        ? `${product.available_stock} available`
                                        : 'Out of stock'
                                    }
                                </div>
                            </div>

                            {product.is_in_stock && (
                                <div className="space-y-4">
                                    {/* Quantity Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= (product.min_purchase || 1)}
                                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                                min={product.min_purchase || 1}
                                                max={Math.min(product.max_purchase || 999, product.available_stock)}
                                                className="w-20 text-center border border-gray-300 rounded-md py-2"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={
                                                    quantity >= product.available_stock ||
                                                    (product.max_purchase && quantity >= product.max_purchase)
                                                }
                                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Min: {product.min_purchase || 1}
                                            {product.max_purchase && ` • Max: ${product.max_purchase}`}
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="flex items-center justify-between py-3 border-t border-gray-200">
                                        <span className="text-lg font-medium text-gray-900">Subtotal:</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ${(subtotal).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Purchase Button */}
                                    <button
                                        onClick={handlePurchase}
                                        disabled={processing || !product.is_in_stock}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        {processing ? 'Processing...' : 'Purchase Now'}
                                    </button>

                                    {!auth.user && (
                                        <p className="text-sm text-gray-500 text-center">
                                            <Link href="/login" className="text-blue-600 hover:underline">
                                                Sign in
                                            </Link> to purchase this product
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Delivery Info */}
                        {product.delivery_info && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-1">Delivery Information</h4>
                                        <p className="text-blue-700 text-sm">{product.delivery_info}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Badge */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                <span>Instant Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                                    {relatedProduct.thumbnail && (
                                        <img
                                            src={relatedProduct.thumbnail}
                                            alt={relatedProduct.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {relatedProduct.name}
                                        </h3>

                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-lg font-bold text-gray-900">
                                                {relatedProduct.formatted_price}
                                            </span>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                {relatedProduct.sold_count} sold
                                            </div>
                                        </div>

                                        <Link
                                            href={`/products/${relatedProduct.slug}`}
                                            className="block w-full bg-gray-900 text-white text-center px-4 py-2 rounded font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
