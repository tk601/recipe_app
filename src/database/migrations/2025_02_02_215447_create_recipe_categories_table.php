<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // レシピカテゴリ
        Schema::create('recipe_categories', function (Blueprint $table) {
            $table->id();
            $table->string('recipe_category_name', 50)->nullable(false)->comment('レシピカテゴリ名');
            $table->string('recipe_category_image_url', 2048)->nullable(false)->comment('レシピカテゴリ画像URL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipe_categories');
    }
};
