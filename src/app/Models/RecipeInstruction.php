<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// 調理手順
class RecipeInstruction extends Model
{
    protected $table = 'recipe_instructions';

    // タイムスタンプを有効にする
    public $timestamps = true;

    // created_atのみ使用（updated_atは使用しない）
    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'recipe_id',
        'instruction_no',
        'description',
        'instruction_image_url',
        'user_id',
        'created_at'
    ];

    // public function recipe(): BelongsTo
    // {
    //     return $this->belongsTo(Recipe::class);
    // }

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }
}
