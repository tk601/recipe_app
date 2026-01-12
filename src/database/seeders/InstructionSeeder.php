<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstructionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $instructions = [
            // レシピID 1: 豚の生姜焼きの手順
            [
                'recipe_id' => 1,
                'instruction_no' => 1,
                'description' => '豚肉に塩こしょうで下味をつけます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 1,
                'instruction_no' => 2,
                'description' => 'しょうが、にんにくをすりおろし、醤油、みりん、酒と混ぜ合わせてタレを作ります。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 1,
                'instruction_no' => 3,
                'description' => 'フライパンに油を熱し、豚肉を黄金色になるまで焼きます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 1,
                'instruction_no' => 4,
                'description' => '作ったタレを加えて、豚肉に絡めながら煮詰めます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 1,
                'instruction_no' => 5,
                'description' => 'お皿に盛り付け、キャベツの千切りを添えて完成です。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],

            // レシピID 2: カレーライスの手順
            [
                'recipe_id' => 2,
                'instruction_no' => 1,
                'description' => '玉ねぎ、にんじん、じゃがいもを一口大に切ります。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 2,
                'instruction_no' => 2,
                'description' => '鍋に油を熱し、豚肉を炒めます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 2,
                'instruction_no' => 3,
                'description' => '玉ねぎ、にんじん、じゃがいもを加えて炒めます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 2,
                'instruction_no' => 4,
                'description' => '水を加えて煮込み、野菜が柔らかくなるまで15〜20分煮ます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 2,
                'instruction_no' => 5,
                'description' => '一旦火を止め、カレールーを溶かし入れます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 2,
                'instruction_no' => 6,
                'description' => '再び弱火で煮込み、とろみがつくまで煮ます。ご飯と一緒に盛り付けて完成です。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],

            // レシピID 3: ハンバーグの手順
            [
                'recipe_id' => 3,
                'instruction_no' => 1,
                'description' => '玉ねぎをみじん切りにし、フライパンで炒めて冷ましておきます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 3,
                'instruction_no' => 2,
                'description' => 'ボウルに合い挽き肉、炒めた玉ねぎ、パン粉、卵、塩こしょうを入れてよく混ぜます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 3,
                'instruction_no' => 3,
                'description' => '肉だねを小判型に成形し、中央を少しくぼませます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 3,
                'instruction_no' => 4,
                'description' => 'フライパンに油を熱し、中火で両面をこんがり焼きます。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 3,
                'instruction_no' => 5,
                'description' => '蓋をして弱火で中まで火を通します（約5〜7分）。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
            [
                'recipe_id' => 3,
                'instruction_no' => 6,
                'description' => 'お好みのソースをかけて完成です。',
                'instruction_image_url' => null,
                'user_id' => 1,
            ],
        ];

        DB::table('instructions')->insert($instructions);
    }
}
