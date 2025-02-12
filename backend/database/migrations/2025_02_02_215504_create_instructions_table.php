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
        // 調理手順
        Schema::create('instructions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('recipe_id')->comment('レシピID');
            $table->unsignedInteger('instruction_no')->comment('調理手順No');
            $table->string('instruction_image_url', 2048)->nullable(false)->comment('調理手順画像URL');
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->timestamp('created_at')->useCurrent()->comment('作成日時');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instructions');
    }
};
