<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IngredientCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // カテゴリデータの配列
        $categories = [
            ['name' => '野菜'],
            ['name' => '果物'],
            ['name' => '肉類'],
            ['name' => '魚介類'],
            ['name' => '乳製品'],
            ['name' => '穀物'],
            ['name' => '調味料'],
            ['name' => 'その他'],
        ];

        // データベースに挿入
        DB::table('ingredient_categories')->insert($categories);
    }
}
