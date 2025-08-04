<?php
// File: app/Models/Transaction.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Transaction extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'transaction_id',
        'user_id',
        'type',
        'amount',
        'fee',
        'net_amount',
        'currency',
        'status',
        'gateway',
        'gateway_transaction_id',
        'gateway_response',
        'order_id',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'gateway_response' => 'json',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'amount', 'type'])
            ->logOnlyDirty();
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeDeposits($query)
    {
        return $query->where('type', 'deposit');
    }

    public function scopePurchases($query)
    {
        return $query->where('type', 'purchase');
    }

    public function scopeRefunds($query)
    {
        return $query->where('type', 'refund');
    }

    public function scopeReferralCommissions($query)
    {
        return $query->where('type', 'referral_commission');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedAmountAttribute()
    {
        $prefix = $this->amount >= 0 ? '+' : '';
        return $prefix . '$' . number_format(abs($this->amount), 2);
    }

    public function getFormattedFeeAttribute()
    {
        return '$' . number_format($this->fee, 2);
    }

    public function getFormattedNetAmountAttribute()
    {
        $prefix = $this->net_amount >= 0 ? '+' : '';
        return $prefix . '$' . number_format(abs($this->net_amount), 2);
    }

    public function getIsCompletedAttribute()
    {
        return $this->status === 'completed';
    }

    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    public function getIsFailedAttribute()
    {
        return $this->status === 'failed';
    }

    public function getIsCancelledAttribute()
    {
        return $this->status === 'cancelled';
    }

    public function getTypeDisplayAttribute()
    {
        return match ($this->type) {
            'deposit' => 'Fund Deposit',
            'purchase' => 'Purchase',
            'refund' => 'Refund',
            'referral_commission' => 'Referral Commission',
            default => ucfirst($this->type),
        };
    }

    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'completed' => 'bg-green-100 text-green-800',
            'failed' => 'bg-red-100 text-red-800',
            'cancelled' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getTypeBadgeClassAttribute()
    {
        return match ($this->type) {
            'deposit' => 'bg-green-100 text-green-800',
            'purchase' => 'bg-blue-100 text-blue-800',
            'refund' => 'bg-purple-100 text-purple-800',
            'referral_commission' => 'bg-orange-100 text-orange-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    // Helper Methods
    public static function generateTransactionId()
    {
        do {
            $transactionId = 'TXN_' . strtoupper(uniqid());
        } while (self::where('transaction_id', $transactionId)->exists());

        return $transactionId;
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);

        // Update user balance for deposits and refunds
        if (in_array($this->type, ['deposit', 'refund']) && $this->net_amount > 0) {
            $this->user->increment('balance', $this->net_amount);
        }
    }

    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => 'failed',
            'description' => $reason ? $this->description . " | Failed: " . $reason : $this->description,
        ]);
    }

    public function markAsCancelled($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'description' => $reason ? $this->description . " | Cancelled: " . $reason : $this->description,
        ]);
    }

    public function updateFromGatewayResponse($response, $status = null)
    {
        $updateData = [
            'gateway_response' => $response,
        ];

        if ($status) {
            $updateData['status'] = $status;
        }

        if (isset($response['payment_id'])) {
            $updateData['gateway_transaction_id'] = $response['payment_id'];
        }

        $this->update($updateData);

        // Auto-complete if status is completed
        if ($status === 'completed') {
            $this->markAsCompleted();
        }
    }

    public function getGatewayUrl()
    {
        if ($this->gateway === 'nowpayments' && isset($this->gateway_response['invoice_url'])) {
            return $this->gateway_response['invoice_url'];
        }

        return null;
    }
}
