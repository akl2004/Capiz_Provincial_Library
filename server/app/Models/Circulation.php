<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Circulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_copy_id',
        'patron_id',
        'issue_date',
        'due_date',
        'renewal_date',
        'overdue_by',
        'fine',
        'date_returned',
        'status',
        'renewal_count',
    ];

    protected $dates = [
        'issue_date',
        'due_date',
        'renewal_date',
        'date_returned',
    ];

    // Relationships
    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }

    public function patron()
    {
        return $this->belongsTo(Patron::class);
    }

    // ✅ Helper: check if this circulation is overdue
    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'borrowed' && $this->due_date instanceof Carbon && $this->due_date->isPast();
    }
}
