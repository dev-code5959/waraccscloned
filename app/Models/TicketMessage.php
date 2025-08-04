<?php
// File: app/Models/TicketMessage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class TicketMessage extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'message',
        'attachments',
        'is_staff_reply',
    ];

    protected $casts = [
        'attachments' => 'json',
        'is_staff_reply' => 'boolean',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
                'text/plain',
                'application/zip'
            ]);
    }

    // Relationships
    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeStaffReplies($query)
    {
        return $query->where('is_staff_reply', true);
    }

    public function scopeUserMessages($query)
    {
        return $query->where('is_staff_reply', false);
    }

    public function scopeForTicket($query, $ticketId)
    {
        return $query->where('ticket_id', $ticketId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Accessors
    public function getFormattedMessageAttribute()
    {
        return nl2br(e($this->message));
    }

    public function getAttachmentListAttribute()
    {
        return $this->getMedia('attachments')->map(function ($media) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'url' => $media->getUrl(),
                'human_readable_size' => $media->human_readable_size,
            ];
        });
    }

    public function getSenderNameAttribute()
    {
        return $this->user->name;
    }

    public function getIsFromStaffAttribute()
    {
        return $this->is_staff_reply;
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
