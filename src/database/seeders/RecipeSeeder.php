<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ユーザーIDを取得（最初のユーザーを使用）
        $userId = DB::table('users')->first()->id ?? 1;

        $recipes = [
            // 和食カテゴリ (category_id: 1)
            [
                'recipe_name' => '肉じゃが',
                'recipe_category_id' => 1,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
                'serving_size' => 4,
                'recommended_points' => '定番の家庭料理。ほくほくのじゃがいもと甘辛い味付けが絶品！',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => '鮭の塩焼き',
                'recipe_category_id' => 1,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400',
                'serving_size' => 2,
                'recommended_points' => 'シンプルで栄養満点！',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => '味噌汁',
                'recipe_category_id' => 1,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400',
                'serving_size' => 4,
                'recommended_points' => '毎日飲みたい定番の一品',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => '豚の生姜焼き',
                'recipe_category_id' => 1,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400',
                'serving_size' => 2,
                'recommended_points' => 'ご飯が進む定番おかず',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => '唐揚げ',
                'recipe_category_id' => 1,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
                'serving_size' => 3,
                'recommended_points' => 'みんな大好き！カリッとジューシー',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],

            // 洋食カテゴリ (category_id: 2)
            [
                'recipe_name' => 'ハンバーグ',
                'recipe_category_id' => 2,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1619740455993-557c40e38d41?w=400',
                'serving_size' => 4,
                'recommended_points' => 'ジューシーで子どもも大好き！',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'オムライス',
                'recipe_category_id' => 2,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
                'serving_size' => 2,
                'recommended_points' => 'ふわとろ卵が絶品',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'グラタン',
                'recipe_category_id' => 2,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1612970936928-c5ca45e8bcee?w=400',
                'serving_size' => 3,
                'recommended_points' => '熱々チーズがとろける',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'カレーライス',
                'recipe_category_id' => 2,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
                'serving_size' => 4,
                'recommended_points' => '定番中の定番！みんな大好き',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'エビフライ',
                'recipe_category_id' => 2,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
                'serving_size' => 2,
                'recommended_points' => 'サクサク衣とプリプリエビ',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],

            // 中華カテゴリ (category_id: 3)
            [
                'recipe_name' => '麻婆豆腐',
                'recipe_category_id' => 3,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1588161311003-6db524f20e4d?w=400',
                'serving_size' => 3,
                'recommended_points' => 'ピリ辛でご飯が進む',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => '餃子',
                'recipe_category_id' => 3,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
                'serving_size' => 4,
                'recommended_points' => 'パリパリジューシー！',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'チャーハン',
                'recipe_category_id' => 3,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                'serving_size' => 2,
                'recommended_points' => 'パラパラに仕上げるコツ教えます',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => '酢豚',
                'recipe_category_id' => 3,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1626790680787-de5e9a07bcf2?w=400',
                'serving_size' => 3,
                'recommended_points' => '甘酸っぱさがクセになる',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'エビチリ',
                'recipe_category_id' => 3,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
                'serving_size' => 2,
                'recommended_points' => 'プリプリエビとピリ辛ソース',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],

            // イタリアンカテゴリ (category_id: 4)
            [
                'recipe_name' => 'カルボナーラ',
                'recipe_category_id' => 4,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
                'serving_size' => 2,
                'recommended_points' => '濃厚クリーミー',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'マルゲリータピザ',
                'recipe_category_id' => 4,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                'serving_size' => 3,
                'recommended_points' => 'シンプルで美味しい',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'ペスカトーレ',
                'recipe_category_id' => 4,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
                'serving_size' => 2,
                'recommended_points' => '魚介の旨味たっぷり',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'リゾット',
                'recipe_category_id' => 4,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1476124369491-c4f9e69e3c8e?w=400',
                'serving_size' => 2,
                'recommended_points' => 'チーズの風味が絶品',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
            [
                'recipe_name' => 'ボンゴレビアンコ',
                'recipe_category_id' => 4,
                'recipe_image_url' => 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
                'serving_size' => 2,
                'recommended_points' => 'あさりの旨味が染み渡る',
                'publish_flg' => 1,
                'user_id' => $userId,
            ],
        ];

        foreach ($recipes as $recipe) {
            DB::table('recipes')->insert([
                'recipe_name' => $recipe['recipe_name'],
                'recipe_category_id' => $recipe['recipe_category_id'],
                'recipe_image_url' => $recipe['recipe_image_url'],
                'serving_size' => $recipe['serving_size'],
                'recommended_points' => $recipe['recommended_points'],
                'publish_flg' => $recipe['publish_flg'],
                'user_id' => $recipe['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // レシピに食材を紐付ける
        $this->attachIngredientsToRecipes();
    }

    /**
     * レシピに食材を紐付ける
     */
    private function attachIngredientsToRecipes(): void
    {
        // 食材IDを取得
        $ingredients = DB::table('ingredients')->pluck('id', 'name')->toArray();

        // レシピIDを取得
        $recipeIds = DB::table('recipes')->pluck('id', 'recipe_name')->toArray();

        $recipeIngredients = [
            // 肉じゃが
            $recipeIds['肉じゃが'] ?? null => [
                ['ingredient' => 'じゃがいも', 'quantity' => 4, 'unit' => '個'],
                ['ingredient' => '玉ねぎ', 'quantity' => 1, 'unit' => '個'],
                ['ingredient' => '豚肉', 'quantity' => 200, 'unit' => 'g'],
            ],
            // 鮭の塩焼き
            $recipeIds['鮭の塩焼き'] ?? null => [
                ['ingredient' => '鮭', 'quantity' => 2, 'unit' => '切れ'],
            ],
            // 味噌汁
            $recipeIds['味噌汁'] ?? null => [
                ['ingredient' => '豆腐', 'quantity' => 1, 'unit' => '丁'],
                ['ingredient' => 'わかめ', 'quantity' => 10, 'unit' => 'g'],
            ],
            // 豚の生姜焼き
            $recipeIds['豚の生姜焼き'] ?? null => [
                ['ingredient' => '豚肉', 'quantity' => 300, 'unit' => 'g'],
                ['ingredient' => '玉ねぎ', 'quantity' => 1, 'unit' => '個'],
                ['ingredient' => 'しょうが', 'quantity' => 1, 'unit' => '片'],
            ],
            // 唐揚げ
            $recipeIds['唐揚げ'] ?? null => [
                ['ingredient' => '鶏肉', 'quantity' => 400, 'unit' => 'g'],
            ],
            // ハンバーグ
            $recipeIds['ハンバーグ'] ?? null => [
                ['ingredient' => '牛肉', 'quantity' => 300, 'unit' => 'g'],
                ['ingredient' => '玉ねぎ', 'quantity' => 1, 'unit' => '個'],
                ['ingredient' => 'パン粉', 'quantity' => 50, 'unit' => 'g'],
            ],
            // オムライス
            $recipeIds['オムライス'] ?? null => [
                ['ingredient' => '卵', 'quantity' => 4, 'unit' => '個'],
                ['ingredient' => '鶏肉', 'quantity' => 100, 'unit' => 'g'],
                ['ingredient' => '玉ねぎ', 'quantity' => 1, 'unit' => '個'],
            ],
            // グラタン
            $recipeIds['グラタン'] ?? null => [
                ['ingredient' => 'マカロニ', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'チーズ', 'quantity' => 100, 'unit' => 'g'],
                ['ingredient' => '牛乳', 'quantity' => 300, 'unit' => 'ml'],
            ],
            // カレーライス
            $recipeIds['カレーライス'] ?? null => [
                ['ingredient' => '豚肉', 'quantity' => 300, 'unit' => 'g'],
                ['ingredient' => 'じゃがいも', 'quantity' => 3, 'unit' => '個'],
                ['ingredient' => 'にんじん', 'quantity' => 1, 'unit' => '本'],
                ['ingredient' => '玉ねぎ', 'quantity' => 2, 'unit' => '個'],
            ],
            // エビフライ
            $recipeIds['エビフライ'] ?? null => [
                ['ingredient' => 'エビ', 'quantity' => 8, 'unit' => '尾'],
                ['ingredient' => 'パン粉', 'quantity' => 100, 'unit' => 'g'],
            ],
            // 麻婆豆腐
            $recipeIds['麻婆豆腐'] ?? null => [
                ['ingredient' => '豆腐', 'quantity' => 1, 'unit' => '丁'],
                ['ingredient' => '豚肉', 'quantity' => 150, 'unit' => 'g'],
                ['ingredient' => 'ねぎ', 'quantity' => 1, 'unit' => '本'],
            ],
            // 餃子
            $recipeIds['餃子'] ?? null => [
                ['ingredient' => '豚肉', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'キャベツ', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'にら', 'quantity' => 50, 'unit' => 'g'],
            ],
            // チャーハン
            $recipeIds['チャーハン'] ?? null => [
                ['ingredient' => 'ごはん', 'quantity' => 400, 'unit' => 'g'],
                ['ingredient' => '卵', 'quantity' => 2, 'unit' => '個'],
                ['ingredient' => 'ねぎ', 'quantity' => 1, 'unit' => '本'],
            ],
            // 酢豚
            $recipeIds['酢豚'] ?? null => [
                ['ingredient' => '豚肉', 'quantity' => 300, 'unit' => 'g'],
                ['ingredient' => 'ピーマン', 'quantity' => 3, 'unit' => '個'],
                ['ingredient' => 'にんじん', 'quantity' => 1, 'unit' => '本'],
            ],
            // エビチリ
            $recipeIds['エビチリ'] ?? null => [
                ['ingredient' => 'エビ', 'quantity' => 12, 'unit' => '尾'],
                ['ingredient' => 'ねぎ', 'quantity' => 1, 'unit' => '本'],
            ],
            // カルボナーラ
            $recipeIds['カルボナーラ'] ?? null => [
                ['ingredient' => 'パスタ', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'ベーコン', 'quantity' => 100, 'unit' => 'g'],
                ['ingredient' => '卵', 'quantity' => 2, 'unit' => '個'],
                ['ingredient' => 'チーズ', 'quantity' => 50, 'unit' => 'g'],
            ],
            // マルゲリータピザ
            $recipeIds['マルゲリータピザ'] ?? null => [
                ['ingredient' => 'チーズ', 'quantity' => 150, 'unit' => 'g'],
                ['ingredient' => 'トマト', 'quantity' => 2, 'unit' => '個'],
            ],
            // ペスカトーレ
            $recipeIds['ペスカトーレ'] ?? null => [
                ['ingredient' => 'パスタ', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'エビ', 'quantity' => 6, 'unit' => '尾'],
                ['ingredient' => 'いか', 'quantity' => 1, 'unit' => '杯'],
            ],
            // リゾット
            $recipeIds['リゾット'] ?? null => [
                ['ingredient' => '米', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'チーズ', 'quantity' => 50, 'unit' => 'g'],
            ],
            // ボンゴレビアンコ
            $recipeIds['ボンゴレビアンコ'] ?? null => [
                ['ingredient' => 'パスタ', 'quantity' => 200, 'unit' => 'g'],
                ['ingredient' => 'あさり', 'quantity' => 300, 'unit' => 'g'],
            ],
        ];

        foreach ($recipeIngredients as $recipeId => $ingredientList) {
            if (!$recipeId) continue;

            foreach ($ingredientList as $item) {
                $ingredientId = $ingredients[$item['ingredient']] ?? null;
                if ($ingredientId) {
                    DB::table('recipe_ingredients')->insert([
                        'recipe_id' => $recipeId,
                        'ingredients_id' => $ingredientId,
                        'quantity' => $item['quantity'],
                        'unit' => $item['unit'],
                    ]);
                }
            }
        }
    }
}
