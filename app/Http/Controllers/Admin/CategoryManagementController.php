<?php
// File: app/Http/Controllers/Admin/CategoryManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CategoryManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with(['parent', 'children'])
            ->withCount(['products', 'activeProducts']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Parent filter
        if ($request->filled('parent')) {
            if ($request->parent === 'parent') {
                $query->whereNull('parent_id');
            } elseif ($request->parent === 'child') {
                $query->whereNotNull('parent_id');
            } elseif (is_numeric($request->parent)) {
                $query->where('parent_id', $request->parent);
            }
        }

        // Sorting
        $sortField = $request->get('sort', 'sort_order');
        $sortDirection = $request->get('direction', 'asc');

        if ($sortField === 'sort_order') {
            $query->orderBy('parent_id', 'asc')
                ->orderBy('sort_order', $sortDirection)
                ->orderBy('name', 'asc');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $categories = $query->paginate(15)->withQueryString();

        // Get stats
        $stats = [
            'total_categories' => Category::count(),
            'active_categories' => Category::where('is_active', true)->count(),
            'parent_categories' => Category::whereNull('parent_id')->count(),
            'child_categories' => Category::whereNotNull('parent_id')->count(),
            'categories_with_products' => Category::has('products')->count(),
            'empty_categories' => Category::doesntHave('products')->count(),
        ];

        // Get parent categories for filter
        $parentCategories = Category::whereNull('parent_id')
            ->orderBy('sort_order')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'stats' => $stats,
            'parentCategories' => $parentCategories,
            'filters' => $request->only(['search', 'status', 'parent', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $parentCategories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Categories/Create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $categoryData = $request->only(['name', 'description', 'icon', 'parent_id', 'is_active']);

            // Generate slug if not provided
            if ($request->filled('slug')) {
                $categoryData['slug'] = $this->generateSlug($request->slug);
            } else {
                $categoryData['slug'] = $this->generateSlug($request->name);
            }

            // Set sort order
            if ($request->filled('sort_order')) {
                $categoryData['sort_order'] = $request->sort_order;
            } else {
                $maxOrder = Category::where('parent_id', $request->parent_id)->max('sort_order') ?? 0;
                $categoryData['sort_order'] = $maxOrder + 1;
            }

            $category = Category::create($categoryData);

            // Log the action
            activity()
                ->performedOn($category)
                ->causedBy(auth()->user())
                ->log('Category created');

            DB::commit();

            return redirect()->route('admin.categories.index')
                ->with('success', 'Category created successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to create category: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Category $category)
    {
        $category->load([
            'parent',
            'children' => function ($query) {
                $query->withCount('products')->orderBy('sort_order');
            },
            'products' => function ($query) {
                $query->with('category')->latest()->take(10);
            }
        ]);

        // Get category statistics
        $stats = [
            'total_products' => $category->products()->count(),
            'active_products' => $category->activeProducts()->count(),
            'children_count' => $category->children()->count(),
            'depth' => $category->getAllAncestors()->count(),
        ];

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category,
            'stats' => $stats,
        ]);
    }

    public function edit(Category $category)
    {
        $parentCategories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->where('id', '!=', $category->id) // Exclude self
            ->orderBy('sort_order')
            ->select('id', 'name')
            ->get();

        // Remove descendants from potential parents to prevent circular references
        $descendants = $category->getAllChildren();
        $parentCategories = $parentCategories->reject(function ($parent) use ($descendants) {
            return $descendants->contains('id', $parent->id);
        });

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value && $value == $category->id) {
                        $fail('Category cannot be its own parent.');
                    }
                    if ($value && $category->getAllChildren()->contains('id', $value)) {
                        $fail('Cannot set a descendant as parent.');
                    }
                }
            ],
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $categoryData = $request->only(['name', 'description', 'icon', 'parent_id', 'is_active']);

            // Update slug if provided
            if ($request->filled('slug')) {
                $categoryData['slug'] = $this->generateSlug($request->slug, $category->id);
            } elseif ($request->name !== $category->name) {
                $categoryData['slug'] = $this->generateSlug($request->name, $category->id);
            }

            // Update sort order if provided
            if ($request->filled('sort_order')) {
                $categoryData['sort_order'] = $request->sort_order;
            }

            $category->update($categoryData);

            // Log the action
            activity()
                ->performedOn($category)
                ->causedBy(auth()->user())
                ->log('Category updated');

            DB::commit();

            return redirect()->route('admin.categories.show', $category)
                ->with('success', 'Category updated successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to update category: ' . $e->getMessage()
            ]);
        }
    }

    public function destroy(Category $category)
    {
        if ($category->products()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete category with existing products. Please move or delete products first.'
            ]);
        }

        // Store the name for the success message
        $categoryName = $category->name;

        // Move children to parent level
        if ($category->children()->exists()) {
            $category->children()->update(['parent_id' => $category->parent_id]);
        }

        $category->delete();

        // Log the action
        activity()
            ->causedBy(auth()->user())
            ->withProperties(['deleted_category' => $categoryName])
            ->log('Category deleted');

        return redirect()->route('admin.categories.index')
            ->with('success', "Category '{$categoryName}' deleted successfully.");
    }

    public function toggleStatus(Category $category)
    {
        $category->update(['is_active' => !$category->is_active]);

        $status = $category->is_active ? 'activated' : 'deactivated';

        // Log the action
        activity()
            ->performedOn($category)
            ->causedBy(auth()->user())
            ->log("Category {$status}");

        return back()->with('success', "Category {$status} successfully.");
    }

    public function moveUp(Category $category)
    {
        $previousCategory = Category::where('parent_id', $category->parent_id)
            ->where('sort_order', '<', $category->sort_order)
            ->orderBy('sort_order', 'desc')
            ->first();

        if ($previousCategory) {
            $tempOrder = $category->sort_order;
            $category->sort_order = $previousCategory->sort_order;
            $previousCategory->sort_order = $tempOrder;

            $category->save();
            $previousCategory->save();
        }

        return back()->with('success', 'Category moved up successfully.');
    }

    public function moveDown(Category $category)
    {
        $nextCategory = Category::where('parent_id', $category->parent_id)
            ->where('sort_order', '>', $category->sort_order)
            ->orderBy('sort_order', 'asc')
            ->first();

        if ($nextCategory) {
            $tempOrder = $category->sort_order;
            $category->sort_order = $nextCategory->sort_order;
            $nextCategory->sort_order = $tempOrder;

            $category->save();
            $nextCategory->save();
        }

        return back()->with('success', 'Category moved down successfully.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $categories = Category::whereIn('id', $request->category_ids);
        $count = $categories->count();

        DB::beginTransaction();

        try {
            switch ($request->action) {
                case 'activate':
                    $categories->update(['is_active' => true]);
                    $message = "Activated {$count} categories";
                    break;

                case 'deactivate':
                    $categories->update(['is_active' => false]);
                    $message = "Deactivated {$count} categories";
                    break;

                case 'delete':
                    // Check if any categories have products
                    $categoriesWithProducts = $categories->has('products')->count();
                    if ($categoriesWithProducts > 0) {
                        throw new \Exception("{$categoriesWithProducts} categories have products and cannot be deleted.");
                    }

                    // Move children to parent level for each category being deleted
                    foreach ($categories->get() as $category) {
                        $category->children()->update(['parent_id' => $category->parent_id]);
                    }

                    $categories->delete();
                    $message = "Deleted {$count} categories";
                    break;
            }

            // Log bulk action
            activity()
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => $request->action,
                    'category_count' => $count
                ])
                ->log('Bulk action performed on categories');

            DB::commit();

            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Bulk action failed: ' . $e->getMessage()
            ]);
        }
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer|min:0',
            'categories.*.parent_id' => 'nullable|exists:categories,id',
        ]);

        DB::beginTransaction();

        try {
            foreach ($request->categories as $categoryData) {
                Category::where('id', $categoryData['id'])->update([
                    'sort_order' => $categoryData['sort_order'],
                    'parent_id' => $categoryData['parent_id'],
                ]);
            }

            // Log the action
            activity()
                ->causedBy(auth()->user())
                ->withProperties(['categories_count' => count($request->categories)])
                ->log('Categories reordered');

            DB::commit();

            return back()->with('success', 'Categories reordered successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to reorder categories: ' . $e->getMessage()
            ]);
        }
    }

    public function getTree()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }

    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:csv',
        ]);

        $categories = Category::with(['parent', 'children'])
            ->withCount(['products', 'activeProducts'])
            ->orderBy('sort_order')
            ->get();

        $filename = 'categories_' . now()->format('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($categories) {
            $handle = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($handle, [
                'ID',
                'Name',
                'Slug',
                'Description',
                'Parent Category',
                'Sort Order',
                'Status',
                'Total Products',
                'Active Products',
                'Children Count',
                'Created At',
            ]);

            // CSV Data
            foreach ($categories as $category) {
                fputcsv($handle, [
                    $category->id,
                    $category->name,
                    $category->slug,
                    $category->description ?: 'N/A',
                    $category->parent?->name ?: 'Root',
                    $category->sort_order,
                    $category->is_active ? 'Active' : 'Inactive',
                    $category->products_count,
                    $category->active_products_count,
                    $category->children->count(),
                    $category->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function generateSlug($name, $excludeId = null)
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (Category::where('slug', $slug)->when($excludeId, function ($query) use ($excludeId) {
            return $query->where('id', '!=', $excludeId);
        })->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
