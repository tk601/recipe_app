<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RecipeCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'recipe_category_name' => '和食',
                'recipe_category_image_url' => 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400',
            ],
            [
                'recipe_category_name' => '洋食',
                'recipe_category_image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            ],
            [
                'recipe_category_name' => '中華',
                'recipe_category_image_url' => 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400',
            ],
            [
                'recipe_category_name' => 'イタリアン',
                'recipe_category_image_url' => 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400',
            ],
        ];

        DB::table('recipe_categories')->insert($categories);
    }
}
