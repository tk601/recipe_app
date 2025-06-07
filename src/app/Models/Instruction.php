<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Instruction extends Model
{
    protected $fillable = [
        'recipe_id',
        'instruction_no',
        'instruction_image_url',
        'user_id',
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
