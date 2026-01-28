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
        Schema::create('shopping_lists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ingredients_id')->nullable()->comment('材料ID（材料マスタから選択した場合）');
            $table->string('custom_item', 255)->nullable()->comment('自由入力項目（ユーザーが直接入力した内容）');
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->timestamp('created_at')->useCurrent()->comment('作成日時');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shopping_lists');
    }
};
