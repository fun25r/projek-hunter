<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'category', 'subcategory', 'description',
        'price', 'image_url', 'stock_status', 'stock_count',
        'abv', 'origin', 'weight_gram',
        'is_featured', 'is_bestseller', 'is_new_collection',
        'discount_percent', 'is_active',
        'discount_expires_at', 'new_collection_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'abv' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_bestseller' => 'boolean',
            'is_new_collection' => 'boolean',
            'is_active' => 'boolean',
            'discount_expires_at' => 'datetime',
            'new_collection_expires_at' => 'datetime',
        ];
    }
}
