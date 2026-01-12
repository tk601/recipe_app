<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // カテゴリを先に作成（食材はカテゴリに依存するため）
        $this->call([
            IngredientCategoriesSeeder::class,
            IngredientsSeeder::class,
            RecipeCategorySeeder::class,
            RecipeSeeder::class,
            InstructionSeeder::class,
        ]);
    }
}
