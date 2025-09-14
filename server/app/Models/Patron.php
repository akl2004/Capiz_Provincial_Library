<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patron extends Model
{
    use HasFactory;

    protected $fillable = [
        'patron_id',
        'name',
        'email',
        'barangay',
        'municipality',
        'province',
        'number',
        'status',
        'age',
        'notes',
        'expiry_date',
    ];

    public static function generateUniquePatronId()
    {
        do {
            // Example: P00001, P00002...
            $patronId = 'P' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (self::where('patron_id', $patronId)->exists());

        return $patronId;
    }


    // ✅ Relation: Patron has many circulations
    public function circulations()
    {
        return $this->hasMany(Circulation::class);
    }
}
