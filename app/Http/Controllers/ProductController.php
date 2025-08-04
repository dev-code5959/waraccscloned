<?php
// File: app/Http/Controllers/ProductController.php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        // Load relationships
        $product->load(['category', 'media']);

        // Get related products
        $relatedProducts = Product::with(['category', 'media'])
            ->active()
            ->inStock()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get()
            ->map(function ($relatedProduct) {
                return [
                    'id' => $relatedProduct->id,
                    'name' => $relatedProduct->name,
                    'slug' => $relatedProduct->slug,
                    'price' => $relatedProduct->price,
                    'formatted_price' => $relatedProduct->formatted_price,
                    'thumbnail' => $relatedProduct->thumbnail,
                    'sold_count' => $relatedProduct->sold_count,
                ];
            });

        // Format product data
        $productData = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'features' => $product->features,
            'price' => $product->price,
            'formatted_price' => $product->formatted_price,
            'stock_quantity' => $product->stock_quantity,
            'sold_count' => $product->sold_count,
            'min_purchase' => $product->min_purchase,
            'max_purchase' => $product->max_purchase,
            'delivery_info' => $product->delivery_info,
            'is_in_stock' => $product->is_in_stock,
            'available_stock' => $product->available_stock,
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
                'breadcrumb' => $product->category->breadcrumb->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                    ];
                }),
            ],
            'images' => $product->image_gallery,
            'main_image' => $product->main_image,
        ];

        return Inertia::render('ProductDetail', [
            'product' => $productData,
            'relatedProducts' => $relatedProducts,
            'meta' => [
                'title' => $product->name,
                'description' => $product->description,
                'image' => $product->main_image,
            ],
        ]);
    }

    public function category(Category $category)
    {
        $category->load('children');

        // Get all product IDs for this category and its children
        $productIds = $category->getAllProductIds();

        $products = Product::with(['category', 'media'])
            ->whereIn('id', $productIds)
            ->active()
            ->paginate(12)
            ->withQueryString();

        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'formatted_price' => $product->formatted_price,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'thumbnail' => $product->thumbnail,
                'stock_quantity' => $product->stock_quantity,
                'sold_count' => $product->sold_count,
                'is_in_stock' => $product->is_in_stock,
            ];
        });

        $categoryData = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'breadcrumb' => $category->breadcrumb->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                ];
            }),
            'children' => $category->children->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                    'products_count' => $child->getTotalProductsCount(),
                ];
            }),
            'products_count' => $category->getTotalProductsCount(),
        ];

        return Inertia::render('CategoryListing', [
            'category' => $categoryData,
            'products' => $products,
            'meta' => [
                'title' => $category->name . ' - Digital Products',
                'description' => $category->description ?: "Browse {$category->name} digital products",
            ],
        ]);
    }

    public function checkAvailability(Request $request, Product $product)
    {
        $quantity = $request->get('quantity', 1);

        $canPurchase = $product->canPurchase($quantity);
        $availableStock = $product->available_stock;

        return response()->json([
            'can_purchase' => $canPurchase,
            'available_stock' => $availableStock,
            'stock_quantity' => $product->stock_quantity,
            'message' => $canPurchase
                ? "Ready to purchase {$quantity} item(s)"
                : ($availableStock < $quantity
                    ? "Only {$availableStock} item(s) available"
                    : "Product is not available for purchase"),
        ]);
    }

    public function validateQuantity(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $quantity = $request->quantity;

        // Check minimum purchase requirement
        if ($quantity < $product->min_purchase) {
            return response()->json([
                'valid' => false,
                'message' => "Minimum purchase quantity is {$product->min_purchase}",
            ], 422);
        }

        // Check maximum purchase limit
        if ($product->max_purchase && $quantity > $product->max_purchase) {
            return response()->json([
                'valid' => false,
                'message' => "Maximum purchase quantity is {$product->max_purchase}",
            ], 422);
        }

        // Check stock availability
        if (!$product->canPurchase($quantity)) {
            return response()->json([
                'valid' => false,
                'message' => "Insufficient stock. Only {$product->available_stock} available",
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'subtotal' => $product->price * $quantity,
            'formatted_subtotal' => '$' . number_format($product->price * $quantity, 2),
            'message' => 'Quantity is valid',
        ]);
    }
}
