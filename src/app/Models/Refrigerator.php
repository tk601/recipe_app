<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// 冷蔵庫に保存されている材料データ
class Refrigerator extends Model
{
    protected $table = 'refrigerators';

    // updated_atカラムは使用しない（created_atのみ使用）
    const UPDATED_AT = null;

    protected $fillable = [
        'ingredients_id',
        'user_id',
        'created_at'
    ];

    // public function ingredient(): BelongsTo
    // {
    //     return $this->belongsTo(Ingredient::class, 'ingredients_id');
    // }

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }
}
