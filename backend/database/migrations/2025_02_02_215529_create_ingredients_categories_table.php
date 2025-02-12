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
        // 材料カテゴリ
        Schema::create('ingredients_categories', function (Blueprint $table) {
            $table->string('ingredients_category_name', 50)->nullable(false)->comment('材料カテゴリ名');
            $table->string('ingredients_category_image_url', 2048)->nullable(false)->comment('材料カテゴリ画像URL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients_categories');
    }
};
