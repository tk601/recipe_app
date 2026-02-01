<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// レシピ食材
class RecipeIngredient extends Model
{
    protected $table = 'recipe_ingredients';

    // タイムスタンプを有効にする
    public $timestamps = true;

    // created_atのみ使用（updated_atは使用しない）
    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'recipe_id',
        'ingredients_id',
        'quantity',
        'unit',
    ];

    /**
     * レシピを取得
     */
    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    /**
     * 食材を取得
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class, 'ingredients_id');
    }
}
