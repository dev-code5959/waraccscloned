<?php
// File: app/Http/Controllers/HomepageController.php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomepageController extends Controller
{
    public function index()
    {
        $featuredProducts = Product::with(['category', 'media'])
            ->active()
            ->featured()
            ->inStock()
            ->limit(8)
            ->get()
            ->map(function ($product) {
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

        $popularProducts = Product::with(['category', 'media'])
            ->active()
            ->inStock()
            ->popular()
            ->limit(6)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'formatted_price' => $product->formatted_price,
                    'category' => $product->category->name,
                    'thumbnail' => $product->thumbnail,
                    'sold_count' => $product->sold_count,
                ];
            });

        $stats = [
            'total_products' => Product::active()->count(),
            'total_categories' => Category::active()->count(),
            'total_sales' => Product::sum('sold_count'),
            'happy_customers' => \App\Models\User::role('customer')->count(),
        ];


            return Inertia::render('Homepage', [
            'featuredProducts' => $featuredProducts,
            'categories' => $categories,
            'popularProducts' => $popularProducts,
            'stats' => $stats,
            'meta' => [
                'title' => config('app.name') . ' - Digital Products Store',
                'description' => 'Buy verified digital accounts, licenses, and more. Fast delivery and secure payments.',
                'keywords' => ['digital products', 'verified accounts', 'instant delivery'],
            ],
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $categoryId = $request->get('category');
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $sortBy = $request->get('sort', 'name');
        $perPage = min($request->get('per_page', 12), 50);

        $products = Product::with(['category', 'media'])
            ->active()
            ->when($query, function ($q) use ($query) {
                $q->search($query);
            })
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->byCategory($categoryId);
            })
            ->when($minPrice || $maxPrice, function ($q) use ($minPrice, $maxPrice) {
                $q->priceRange($minPrice, $maxPrice);
            })
            ->when($sortBy === 'price_low', function ($q) {
                $q->orderBy('price', 'asc');
            })
            ->when($sortBy === 'price_high', function ($q) {
                $q->orderBy('price', 'desc');
            })
            ->when($sortBy === 'popular', function ($q) {
                $q->popular();
            })
            ->when($sortBy === 'newest', function ($q) {
                $q->orderBy('created_at', 'desc');
            })
            ->when($sortBy === 'name', function ($q) {
                $q->orderBy('name', 'asc');
            })
            ->paginate($perPage)
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

        $categories = Category::active()
            ->ordered()
            ->get(['id', 'name', 'slug']);

        return Inertia::render('SearchResults', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'query' => $query,
                'category_id' => $categoryId,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'sort_by' => $sortBy,
            ],
            'meta' => [
                'title' => $query ? "Search results for '{$query}'" : 'Search Products',
                'description' => "Find the perfect digital products for your needs.",
            ],
        ]);
    }
}
