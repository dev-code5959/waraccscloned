<?php
// File: app/Models/AccessCode.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class AccessCode extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'product_id',
        'email',
        'username', // ADD THIS LINE IF NOT PRESENT
        'password',
        'additional_info',
        'status',
        'order_id',
        'sold_at',
    ];

    protected $casts = [
        'additional_info' => 'json',
        'sold_at' => 'datetime',
    ];

    protected $hidden = [
        'password', // Hide password in JSON responses unless explicitly requested
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'order_id'])
            ->logOnlyDirty();
    }

    public function getUsernameAttribute()
    {
        // If no explicit username field, fall back to email
        return $this->attributes['username'] ?? $this->email;
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    public function scopeReserved($query)
    {
        return $query->where('status', 'reserved');
    }

    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    // Accessors
    public function getFormattedCredentialsAttribute()
    {
        $credentials = [
            'email' => $this->email,
            'password' => $this->password,
        ];

        if ($this->additional_info) {
            $credentials = array_merge($credentials, $this->additional_info);
        }

        return $credentials;
    }

    public function getIsAvailableAttribute()
    {
        return $this->status === 'available';
    }

    public function getIsSoldAttribute()
    {
        return $this->status === 'sold';
    }

    public function getIsReservedAttribute()
    {
        return $this->status === 'reserved';
    }

    // Helper Methods
    public function markAsSold($orderId)
    {
        $this->update([
            'status' => 'sold',
            'order_id' => $orderId,
            'sold_at' => now(),
        ]);
    }


    public function markAsReserved()
    {
        $this->update(['status' => 'reserved']);
    }

    public function markAsAvailable()
    {
        $this->update([
            'status' => 'available',
            'order_id' => null,
            'sold_at' => null,
        ]);
    }

    public function getCredentialsForDelivery()
    {
        $credentials = [
            'email' => $this->email,
            'password' => $this->password,
        ];

        if ($this->additional_info && is_array($this->additional_info)) {
            foreach ($this->additional_info as $key => $value) {
                $credentials[$key] = $value;
            }
        }

        return $credentials;
    }

    public function getDeliveredAtAttribute()
    {
        return $this->sold_at; // Use sold_at as delivered_at for backward compatibility
    }
}
