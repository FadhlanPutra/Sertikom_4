<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class mood extends Model
{
    use HasFactory;

    protected $table = 'moods';

    protected $fillable = [
        'title',
        'status',
        'category',
        'date',
    ];

    protected $attributes = [
        'status' => "Pending",
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function setCategoryAttribute($value)
    {
        $this->attributes['category'] = ucfirst(strtolower($value));
    }
}
