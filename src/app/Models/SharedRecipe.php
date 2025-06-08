<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// 共有レシピ
class SharedRecipe extends Model
{
    protected $table = 'shared_recipes'; 

    protected $fillable = [
        'shared_group_id',
        'user_id',
        'created_at'
    ];

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }
}
