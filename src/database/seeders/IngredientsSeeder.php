<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IngredientsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // カテゴリIDを取得（カテゴリ名から検索）
        $vegetableId = DB::table('ingredient_categories')->where('name', '野菜')->value('id');
        $fruitId = DB::table('ingredient_categories')->where('name', '果物')->value('id');
        $meatId = DB::table('ingredient_categories')->where('name', '肉類')->value('id');
        $seafoodId = DB::table('ingredient_categories')->where('name', '魚介類')->value('id');
        $dairyId = DB::table('ingredient_categories')->where('name', '乳製品')->value('id');
        $grainId = DB::table('ingredient_categories')->where('name', '穀物')->value('id');
        $seasoningId = DB::table('ingredient_categories')->where('name', '調味料')->value('id');

        // 食材データの配列
        $ingredients = [
            // 野菜
            ['name' => 'トマト', 'ingredient_category_id' => $vegetableId],
            ['name' => 'きゅうり', 'ingredient_category_id' => $vegetableId],
            ['name' => 'レタス', 'ingredient_category_id' => $vegetableId],
            ['name' => '玉ねぎ', 'ingredient_category_id' => $vegetableId],
            ['name' => 'にんじん', 'ingredient_category_id' => $vegetableId],
            
            // 果物
            ['name' => 'りんご', 'ingredient_category_id' => $fruitId],
            ['name' => 'バナナ', 'ingredient_category_id' => $fruitId],
            ['name' => 'いちご', 'ingredient_category_id' => $fruitId],
            
            // 肉類
            ['name' => '鶏もも肉', 'ingredient_category_id' => $meatId],
            ['name' => '豚バラ肉', 'ingredient_category_id' => $meatId],
            ['name' => '牛肉', 'ingredient_category_id' => $meatId],
            
            // 魚介類
            ['name' => 'サーモン', 'ingredient_category_id' => $seafoodId],
            ['name' => 'エビ', 'ingredient_category_id' => $seafoodId],
            ['name' => 'イカ', 'ingredient_category_id' => $seafoodId],
            
            // 乳製品
            ['name' => '牛乳', 'ingredient_category_id' => $dairyId],
            ['name' => 'チーズ', 'ingredient_category_id' => $dairyId],
            ['name' => 'ヨーグルト', 'ingredient_category_id' => $dairyId],
            
            // 穀物
            ['name' => '米', 'ingredient_category_id' => $grainId],
            ['name' => 'パスタ', 'ingredient_category_id' => $grainId],
            ['name' => 'パン', 'ingredient_category_id' => $grainId],
            
            // 調味料
            ['name' => '醤油', 'ingredient_category_id' => $seasoningId],
            ['name' => '塩', 'ingredient_category_id' => $seasoningId],
            ['name' => '砂糖', 'ingredient_category_id' => $seasoningId],
        ];

        // データベースに挿入
        DB::table('ingredients')->insert($ingredients);
    }
}