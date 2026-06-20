<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountEvent extends Model
{
    protected $fillable = [
        'created_by',
        'title',
        'discount_percent',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}
