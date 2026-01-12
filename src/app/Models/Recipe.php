<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// レシピ
class Recipe extends Model
{
    protected $table = 'recipes';

    protected $fillable = [
        'recipe_name',
        'recipe_category_id',
        'recipe_image_url',
        'serving_size',
        'recommended_points',
        'publish_flg',
        'user_id',
        'created_at',
        'updated_at'
    ];

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }

    // public function instructions(): HasMany
    // {
    //     return $this->hasMany(RecipeInstruction::class);
    // }

    // public function goods(): HasMany
    // {
    //     return $this->hasMany(Good::class);
    // }
}
