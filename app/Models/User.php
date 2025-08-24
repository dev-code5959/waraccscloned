<?php
// File: app/Models/User.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'password',
        'balance',
        'referral_code',
        'referred_by',
        'referral_earnings',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'kyc_verified',
        'kyc_data',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'balance' => 'decimal:2',
        'referral_earnings' => 'decimal:2',
        'two_factor_enabled' => 'boolean',
        'two_factor_recovery_codes' => 'json',
        'kyc_verified' => 'boolean',
        'kyc_data' => 'json',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'balance', 'is_active'])
            ->logOnlyDirty();
    }

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function supportTickets()
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function assignedTickets()
    {
        return $this->hasMany(SupportTicket::class, 'assigned_to');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCustomers($query)
    {
        return $query->role('customer');
    }

    public function scopeAdmins($query)
    {
        return $query->role('admin');
    }

    // Accessors & Mutators
    public function getFormattedBalanceAttribute()
    {
        return '$' . number_format($this->balance, 2);
    }

    public function getTwoFactorEnabledAttribute()
    {
        return !is_null($this->two_factor_secret);
    }

    // Helper Methods
    public function generateReferralCode()
    {
        do {
            $code = strtoupper(substr(uniqid(), -8));
        } while (self::where('referral_code', $code)->exists());

        $this->update(['referral_code' => $code]);
        return $code;
    }

    public function addBalance($amount, $description = null, $type = 'deposit')
    {
        $this->increment('balance', $amount);

        return Transaction::create([
            'transaction_id' => 'TXN_' . strtoupper(uniqid()),
            'user_id' => $this->id,
            'type' => $type,
            'amount' => $amount,
            'net_amount' => $amount,
            'status' => 'completed',
            'description' => $description,
        ]);
    }

    public function deductBalance($amount, $description = null, $type = 'purchase')
    {
        if ($this->balance < $amount) {
            throw new \Exception('Insufficient balance');
        }

        $this->decrement('balance', $amount);

        return Transaction::create([
            'transaction_id' => 'TXN_' . strtoupper(uniqid()),
            'user_id' => $this->id,
            'type' => $type,
            'amount' => -$amount,
            'net_amount' => -$amount,
            'status' => 'completed',
            'description' => $description,
        ]);
    }

    public function canPurchase($product, $quantity = 1)
    {
        $totalCost = $product->price * $quantity;
        return $this->balance >= $totalCost && $product->stock_quantity >= $quantity;
    }
}
