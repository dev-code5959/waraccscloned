<?php
// File: app/Models/CmsPage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CmsPage extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_description',
        'meta_keywords',
        'is_published',
    ];

    protected $casts = [
        'meta_keywords' => 'json',
        'is_published' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'slug', 'is_published'])
            ->logOnlyDirty();
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }

    // Accessors
    public function getFormattedContentAttribute()
    {
        return nl2br($this->content);
    }

    public function getMetaKeywordsStringAttribute()
    {
        return $this->meta_keywords ? implode(', ', $this->meta_keywords) : '';
    }

    public function getWordCountAttribute()
    {
        return str_word_count(strip_tags($this->content));
    }

    public function getReadingTimeAttribute()
    {
        $wordsPerMinute = 200; // Average reading speed
        $minutes = ceil($this->word_count / $wordsPerMinute);
        return $minutes . ' min read';
    }

    public function getStatusDisplayAttribute()
    {
        return $this->is_published ? 'Published' : 'Draft';
    }

    public function getStatusBadgeClassAttribute()
    {
        return $this->is_published
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
    }

    // Helper Methods
    public function publish()
    {
        $this->update(['is_published' => true]);
    }

    public function unpublish()
    {
        $this->update(['is_published' => false]);
    }

    public function getUrl()
    {
        return route('cms.page', $this->slug);
    }

    public function updateMetaKeywords(array $keywords)
    {
        $this->update(['meta_keywords' => $keywords]);
    }
}
