<?php
// File: app/Models/SupportTicket.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class SupportTicket extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'ticket_number',
        'user_id',
        'order_id',
        'subject',
        'description',
        'priority',
        'status',
        'assigned_to',
        'resolved_at'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'priority', 'assigned_to'])
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

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class, 'ticket_id');
    }

    public function latestMessage()
    {
        return $this->hasOne(TicketMessage::class, 'ticket_id')->latest();
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeWaitingResponse($query)
    {
        return $query->where('status', 'waiting_response');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', 'high');
    }

    public function scopeUrgent($query)
    {
        return $query->where('priority', 'urgent');
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
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
    public function getIsOpenAttribute()
    {
        return in_array($this->status, ['open', 'in_progress', 'waiting_response']);
    }

    public function getIsClosedAttribute()
    {
        return in_array($this->status, ['resolved', 'closed']);
    }

    public function getIsAssignedAttribute()
    {
        return $this->assigned_to !== null;
    }

    public function getStatusDisplayAttribute()
    {
        return match ($this->status) {
            'open' => 'Open',
            'in_progress' => 'In Progress',
            'waiting_response' => 'Waiting Response',
            'resolved' => 'Resolved',
            'closed' => 'Closed',
            default => ucfirst($this->status),
        };
    }

    public function getPriorityDisplayAttribute()
    {
        return ucfirst($this->priority);
    }

    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status) {
            'open' => 'bg-blue-100 text-blue-800',
            'in_progress' => 'bg-yellow-100 text-yellow-800',
            'waiting_response' => 'bg-orange-100 text-orange-800',
            'resolved' => 'bg-green-100 text-green-800',
            'closed' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getPriorityBadgeClassAttribute()
    {
        return match ($this->priority) {
            'low' => 'bg-gray-100 text-gray-800',
            'medium' => 'bg-blue-100 text-blue-800',
            'high' => 'bg-orange-100 text-orange-800',
            'urgent' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getResponseTimeAttribute()
    {
        $lastStaffMessage = $this->messages()
            ->where('is_staff_reply', true)
            ->latest()
            ->first();

        if (!$lastStaffMessage) {
            return $this->created_at->diffForHumans();
        }

        return $lastStaffMessage->created_at->diffForHumans();
    }

    // Helper Methods
    public static function generateTicketNumber()
    {
        do {
            $ticketNumber = 'TKT-' . strtoupper(substr(uniqid(), -8));
        } while (self::where('ticket_number', $ticketNumber)->exists());

        return $ticketNumber;
    }

    public function assignTo($userId)
    {
        $this->update([
            'assigned_to' => $userId,
            'status' => $this->status === 'open' ? 'in_progress' : $this->status,
        ]);
    }

    public function markAsInProgress()
    {
        $this->update(['status' => 'in_progress']);
    }

    public function markAsWaitingResponse()
    {
        $this->update(['status' => 'waiting_response']);
    }

    public function markAsResolved()
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    public function markAsClosed()
    {
        $this->update([
            'status' => 'closed',
            'resolved_at' => $this->resolved_at ?: now(),
        ]);
    }

    public function addMessage($message, $userId, $isStaffReply = false, $attachments = null)
    {
        $ticketMessage = $this->messages()->create([
            'user_id' => $userId,
            'message' => $message,
            'is_staff_reply' => $isStaffReply,
            'attachments' => $attachments,
        ]);

        // Update ticket status based on who replied
        if ($isStaffReply && $this->status === 'open') {
            $this->markAsInProgress();
        } elseif (!$isStaffReply && $this->status === 'waiting_response') {
            $this->markAsInProgress();
        } elseif ($isStaffReply && in_array($this->status, ['in_progress', 'open'])) {
            $this->markAsWaitingResponse();
        }

        return $ticketMessage;
    }

    public function getMessagesCount()
    {
        return $this->messages()->count();
    }

    public function getUnreadMessagesCount($userId)
    {
        // This would require a read_at timestamp on messages
        // For now, return 0 as placeholder
        return 0;
    }
}
