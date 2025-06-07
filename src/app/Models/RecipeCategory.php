<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecipeCategory extends Model
{
    protected $fillable = [
        'recipe_category_name',
        'recipe_category_image_url',
    ];

    // public function recipes(): HasMany
    // {
    //     return $this->hasMany(Recipe::class);
    // }
}
