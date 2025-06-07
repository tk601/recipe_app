<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShoppingList extends Model
{
    protected $fillable = [
        'ingredients_id',
        'check_flg',
        'user_id',
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
