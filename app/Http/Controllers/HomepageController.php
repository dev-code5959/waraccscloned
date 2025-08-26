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
        $categories = Category::with('children')
            ->rootCategories()
            ->limit(5)
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
                    'products' => Product::whereIn('id', $category->getAllProductIds())->limit(5)->active()->get()->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'slug' => $product->slug,
                            'description' => $product->description,
                            'price' => $product->price,
                            'formatted_price' => '$' . number_format($product->price, 2),
                            'manual_delivery' => $product->manual_delivery,
                            'stock_quantity' => $product->stock_quantity,
                            'is_in_stock' => $product->is_in_stock,
                            'available_stock' => $product->available_access_codes_count ?? $product->stock_quantity,
                            'features' => $product->features,
                            'main_image' => $product->main_image,
                            'category' => $product->category ? [
                                'id' => $product->category->id,
                                'name' => $product->category->name,
                                'slug' => $product->category->slug,
                            ] : null,
                        ];
                    }),
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

        return Inertia::render('Homepage', [
            'categories' => $categories,
            'stats' => $stats,
            'meta' => [
                'title' => config('app.name') . ' - Digital Products Store',
                'description' => 'Buy verified digital accounts, licenses, and more. Fast delivery and secure payments.',
                'keywords' => ['digital products', 'verified accounts', 'instant delivery'],
            ],
        ]);
    }

    /**
     * Handle search functionality
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $categorySlug = $request->get('category', '');
        $sortBy = $request->get('sort', 'relevance');
        $priceMin = $request->get('price_min', 0);
        $priceMax = $request->get('price_max', 1000);
        $perPage = $request->get('per_page', 12);

        // Build the search query
        $productsQuery = Product::with(['category'])
            ->where('is_active', true);

        // Apply search filters
        if (!empty($query)) {
            $productsQuery->where(function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                    ->orWhere('description', 'like', '%' . $query . '%')
                    ->orWhere('features', 'like', '%' . $query . '%')
                    ->orWhereHas('category', function ($categoryQuery) use ($query) {
                        $categoryQuery->where('name', 'like', '%' . $query . '%');
                    });
            });
        }

        // Apply category filter
        if (!empty($categorySlug)) {
            $productsQuery->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Apply price range filter
        if ($priceMin > 0 || $priceMax < 1000) {
            $productsQuery->whereBetween('price', [$priceMin, $priceMax]);
        }

        // Apply sorting
        switch ($sortBy) {
            case 'name':
                $productsQuery->orderBy('name', 'asc');
                break;
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
            default: // relevance
                if (!empty($query)) {
                    // Basic relevance: exact matches first, then partial matches
                    $productsQuery->orderByRaw("
                    CASE
                        WHEN name LIKE ? THEN 1
                        WHEN description LIKE ? THEN 2
                        ELSE 3
                    END, name ASC
                ", ['%' . $query . '%', '%' . $query . '%']);
                } else {
                    $productsQuery->orderBy('created_at', 'desc');
                }
                break;
        }

        // Get paginated results
        $products = $productsQuery->paginate($perPage);

        // Transform products data
        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'formatted_price' => '$' . number_format($product->price, 2),
                'is_in_stock' => $product->is_in_stock,
                'available_stock' => $product->manual_delivery ? 999 : ($product->available_access_codes_count ?? $product->stock_quantity),
                'stock_quantity' => $product->manual_delivery ? 999 : $product->stock_quantity,
                'features' => $product->features,
                'main_image' => $product->main_image,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
            ];
        });

        // Get all categories for filter dropdown with accurate product counts
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                // Use direct database query for more accurate count
                $productsCount = Product::where('category_id', $category->id)
                    ->where('is_active', true)
                    ->count();

                // If you want to include child categories, use this instead:
                // $productsCount = $category->getRecursiveProductCount();

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'products_count' => $productsCount,
                ];
            })
            ->filter(function ($category) {
                // Only include categories that have products
                return $category['products_count'] > 0;
            })
            ->values()
            ->toArray();

        // Generate search suggestions
        $suggestions = [];
        if (!empty($query) && $products->total() === 0) {
            $suggestions = $this->generateSearchSuggestions($query);
        }

        // Popular searches (could be from database)
        $popularSearches = [
            'Gmail PVA',
            'Gmail SMTP',
            'Facebook accounts',
            'Instagram accounts',
            'LinkedIn accounts',
            'Twitter accounts',
            'YouTube accounts',
            'Discord accounts',
        ];

        return Inertia::render('SearchPage', [
            'query' => $query,
            'results' => [
                'data' => $products->items(),
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'prev_page_url' => $products->previousPageUrl(),
                'next_page_url' => $products->nextPageUrl(),
                'path' => $products->path(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'categories' => $categories,
            'filters' => [
                'category' => $categorySlug,
                'sort' => $sortBy,
                'price_min' => $priceMin,
                'price_max' => $priceMax,
            ],
            'suggestions' => $suggestions,
            'popularSearches' => $popularSearches,
            'meta' => [
                'title' => !empty($query)
                    ? "Search results for '{$query}' - " . config('app.name')
                    : 'Search Products - ' . config('app.name'),
                'description' => !empty($query)
                    ? "Find {$query} and more digital accounts. Instant delivery, secure payments."
                    : 'Search our catalog of premium digital accounts and services.',
            ],
        ]);
    }


    /**
     * Generate search suggestions when no results found
     */
    private function generateSearchSuggestions($query)
    {
        $suggestions = [];

        // Get similar product names
        $similarProducts = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $words = explode(' ', $query);
                foreach ($words as $word) {
                    if (strlen($word) > 2) {
                        $q->orWhere('name', 'like', '%' . $word . '%')
                            ->orWhere('description', 'like', '%' . $word . '%');
                    }
                }
            })
            ->limit(3)
            ->pluck('name')
            ->toArray();

        // Add category names
        $similarCategories = Category::where('is_active', true)
            ->where('name', 'like', '%' . $query . '%')
            ->limit(2)
            ->pluck('name')
            ->toArray();

        // Combine suggestions
        $suggestions = array_merge($similarProducts, $similarCategories);

        // Add some default suggestions if no similar items found
        if (empty($suggestions)) {
            $suggestions = ['Gmail accounts', 'PVA accounts', 'SMTP accounts'];
        }

        return array_unique($suggestions);
    }
}
