<?php
// File: app/Http/Controllers/Admin/ProductManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\AccessCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProductManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'availableAccessCodes'])
            ->withCount(['accessCodes', 'availableAccessCodes', 'orders']);

        // Search functionality
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Stock filter
        if ($request->filled('stock')) {
            if ($request->stock === 'in_stock') {
                $query->inStock();
            } elseif ($request->stock === 'out_of_stock') {
                $query->where('manual_delivery', false)->where('stock_quantity', 0);
            }
        }

        // Delivery type filter
        if ($request->filled('delivery_type')) {
            if ($request->delivery_type === 'manual') {
                $query->where('manual_delivery', true);
            } elseif ($request->delivery_type === 'automatic') {
                $query->where('manual_delivery', false);
            }
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate(15)->withQueryString();

        $categories = Category::active()->orderBy('name')->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status', 'stock', 'delivery_type', 'sort_field', 'sort_direction'])
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'accessCodes' => function ($query) {
            $query->orderBy('status')->orderBy('created_at', 'desc');
        }]);

        $stats = [
            'total_codes' => $product->accessCodes()->count(),
            'available_codes' => $product->availableAccessCodes()->count(),
            'sold_codes' => $product->accessCodes()->where('status', 'sold')->count(),
            'reserved_codes' => $product->accessCodes()->where('status', 'reserved')->count(),
            'total_orders' => $product->orders()->count(),
            'total_revenue' => $product->orders()->where('status', 'completed')->sum('total_amount'),
            'is_manual_delivery' => $product->manual_delivery,
        ];

        return Inertia::render('Admin/Products/Show', [
            'product' => [
                ...$product->toArray(),
                'access_codes' => $product->manual_delivery ? [] : $product->accessCodes()
                    ->get()
                    ->transform(function ($accessCode) {
                        return [
                            ...$accessCode->toArray(),
                            'password' => $accessCode->makeHidden('password')->password ? '********' : null,
                        ];
                    })->toArray(),
            ],
            'stats' => $stats
        ]);
    }

    public function create()
    {
        $categories = Category::active()->orderBy('name')->get();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products',
            'description' => 'required|string',
            'features' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'min_purchase' => 'required|integer|min:1',
            'max_purchase' => 'nullable|integer|min:1',
            'delivery_info' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'manual_delivery' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Ensure slug is unique
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Set stock quantity to 0 for manual delivery products
        if ($validated['manual_delivery'] ?? false) {
            $validated['stock_quantity'] = 0;
        } else {
            $validated['stock_quantity'] = 0; // Will be updated when access codes are added
        }

        DB::beginTransaction();
        try {
            $product = Product::create($validated);

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $product->addMedia($image)
                        ->toMediaCollection('images');
                }
            }

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Product created successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
    }

    public function edit(Product $product)
    {
        $categories = Category::active()->orderBy('name')->get();
        $product->load('media');

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'description' => 'required|string',
            'features' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'min_purchase' => 'required|integer|min:1',
            'max_purchase' => 'nullable|integer|min:1',
            'delivery_info' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'manual_delivery' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'integer'
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // If switching to manual delivery, clear access codes warning
        $switchingToManual = !$product->manual_delivery && ($validated['manual_delivery'] ?? false);

        DB::beginTransaction();
        try {
            $product->update($validated);

            // If switching to manual delivery, update stock quantity
            if ($switchingToManual) {
                $product->update(['stock_quantity' => 0]);
            } elseif (!$validated['manual_delivery'] ?? true) {
                // If switching from manual to automatic, update stock based on access codes
                $product->updateStock();
            }

            // Handle image removals
            if ($request->filled('remove_images')) {
                $product->media()->whereIn('id', $request->remove_images)->delete();
            }

            // Handle new image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $product->addMedia($image)
                        ->toMediaCollection('images');
                }
            }

            DB::commit();

            $message = 'Product updated successfully.';
            if ($switchingToManual) {
                $message .= ' Note: Product is now set to manual delivery - access codes will not be automatically assigned.';
            }

            return redirect()->route('admin.products.show', $product)
                ->with('success', $message);
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update product: ' . $e->getMessage()]);
        }
    }

    public function destroy(Product $product)
    {
        DB::beginTransaction();
        try {
            // Check if product has active orders
            if ($product->orders()->whereIn('status', ['pending', 'processing'])->exists()) {
                return back()->withErrors(['error' => 'Cannot delete product with active orders.']);
            }

            // Delete all access codes (only for non-manual delivery products)
            if (!$product->manual_delivery) {
                $product->accessCodes()->delete();
            }

            // Delete media
            $product->clearMediaCollection('images');

            // Delete product
            $product->delete();

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Product deleted successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to delete product: ' . $e->getMessage()]);
        }
    }

    public function toggleStatus(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);

        $status = $product->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Product {$status} successfully.");
    }

    public function bulkUploadCodes(Request $request, Product $product)
    {
        // Prevent uploading codes for manual delivery products
        if ($product->manual_delivery) {
            return back()->withErrors(['error' => 'Cannot upload access codes for manual delivery products.']);
        }

        $request->validate([
            'codes' => 'required|string',
            'format' => 'required|in:email:password,username:password,email_only,custom'
        ]);

        $codes = array_filter(array_map('trim', explode("\n", $request->codes)));

        if (empty($codes)) {
            return back()->withErrors(['codes' => 'No valid codes provided.']);
        }

        DB::beginTransaction();
        try {
            $imported = 0;
            $duplicates = 0;

            foreach ($codes as $line) {
                if (empty($line)) continue;

                $accessCodeData = ['product_id' => $product->id];

                switch ($request->format) {
                    case 'email:password':
                        $parts = explode(':', $line, 2);
                        if (count($parts) === 2) {
                            $accessCodeData['email'] = trim($parts[0]);
                            $accessCodeData['password'] = trim($parts[1]);
                        }
                        break;

                    case 'username:password':
                        $parts = explode(':', $line, 2);
                        if (count($parts) === 2) {
                            $accessCodeData['username'] = trim($parts[0]);
                            $accessCodeData['password'] = trim($parts[1]);
                        }
                        break;

                    case 'email_only':
                        $accessCodeData['email'] = trim($line);
                        break;

                    case 'custom':
                        $accessCodeData['additional_info'] = trim($line);
                        break;
                }

                // Check for duplicates
                $exists = AccessCode::where('product_id', $product->id)
                    ->where(function ($query) use ($accessCodeData) {
                        if (isset($accessCodeData['email'])) {
                            $query->where('email', $accessCodeData['email']);
                        }
                        if (isset($accessCodeData['username'])) {
                            $query->where('username', $accessCodeData['username']);
                        }
                        if (isset($accessCodeData['additional_info'])) {
                            $query->where('additional_info', $accessCodeData['additional_info']);
                        }
                    })->exists();

                if (!$exists) {
                    AccessCode::create($accessCodeData);
                    $imported++;
                } else {
                    $duplicates++;
                }
            }

            // Update product stock
            $product->updateStock();

            DB::commit();

            $message = "Imported {$imported} access codes successfully.";
            if ($duplicates > 0) {
                $message .= " {$duplicates} duplicates were skipped.";
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to import codes: ' . $e->getMessage()]);
        }
    }

    public function categories()
    {
        $categories = Category::withCount(['products'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        Category::create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    public function updateCategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'parent_id' => ['nullable', 'exists:categories,id', function ($attribute, $value, $fail) use ($category) {
                if ($value == $category->id) {
                    $fail('A category cannot be its own parent.');
                }
            }],
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroyCategory(Category $category)
    {
        if ($category->products()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete category with existing products.']);
        }

        if ($category->children()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete category with subcategories.']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
