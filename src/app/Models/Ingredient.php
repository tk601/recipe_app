<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// 食材
class Ingredient extends Model
{
    protected $table = 'ingredients'; 

    protected $fillable = [
        'ingredients_name',
        'ingredients_category_id',
        'ingredients_image_url',
        'user_id',
        'seasoning_flg',
        'created_at'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(IngredientCategory::class, 'ingredient_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function refrigerators(): HasMany
    {
        return $this->hasMany(Refrigerator::class);
    }
}
