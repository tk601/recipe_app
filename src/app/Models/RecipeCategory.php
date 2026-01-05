<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// レシピカテゴリ
class RecipeCategory extends Model
{
    protected $table = 'recipe_categories'; 

    protected $fillable = [
        'recipe_category_name',
        'recipe_category_image_url',
    ];

    // public function recipes(): HasMany
    // {
    //     return $this->hasMany(Recipe::class);
    // }
}
