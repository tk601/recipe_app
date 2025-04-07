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
        Schema::create('refrigerators', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ingredients_id')->comment('材料ID');
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->timestamp('created_at')->useCurrent()->comment('作成日時');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refrigerators');
    }
};
