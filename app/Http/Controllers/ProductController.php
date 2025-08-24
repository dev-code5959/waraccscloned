<?php
// File: app/Http/Controllers/ProductController.php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function categories()
    {
        $categories = Category::with('children')
            ->rootCategories()
            ->active()
            ->ordered()
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'products_count' => $category->getTotalProductsCount(),
                    'children' => $category->children->map(function ($child) {
                        return [
                            'id' => $child->id,
                            'name' => $child->name,
                            'slug' => $child->slug,
                            'products_count' => $child->getTotalProductsCount(),
                        ];
                    }),
                ];
            });

        $stats = [
            'total_categories' => Category::active()->count(),
            'total_products' => Product::active()->count(),
            'in_stock_products' => Product::active()->inStock()->count(),
        ];

        return Inertia::render('Categories', [
            'categories' => $categories,
            'stats' => $stats,
            'meta' => [
                'title' => 'All Categories - Digital Products Store',
                'description' => 'Browse all product categories. Find verified accounts, licenses, and digital products.',
            ],
        ]);
    }

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
                    'manual_delivery' => $relatedProduct->manual_delivery,
                    'is_in_stock' => $relatedProduct->is_in_stock,
                    'available_stock' => $relatedProduct->available_stock,
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
            'manual_delivery' => $product->manual_delivery,
            'is_in_stock' => $product->is_in_stock,
            'available_stock' => $product->manual_delivery ? $product->stock_quantity - $product->sold_count : $product->available_stock,
            'effective_stock_quantity' => $product->effective_stock_quantity,
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

    public function category(Request $request, Category $category)
    {
        $category->load('children');

        // Get filter parameters
        $sortBy = $request->get('sort', 'name');
        $priceMin = $request->get('price_min', 0);
        $priceMax = $request->get('price_max', 1000);
        $inStockOnly = $request->boolean('in_stock');
        $phoneVerified = $request->boolean('phone_verified');
        $smtpEnabled = $request->boolean('smtp_enabled');
        $deliveryType = $request->get('delivery_type', '');
        $perPage = $request->get('per_page', 12);

        // Get all product IDs for this category and its children
        $productIds = $category->getAllProductIds();

        // Build the query
        $productsQuery = Product::with(['category', 'media'])
            ->whereIn('id', $productIds)
            ->where('is_active', true);

        // Apply filters
        if ($inStockOnly) {
            $productsQuery->inStock();
        }

        if ($priceMin > 0 || $priceMax < 1000) {
            $productsQuery->whereBetween('price', [$priceMin, $priceMax]);
        }

        if ($phoneVerified) {
            $productsQuery->where(function ($query) {
                $query->where('features', 'like', '%phone%verified%')
                    ->orWhere('features', 'like', '%phone%')
                    ->orWhere('name', 'like', '%PVA%')
                    ->orWhere('description', 'like', '%phone%verified%');
            });
        }

        if ($smtpEnabled) {
            $productsQuery->where(function ($query) {
                $query->where('features', 'like', '%smtp%')
                    ->orWhere('name', 'like', '%smtp%')
                    ->orWhere('description', 'like', '%smtp%');
            });
        }

        // Filter by delivery type
        if ($deliveryType === 'manual') {
            $productsQuery->where('manual_delivery', true);
        } elseif ($deliveryType === 'automatic') {
            $productsQuery->where('manual_delivery', false);
        }

        // Apply sorting
        switch ($sortBy) {
            case 'price_asc':
                $productsQuery->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $productsQuery->orderBy('price', 'desc');
                break;
            case 'created_at':
                $productsQuery->orderBy('created_at', 'desc');
                break;
            case 'popularity':
                $productsQuery->orderBy('sold_count', 'desc');
                break;
            case 'name':
            default:
                $productsQuery->orderBy('name', 'asc');
                break;
        }

        // Get paginated results
        $products = $productsQuery->paginate($perPage)->withQueryString();

        // Transform products data
        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'features' => $product->features,
                'price' => $product->price,
                'formatted_price' => $product->formatted_price,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'thumbnail' => $product->thumbnail,
                'stock_quantity' => $product->stock_quantity,
                'available_stock' => $product->manual_delivery ? $product->stock_quantity - $product->sold_count : $product->available_stock,
                'effective_stock_quantity' => $product->effective_stock_quantity,
                'sold_count' => $product->sold_count,
                'is_in_stock' => $product->is_in_stock,
                'manual_delivery' => $product->manual_delivery,
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

        return Inertia::render('CategoryPage', [
            'category' => $categoryData,
            'products' => [
                'data' => $products->items(),
                'total' => $products->total(),
            ],
            'subcategories' => $categoryData['children'],
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
                'prev_page_url' => $products->previousPageUrl(),
                'next_page_url' => $products->nextPageUrl(),
                'path' => $products->path(),
            ],
            'filters' => [
                'sort' => $sortBy,
                'in_stock' => $inStockOnly,
                'phone_verified' => $phoneVerified,
                'smtp_enabled' => $smtpEnabled,
                'delivery_type' => $deliveryType,
                'price_min' => $priceMin,
                'price_max' => $priceMax,
            ],
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

        // For manual delivery products, always show as available
        if ($product->manual_delivery) {
            return response()->json([
                'can_purchase' => $canPurchase,
                'available_stock' => 'unlimited',
                'stock_quantity' => 'unlimited',
                'is_manual_delivery' => true,
                'message' => $canPurchase
                    ? "Ready to purchase {$quantity} item(s) - Manual Delivery"
                    : "Product purchase requirements not met",
            ]);
        }

        return response()->json([
            'can_purchase' => $canPurchase,
            'available_stock' => $availableStock,
            'stock_quantity' => $product->stock_quantity,
            'is_manual_delivery' => false,
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

        // For manual delivery products, skip stock check
        if ($product->manual_delivery) {
            return response()->json([
                'valid' => true,
                'subtotal' => $product->price * $quantity,
                'formatted_subtotal' => '$' . number_format($product->price * $quantity, 2),
                'is_manual_delivery' => true,
                'message' => 'Quantity is valid - Manual Delivery',
            ]);
        }

        // Check stock availability for automatic delivery
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
            'is_manual_delivery' => false,
            'message' => 'Quantity is valid',
        ]);
    }

    public function checkStock(Request $request, Product $product)
    {
        $quantity = $request->input('quantity', 1);

        // For manual delivery products, always return as in stock
        if ($product->manual_delivery) {
            return response()->json([
                'in_stock' => $product->is_active,
                'available_stock' => 'unlimited',
                'requested_quantity' => $quantity,
                'is_manual_delivery' => true,
            ]);
        }

        $availableStock = $product->available_stock ?? $product->stock_quantity;

        return response()->json([
            'in_stock' => $product->is_in_stock && $availableStock >= $quantity,
            'available_stock' => $availableStock,
            'requested_quantity' => $quantity,
            'is_manual_delivery' => false,
        ]);
    }
}
