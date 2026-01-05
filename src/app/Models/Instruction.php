<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// 調理手順
class Instruction extends Model
{
    protected $table = 'instructions'; 

    protected $fillable = [
        'recipe_id',
        'instruction_no',
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
