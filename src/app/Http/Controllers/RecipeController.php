<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeCategory;
use App\Models\RecipeIngredient;
use App\Models\Refrigerator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    /**
     * レシピ一覧を表示
     * カテゴリごとにレシピを表示し、作れる料理の数も表示する
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        // ユーザーの冷蔵庫にある食材IDを取得
        $userIngredientIds = Refrigerator::where('user_id', $userId)
            ->pluck('ingredients_id')
            ->toArray();

        // レシピカテゴリ一覧を取得
        $categories = RecipeCategory::select('id', 'recipe_category_name', 'recipe_category_image_url')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($category) use ($userIngredientIds) {
                // このカテゴリで作れるレシピ数をカウント
                $cookableCount = Recipe::where('recipe_category_id', $category->id)
                    ->where('publish_flg', 1) // 公開済みのレシピのみ
                    ->whereExists(function ($query) use ($userIngredientIds) {
                        $query->select(DB::raw(1))
                            ->from('recipe_ingredients')
                            ->whereColumn('recipe_ingredients.recipe_id', 'recipes.id')
                            ->whereIn('recipe_ingredients.ingredients_id', $userIngredientIds);
                    })
                    ->count();

                $category->cookable_count = $cookableCount;
                return $category;
            });

        // カテゴリが選択されている場合、そのカテゴリのレシピを取得
        $selectedCategoryId = $request->get('category');
        $recipes = [];

        if ($selectedCategoryId) {
            $recipes = Recipe::select(
                    'recipes.id as recipe_id',
                    'recipes.recipe_name',
                    'recipes.recipe_image_url',
                    'recipes.recipe_category_id'
                )
                ->where('recipe_category_id', $selectedCategoryId)
                ->where('publish_flg', 1) // 公開済みのレシピのみ
                ->orderBy('recipes.created_at', 'desc')
                ->get()
                ->map(function ($recipe) use ($userId, $userIngredientIds) {
                    // レシピに必要な食材を取得
                    $recipeIngredients = RecipeIngredient::where('recipe_id', $recipe->recipe_id)
                        ->join('ingredients', 'recipe_ingredients.ingredients_id', '=', 'ingredients.id')
                        ->select('ingredients.name')
                        ->get()
                        ->pluck('name')
                        ->toArray();

                    $recipe->ingredients = $recipeIngredients;

                    // このレシピに必要な食材ID
                    $requiredIngredientIds = RecipeIngredient::where('recipe_id', $recipe->recipe_id)
                        ->pluck('ingredients_id')
                        ->toArray();

                    // 必要な食材が全て揃っているかチェック
                    $recipe->can_cook = count(array_diff($requiredIngredientIds, $userIngredientIds)) === 0;

                    // いいね数を取得
                    $recipe->likes_count = DB::table('goods')
                        ->where('recipe_id', $recipe->recipe_id)
                        ->count();

                    // このユーザーがいいねしているかチェック
                    $recipe->is_liked = DB::table('goods')
                        ->where('recipe_id', $recipe->recipe_id)
                        ->where('user_id', $userId)
                        ->exists();

                    return $recipe;
                });
        }

        // お気に入りレシピを取得
        $favoriteRecipes = $this->getFavoriteRecipes($userId, $userIngredientIds);

        return Inertia::render('Recipes/Index', [
            'categories' => $categories,
            'recipes' => $recipes,
            'selectedCategoryId' => $selectedCategoryId ? (int) $selectedCategoryId : null,
            'favoriteRecipes' => $favoriteRecipes,
        ]);
    }

    /**
     * お気に入りレシピを取得
     */
    private function getFavoriteRecipes($userId, $userIngredientIds)
    {
        // ユーザーがいいねしたレシピIDを取得
        $favoriteRecipeIds = DB::table('goods')
            ->where('user_id', $userId)
            ->pluck('recipe_id')
            ->toArray();

        if (empty($favoriteRecipeIds)) {
            return [];
        }

        // お気に入りレシピの詳細を取得
        return Recipe::select(
                'recipes.id as recipe_id',
                'recipes.recipe_name',
                'recipes.recipe_image_url',
                'recipes.recipe_category_id',
                'recipe_categories.recipe_category_name'
            )
            ->join('recipe_categories', 'recipes.recipe_category_id', '=', 'recipe_categories.id')
            ->whereIn('recipes.id', $favoriteRecipeIds)
            ->where('publish_flg', 1)
            ->orderBy('goods.created_at', 'desc')
            ->leftJoin('goods', function($join) use ($userId) {
                $join->on('recipes.id', '=', 'goods.recipe_id')
                    ->where('goods.user_id', '=', $userId);
            })
            ->get()
            ->map(function ($recipe) use ($userId, $userIngredientIds) {
                // レシピに必要な食材を取得
                $recipeIngredients = RecipeIngredient::where('recipe_id', $recipe->recipe_id)
                    ->join('ingredients', 'recipe_ingredients.ingredients_id', '=', 'ingredients.id')
                    ->select('ingredients.name')
                    ->get()
                    ->pluck('name')
                    ->toArray();

                $recipe->ingredients = $recipeIngredients;

                // このレシピに必要な食材ID
                $requiredIngredientIds = RecipeIngredient::where('recipe_id', $recipe->recipe_id)
                    ->pluck('ingredients_id')
                    ->toArray();

                // 必要な食材が全て揃っているかチェック
                $recipe->can_cook = count(array_diff($requiredIngredientIds, $userIngredientIds)) === 0;

                // いいね数を取得
                $recipe->likes_count = DB::table('goods')
                    ->where('recipe_id', $recipe->recipe_id)
                    ->count();

                // このユーザーがいいねしているかチェック（お気に入りなので常にtrue）
                $recipe->is_liked = true;

                return $recipe;
            });
    }

    /**
     * いいねを切り替え
     */
    public function toggleLike(Request $request)
    {
        $validated = $request->validate([
            'recipe_id' => 'required|exists:recipes,id',
        ]);

        $userId = Auth::id();
        $recipeId = $validated['recipe_id'];

        // すでにいいねしているか確認
        $exists = DB::table('goods')
            ->where('recipe_id', $recipeId)
            ->where('user_id', $userId)
            ->exists();

        if ($exists) {
            // いいねを削除
            DB::table('goods')
                ->where('recipe_id', $recipeId)
                ->where('user_id', $userId)
                ->delete();
        } else {
            // いいねを追加
            DB::table('goods')->insert([
                'recipe_id' => $recipeId,
                'user_id' => $userId,
                'created_at' => now(),
            ]);
        }

        return redirect()->back();
    }
}
