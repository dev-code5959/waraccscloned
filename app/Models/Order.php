<?php
// File: app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'order_number',
        'user_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_amount',
        'discount_amount',
        'promo_code',
        'status',
        'payment_status',
        'payment_method',
        'payment_reference',
        'access_codes_delivered',
        'completed_at',
        'paid_at', // ADD THIS LINE
        'notes',
        'net_amount'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'access_codes_delivered' => 'json',
        'completed_at' => 'datetime',
        'paid_at' => 'datetime', // ADD THIS LINE
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'payment_status', 'total_amount'])
            ->logOnlyDirty();
    }

    public function getPaidAtAttribute($value)
    {
        // If there's no explicit paid_at timestamp, fall back to when payment_status became 'paid'
        if (!$value && $this->payment_status === 'paid') {
            return $this->updated_at;
        }
        return $value ? \Carbon\Carbon::parse($value) : null;
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function accessCodes()
    {
        return $this->hasMany(AccessCode::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function promoCodeUsed()
    {
        return $this->belongsTo(PromoCode::class, 'promo_code', 'code');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Accessors
    public function getFormattedTotalAttribute()
    {
        return '$' . number_format($this->total_amount, 2);
    }

    public function getFormattedUnitPriceAttribute()
    {
        return '$' . number_format($this->unit_price, 2);
    }

    public function getFormattedDiscountAttribute()
    {
        return '$' . number_format($this->discount_amount, 2);
    }

    public function getNetAmountAttribute()
    {
        return $this->total_amount - $this->discount_amount;
    }

    public function getFormattedNetAmountAttribute()
    {
        return '$' . number_format($this->net_amount, 2);
    }

    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    public function getIsPendingDeliveryAttribute()
    {
        return $this->status === 'pending_delivery';
    }

    public function getIsProcessingAttribute()
    {
        return $this->status === 'processing';
    }

    public function getIsCompletedAttribute()
    {
        return $this->status === 'completed';
    }

    public function getIsCancelledAttribute()
    {
        return $this->status === 'cancelled';
    }

    public function getIsPaidAttribute()
    {
        return $this->payment_status === 'paid';
    }

    public function getCanBeCancelledAttribute()
    {
        return in_array($this->status, ['pending', 'processing']) && $this->payment_status !== 'paid';
    }

    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'pending_delivery' => 'bg-yellow-100 text-yellow-800',
            'processing' => 'bg-blue-100 text-blue-800',
            'completed' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            'refunded' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getPaymentStatusBadgeClassAttribute()
    {
        return match ($this->payment_status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'paid' => 'bg-green-100 text-green-800',
            'failed' => 'bg-red-100 text-red-800',
            'refunded' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    // Helper Methods
    public static function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(uniqid());
        } while (self::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    public function markAsPaid($paymentMethod = null, $paymentReference = null)
    {
        $this->update([
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
            'payment_reference' => $paymentReference,
            'paid_at' => now(), // ADD THIS LINE
        ]);

        // Auto-process if pending
        if ($this->status === 'pending') {
            $this->markAsProcessing();
        }
    }

    public function markAsProcessing()
    {
        $this->update(['status' => 'processing']);
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Update product sold count
        $this->product->incrementSoldCount($this->quantity);
    }

    public function markAsCancelled($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $reason ? $this->notes . "\nCancellation reason: " . $reason : $this->notes,
        ]);

        // Release reserved access codes
        $this->accessCodes()->update(['status' => 'available', 'order_id' => null]);
    }

    public function deliverAccessCodes()
    {
        if ($this->status !== 'processing' || $this->payment_status !== 'paid') {
            throw new \Exception('Order is not ready for delivery');
        }

        // Get reserved access codes or reserve new ones
        $accessCodes = $this->accessCodes;
        if ($accessCodes->count() < $this->quantity) {
            $needed = $this->quantity - $accessCodes->count();
            $additional = $this->product->reserveAccessCodes($needed);
            foreach ($additional as $code) {
                $code->markAsSold($this->id);
            }
        } else {
            // Mark existing reserved codes as sold
            $accessCodes->each(function ($code) {
                $code->markAsSold($this->id);
            });
        }

        // Store delivered access code IDs
        $deliveredIds = $this->accessCodes()->pluck('id')->toArray();
        $this->update(['access_codes_delivered' => $deliveredIds]);

        // Mark order as completed
        $this->markAsCompleted();

        return $this->accessCodes;
    }

    public function getDeliveredCredentials()
    {
        if (!$this->access_codes_delivered) {
            return collect();
        }

        return AccessCode::whereIn('id', $this->access_codes_delivered)
            ->get()
            ->map(function ($code) {
                return $code->getCredentialsForDelivery();
            });
    }

    public function calculateTotal($promoCode = null)
    {
        $subtotal = $this->unit_price * $this->quantity;
        $discount = 0;

        if ($promoCode && $promoCode->isValidForOrder($this)) {
            $discount = $promoCode->calculateDiscount($subtotal);
        }

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $subtotal - $discount,
        ];
    }
}
