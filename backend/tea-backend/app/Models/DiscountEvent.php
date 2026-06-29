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

    public static function activePercent(): int
    {
        return (int) static::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->max('discount_percent');
    }
}
