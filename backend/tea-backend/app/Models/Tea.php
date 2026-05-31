<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
}
