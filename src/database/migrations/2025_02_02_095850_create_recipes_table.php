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
        // レシピ一覧
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('recipe_name', 50)->nullable(false)->comment('レシピ名');
            $table->unsignedBigInteger('recipe_category_id')->comment('レシピカテゴリ名ID');
            $table->string('recipe_image_url', 2048)->nullable(false)->comment('レシピ画像URL');
            $table->unsignedInteger('serving_size')->comment('何人分');
            $table->string('recommended_points', 255)->nullable()->comment('おすすめポイント');
            $table->tinyInteger('publish_flg')->default(0)->nullable(false)->comment('公開フラグ');
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->timestamp('created_at')->useCurrent()->comment('作成日時');
            $table->timestamp('updated_at')->useCurrent()->comment('更新日時');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
