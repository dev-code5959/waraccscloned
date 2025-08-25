<?php
// File: app/Models/Product.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'features',
        'price',
        'stock_quantity',
        'sold_count',
        'category_id',
        'images',
        'is_featured',
        'is_active',
        'manual_delivery',
        'min_purchase',
        'max_purchase',
        'delivery_info',
        'product_code_number',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'sold_count' => 'integer',
        'images' => 'json',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'manual_delivery' => 'boolean',
        'min_purchase' => 'integer',
        'max_purchase' => 'integer',
        'product_code_number' => 'string',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'price', 'stock_quantity', 'is_active', 'manual_delivery'])
            ->logOnlyDirty();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10);

        $this->addMediaConversion('preview')
            ->width(600)
            ->height(600)
            ->sharpen(10);
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function accessCodes()
    {
        return $this->hasMany(AccessCode::class);
    }

    public function availableAccessCodes()
    {
        return $this->hasMany(AccessCode::class)->where('status', 'available');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->where('manual_delivery', true)
                ->orWhere('stock_quantity', '>', 0);
        });
    }

    public function scopePopular($query)
    {
        return $query->orderBy('sold_count', 'desc');
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('features', 'like', "%{$term}%");
        });
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopePriceRange($query, $min = null, $max = null)
    {
        if ($min !== null) {
            $query->where('price', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price', '<=', $max);
        }
        return $query;
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    public function getIsInStockAttribute()
    {
        return $this->manual_delivery || $this->stock_quantity > 0;
    }

    public function getAvailableStockAttribute()
    {
        if ($this->manual_delivery) {
            return PHP_INT_MAX; // Infinite stock for manual delivery
        }
        return $this->availableAccessCodes()->count();
    }

    public function getEffectiveStockQuantityAttribute()
    {
        if ($this->manual_delivery) {
            return PHP_INT_MAX; // Infinite stock for manual delivery
        }
        return $this->stock_quantity;
    }

    public function getMainImageAttribute()
    {
        $media = $this->getFirstMedia('images');
        return $media ? $media->getUrl('preview') : null;
    }

    public function getThumbnailAttribute()
    {
        $media = $this->getFirstMedia('images');
        return $media ? $media->getUrl('thumb') : null;
    }

    public function getImageGalleryAttribute()
    {
        return $this->getMedia('images')->map(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'preview' => $media->getUrl('preview'),
            ];
        });
    }

    // Helper Methods
    public function canPurchase($quantity = 1)
    {
        return $this->is_active &&
            ($this->manual_delivery || $this->available_stock >= $quantity) &&
            $quantity >= $this->min_purchase &&
            ($this->max_purchase === null || $quantity <= $this->max_purchase);
    }

    public function reserveAccessCodes($quantity)
    {
        if ($this->manual_delivery) {
            // For manual delivery, we don't need to reserve access codes
            return collect();
        }

        $codes = $this->availableAccessCodes()
            ->limit($quantity)
            ->get();

        if ($codes->count() < $quantity) {
            throw new \Exception('Insufficient stock available');
        }

        $codes->each(function ($code) {
            $code->update(['status' => 'reserved']);
        });

        return $codes;
    }

    public function updateStock()
    {
        if ($this->manual_delivery) {
            // For manual delivery products, we don't track stock quantity
            $this->update(['stock_quantity' => 0]);
            return PHP_INT_MAX;
        }

        $availableCount = $this->availableAccessCodes()->count();
        $this->update(['stock_quantity' => $availableCount]);
        return $availableCount;
    }

    public function incrementSoldCount($quantity = 1)
    {
        $this->increment('sold_count', $quantity);
    }

    public function isManualDelivery()
    {
        return $this->manual_delivery;
    }

    public function hasAccessCodes()
    {
        return !$this->manual_delivery && $this->accessCodes()->exists();
    }
}
