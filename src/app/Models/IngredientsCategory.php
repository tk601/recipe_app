<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IngredientsCategory extends Model
{
    protected $fillable = [
        'ingredients_category_name',
        'ingredients_category_image_url',
    ];

    // public function ingredients(): HasMany
    // {
    //     return $this->hasMany(Ingredient::class);
    // }
}
