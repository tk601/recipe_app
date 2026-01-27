<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// 買い物リスト
class ShoppingList extends Model
{
    protected $table = 'shopping_lists';

    // updated_atカラムが存在しないため、created_atのみ使用
    const UPDATED_AT = null;

    protected $fillable = [
        'ingredients_id',
        'check_flg',
        'user_id',
        'created_at'
    ];

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class, 'ingredients_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
