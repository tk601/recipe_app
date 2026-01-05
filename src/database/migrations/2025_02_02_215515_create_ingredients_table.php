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
        // 材料
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable(false)->comment('材料名');
            $table->unsignedBigInteger('ingredient_category_id')->comment('材料カテゴリ名ID');
            $table->string('image_url', 2048)->nullable(true)->comment('材料画像URL');
            $table->unsignedBigInteger('user_id')->nullable(true)->comment('ユーザーID');
            $table->tinyInteger('seasoning_flg')->default(0)->nullable(false)->comment('調味料フラグ 0:食材 1:調味料');
            $table->timestamp('created_at')->useCurrent()->comment('作成日時');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
