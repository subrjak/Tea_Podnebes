<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_PAID = 'paid';

    public const PAYMENT_QR = 'qr';
    public const PAYMENT_CASH = 'cash';

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_telegram',
        'delivery_address',
        'comment',
        'payment_method',
        'payment_status',
        'status',
        'total_weight',
        'total_quantity',
        'discount_percent',
        'subtotal_price',
        'total_price',
        'telegram_message_id',
    ];

    protected $casts = [
        'total_weight' => 'integer',
        'total_quantity' => 'integer',
        'discount_percent' => 'integer',
        'subtotal_price' => 'integer',
        'total_price' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
