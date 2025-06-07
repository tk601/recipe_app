<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = [
        'ingredients_name',
        'ingredients_id',
        'ingredients_image_url',
        'user_id',
        'seasoning_flg',
    ];

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }

    // public function refrigerators(): HasMany
    // {
    //     return $this->hasMany(Refrigerator::class);
    // }
}
