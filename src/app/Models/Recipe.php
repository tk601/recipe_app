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

    /**
     * レシピの作成者を取得
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * レシピの調理手順を取得
     */
    public function instructions(): HasMany
    {
        return $this->hasMany(RecipeInstruction::class);
    }

    /**
     * レシピのいいねを取得
     */
    public function goods(): HasMany
    {
        return $this->hasMany(Good::class);
    }

    /**
     * レシピの食材を取得
     */
    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    /**
     * レシピのカテゴリを取得
     */
    public function recipeCategory(): BelongsTo
    {
        return $this->belongsTo(RecipeCategory::class, 'recipe_category_id');
    }
}
