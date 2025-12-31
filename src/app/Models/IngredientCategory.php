<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// 食材カテゴリ
class IngredientCategory extends Model
{
    protected $table = 'ingredient_categories'; 

    protected $fillable = [
        'category_name',
        'category_image_url',
    ];

    // public function ingredients(): HasMany
    // {
    //     return $this->hasMany(Ingredient::class);
    // }
}
