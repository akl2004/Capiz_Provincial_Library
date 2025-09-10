<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    // public function patron()
    // {
    //     return $this->belongsTo(Patron::class);
    // }
}
