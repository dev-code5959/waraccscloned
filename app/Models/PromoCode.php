<?php
// File: app/Models/PromoCode.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PromoCode extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_order_amount',
        'usage_limit',
        'used_count',
        'user_usage_limit',
        'starts_at',
        'expires_at',
        'is_active',
        'applicable_products',
        'applicable_categories',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'user_usage_limit' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'applicable_products' => 'json',
        'applicable_categories' => 'json',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['code', 'is_active', 'used_count'])
            ->logOnlyDirty();
    }

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class, 'promo_code', 'code');
    }

    public function applicableProducts()
    {
        if (!$this->applicable_products) {
            return Product::query();
        }

        return Product::whereIn('id', $this->applicable_products);
    }

    public function applicableCategories()
    {
        if (!$this->applicable_categories) {
            return Category::query();
        }

        return Category::whereIn('id', $this->applicable_categories);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where('starts_at', '<=', $now)
            ->where('expires_at', '>=', $now)
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    public function scopeExhausted($query)
    {
        return $query->whereNotNull('usage_limit')
            ->whereColumn('used_count', '>=', 'usage_limit');
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', strtoupper($code));
    }

    // Accessors
    public function getIsValidAttribute()
    {
        return $this->is_active &&
            $this->starts_at <= now() &&
            $this->expires_at >= now() &&
            ($this->usage_limit === null || $this->used_count < $this->usage_limit);
    }

    public function getIsExpiredAttribute()
    {
        return $this->expires_at < now();
    }

    public function getIsExhaustedAttribute()
    {
        return $this->usage_limit !== null && $this->used_count >= $this->usage_limit;
    }

    public function getDiscountDisplayAttribute()
    {
        return $this->type === 'percentage'
            ? $this->value . '%'
            : '$' . number_format($this->value, 2);
    }

    public function getFormattedValueAttribute()
    {
        return $this->type === 'percentage'
            ? $this->value . '%'
            : '$' . number_format($this->value, 2);
    }

    public function getUsageDisplayAttribute()
    {
        if ($this->usage_limit === null) {
            return 'Unlimited';
        }

        return $this->used_count . ' / ' . $this->usage_limit;
    }

    public function getRemainingUsagesAttribute()
    {
        if ($this->usage_limit === null) {
            return null;
        }

        return max(0, $this->usage_limit - $this->used_count);
    }

    public function getStatusDisplayAttribute()
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        if ($this->is_expired) {
            return 'Expired';
        }

        if ($this->is_exhausted) {
            return 'Exhausted';
        }

        if ($this->starts_at > now()) {
            return 'Scheduled';
        }

        return 'Active';
    }

    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status_display) {
            'Active' => 'bg-green-100 text-green-800',
            'Scheduled' => 'bg-blue-100 text-blue-800',
            'Expired' => 'bg-red-100 text-red-800',
            'Exhausted' => 'bg-orange-100 text-orange-800',
            'Inactive' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    // Helper Methods
    public function isValidForUser($userId)
    {
        if (!$this->is_valid) {
            return false;
        }

        if ($this->user_usage_limit === null) {
            return true;
        }

        $userUsageCount = $this->orders()
            ->where('user_id', $userId)
            ->count();

        return $userUsageCount < $this->user_usage_limit;
    }

    public function isValidForProduct($productId)
    {
        if (!$this->applicable_products) {
            return true; // Applies to all products
        }

        return in_array($productId, $this->applicable_products);
    }

    public function isValidForCategory($categoryId)
    {
        if (!$this->applicable_categories) {
            return true; // Applies to all categories
        }

        return in_array($categoryId, $this->applicable_categories);
    }

    public function isValidForOrder($order)
    {
        if (!$this->is_valid) {
            return false;
        }

        // Check user-specific limits
        if (!$this->isValidForUser($order->user_id)) {
            return false;
        }

        // Check minimum order amount
        if ($this->minimum_order_amount && $order->total_amount < $this->minimum_order_amount) {
            return false;
        }

        // Check product restrictions
        if (!$this->isValidForProduct($order->product_id)) {
            return false;
        }

        // Check category restrictions
        $product = Product::find($order->product_id);
        if ($product && !$this->isValidForCategory($product->category_id)) {
            return false;
        }

        return true;
    }

    public function calculateDiscount($orderAmount)
    {
        if ($this->type === 'percentage') {
            return ($orderAmount * $this->value) / 100;
        }

        return min($this->value, $orderAmount);
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }

    public function decrementUsage()
    {
        if ($this->used_count > 0) {
            $this->decrement('used_count');
        }
    }
}
