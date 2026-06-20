<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Tea extends Model
{
    use HasFactory;
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'origin',
        'age',
        'price',
        'stock',
        'image',
        'brewing_temperature',
        'recommended_ware',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function favoredBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorite_tea_user')->withTimestamps();
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable')->latest();
    }
}
