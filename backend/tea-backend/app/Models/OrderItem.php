<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'tea_id',
        'tea_name',
        'tea_slug',
        'category_name',
        'weight',
        'quantity',
        'unit_price',
        'line_price',
        'total_price',
    ];

    protected $casts = [
        'weight' => 'integer',
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'line_price' => 'integer',
        'total_price' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function tea(): BelongsTo
    {
        return $this->belongsTo(Tea::class);
    }
}
