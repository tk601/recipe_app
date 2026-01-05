<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// レシピ食材
class RecipeIngredient extends Model
{
    protected $table = 'recipe_ingredients'; 

    protected $fillable = [
        'recipe_id',
        'ingredients_id',
        'quantity',
        'unit',
    ];

    // public function recipe(): BelongsTo
    // {
    //     return $this->belongsTo(Recipe::class);
    // }

    // public function ingredient(): BelongsTo
    // {
    //     return $this->belongsTo(Ingredient::class, 'ingredients_id');
    // }
}
