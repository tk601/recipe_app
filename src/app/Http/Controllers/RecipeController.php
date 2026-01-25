<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeCategory;
use App\Models\RecipeIngredient;
use App\Models\Refrigerator;
use App\Models\RecipeInstruction;
use App\Models\Ingredient;
use App\Models\IngredientCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
     * レシピ詳細を表示
     */
    public function show($id)
    {
        $userId = Auth::id();

        // レシピの基本情報を取得
        $recipe = Recipe::select(
                'recipes.id',
                'recipes.recipe_name',
                'recipes.recipe_image_url',
                'recipes.recipe_category_id',
                'recipes.serving_size',
                'recipes.recommended_points',
                'recipes.user_id',
                'recipe_categories.recipe_category_name'
            )
            ->join('recipe_categories', 'recipes.recipe_category_id', '=', 'recipe_categories.id')
            ->where('recipes.id', $id)
            ->where('recipes.publish_flg', 1)
            ->firstOrFail();

        // レシピの材料一覧を取得
        $ingredients = RecipeIngredient::where('recipe_ingredients.recipe_id', $id)
            ->join('ingredients', 'recipe_ingredients.ingredients_id', '=', 'ingredients.id')
            ->select(
                'ingredients.id',
                'ingredients.name as ingredient_name',
                'recipe_ingredients.quantity',
                'recipe_ingredients.unit'
            )
            ->get();

        // ユーザーの冷蔵庫にある食材IDを取得
        $userIngredientIds = Refrigerator::where('user_id', $userId)
            ->pluck('ingredients_id')
            ->toArray();

        // 各材料に冷蔵庫の在庫情報を追加
        $ingredients = $ingredients->map(function ($ingredient) use ($userIngredientIds) {
            $ingredient->in_stock = in_array($ingredient->id, $userIngredientIds);
            return $ingredient;
        });

        // 調理手順を取得
        $instructions = RecipeInstruction::where('recipe_id', $id)
            ->orderBy('instruction_no', 'asc')
            ->select('instruction_no', 'description', 'instruction_image_url')
            ->get();

        // いいね数を取得
        $likesCount = DB::table('goods')
            ->where('recipe_id', $id)
            ->count();

        // このユーザーがいいねしているかチェック
        $isLiked = DB::table('goods')
            ->where('recipe_id', $id)
            ->where('user_id', $userId)
            ->exists();

        return Inertia::render('Recipes/Show', [
            'recipe' => [
                'id' => $recipe->id,
                'recipe_name' => $recipe->recipe_name,
                'recipe_image_url' => $recipe->recipe_image_url,
                'recipe_category_id' => $recipe->recipe_category_id,
                'recipe_category_name' => $recipe->recipe_category_name,
                'serving_size' => $recipe->serving_size,
                'recommended_points' => $recipe->recommended_points,
                'user_id' => $recipe->user_id,
                'likes_count' => $likesCount,
                'is_liked' => $isLiked,
            ],
            'ingredients' => $ingredients,
            'instructions' => $instructions,
        ]);
    }

    /**
     * レシピ作成画面を表示
     */
    public function create()
    {
        // 食材一覧を取得
        $ingredients = Ingredient::select('id', 'name', 'ingredient_category_id')
            ->orderBy('ingredient_category_id')
            ->orderBy('name')
            ->get();

        // 食材カテゴリ一覧を取得
        $ingredientCategories = IngredientCategory::select('id', 'name')
            ->orderBy('id')
            ->get();

        // レシピカテゴリ一覧を取得
        $recipeCategories = RecipeCategory::select('id', 'recipe_category_name')
            ->orderBy('id')
            ->get();

        return Inertia::render('Recipes/Create', [
            'ingredients' => $ingredients,
            'ingredientCategories' => $ingredientCategories,
            'recipeCategories' => $recipeCategories,
        ]);
    }

    /**
     * レシピを保存
     */
    public function store(Request $request)
    {
        // バリデーション
        $validated = $request->validate([
            'recipe_name' => 'required|string|max:255',
            'recipe_category_id' => 'required|exists:recipe_categories,id',
            'serving_size' => 'required|integer|min:1|max:6',
            'recommended_points' => 'nullable|string',
            'recipe_image' => 'nullable|image|max:5120', // 最大5MB（5120KB）
            'publish_flg' => 'required|boolean',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|string',
            'ingredients.*.unit' => 'required|string',
            'instructions' => 'required|array|min:1',
            'instructions.*.instruction_no' => 'required|integer',
            'instructions.*.description' => 'required|string',
            'instructions.*.image' => 'nullable|image|max:5120', // 最大5MB（5120KB）
        ]);

        $userId = Auth::id();

        DB::beginTransaction();

        try {
            // レシピ画像の保存
            $recipeImageUrl = null;
            if ($request->hasFile('recipe_image')) {
                $path = $request->file('recipe_image')->store('recipes', 'public');
                $recipeImageUrl = Storage::url($path);
            }

            // レシピを作成
            $recipe = Recipe::create([
                'recipe_name' => $validated['recipe_name'],
                'recipe_category_id' => $validated['recipe_category_id'],
                'recipe_image_url' => $recipeImageUrl,
                'serving_size' => $validated['serving_size'],
                'recommended_points' => $validated['recommended_points'],
                'publish_flg' => $validated['publish_flg'],
                'user_id' => $userId,
            ]);

            // 材料を保存
            foreach ($validated['ingredients'] as $ingredient) {
                RecipeIngredient::create([
                    'recipe_id' => $recipe->id,
                    'ingredients_id' => $ingredient['ingredient_id'],
                    'quantity' => $ingredient['quantity'],
                    'unit' => $ingredient['unit'],
                ]);
            }

            // 調理手順を保存
            foreach ($validated['instructions'] as $index => $instruction) {
                $instructionImageUrl = null;

                // 手順画像の保存（インデックスベースでファイルを取得）
                if ($request->hasFile("instructions.{$index}.image")) {
                    $path = $request->file("instructions.{$index}.image")
                        ->store('instructions', 'public');
                    $instructionImageUrl = Storage::url($path);
                }

                RecipeInstruction::create([
                    'recipe_id' => $recipe->id,
                    'instruction_no' => $instruction['instruction_no'],
                    'description' => $instruction['description'],
                    'instruction_image_url' => $instructionImageUrl,
                    'user_id' => $userId,
                ]);
            }

            DB::commit();

            return redirect()->route('recipes.index')->with('success', 'レシピを作成しました');
        } catch (\Exception $e) {
            Log::error("保存エラー: " . $e->getMessage());
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'レシピの作成に失敗しました: ' . $e->getMessage()]);
        }
    }

    /**
     * レシピ編集画面を表示
     */
    public function edit($id)
    {
        $userId = Auth::id();

        // レシピの基本情報を取得
        $recipe = Recipe::where('id', $id)
            ->where('user_id', $userId) // 自分のレシピのみ編集可能
            ->firstOrFail();

        // レシピの材料一覧を取得
        $recipeIngredients = RecipeIngredient::where('recipe_id', $id)
            ->join('ingredients', 'recipe_ingredients.ingredients_id', '=', 'ingredients.id')
            ->select(
                'recipe_ingredients.id',
                'ingredients.id as ingredient_id',
                'ingredients.name as ingredient_name',
                'recipe_ingredients.quantity',
                'recipe_ingredients.unit'
            )
            ->get();

        // 調理手順を取得
        $instructions = RecipeInstruction::where('recipe_id', $id)
            ->orderBy('instruction_no', 'asc')
            ->get();

        // 食材一覧を取得
        $ingredients = Ingredient::select('id', 'name', 'ingredient_category_id')
            ->orderBy('ingredient_category_id')
            ->orderBy('name')
            ->get();

        // 食材カテゴリ一覧を取得
        $ingredientCategories = IngredientCategory::select('id', 'name')
            ->orderBy('id')
            ->get();

        // レシピカテゴリ一覧を取得
        $recipeCategories = RecipeCategory::select('id', 'recipe_category_name')
            ->orderBy('id')
            ->get();

        return Inertia::render('Recipes/Edit', [
            'recipe' => $recipe,
            'recipeIngredients' => $recipeIngredients,
            'instructions' => $instructions,
            'ingredients' => $ingredients,
            'ingredientCategories' => $ingredientCategories,
            'recipeCategories' => $recipeCategories,
        ]);
    }

    /**
     * レシピを更新
     */
    public function update(Request $request, $id)
    {
        $userId = Auth::id();

        // 自分のレシピか確認
        $recipe = Recipe::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        // バリデーション
        $validated = $request->validate([
            'recipe_name' => 'required|string|max:255',
            'recipe_category_id' => 'required|exists:recipe_categories,id',
            'serving_size' => 'required|integer|min:1|max:6',
            'recommended_points' => 'nullable|string',
            'recipe_image' => 'nullable|image|max:5120',
            'publish_flg' => 'required|boolean',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|string',
            'ingredients.*.unit' => 'required|string',
            'instructions' => 'required|array|min:1',
            'instructions.*.instruction_no' => 'required|integer',
            'instructions.*.description' => 'required|string',
            'instructions.*.image' => 'nullable|image|max:5120',
        ]);

        DB::beginTransaction();

        try {
            // レシピ画像の保存
            $recipeImageUrl = $recipe->recipe_image_url;
            if ($request->hasFile('recipe_image')) {
                // 古い画像を削除
                if ($recipe->recipe_image_url) {
                    $oldPath = str_replace('/storage/', '', $recipe->recipe_image_url);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('recipe_image')->store('recipes', 'public');
                $recipeImageUrl = Storage::url($path);
            }

            // レシピを更新
            $recipe->update([
                'recipe_name' => $validated['recipe_name'],
                'recipe_category_id' => $validated['recipe_category_id'],
                'recipe_image_url' => $recipeImageUrl,
                'serving_size' => $validated['serving_size'],
                'recommended_points' => $validated['recommended_points'],
                'publish_flg' => $validated['publish_flg'],
            ]);

            // 既存の材料を削除
            RecipeIngredient::where('recipe_id', $recipe->id)->delete();

            // 材料を保存
            foreach ($validated['ingredients'] as $ingredient) {
                RecipeIngredient::create([
                    'recipe_id' => $recipe->id,
                    'ingredients_id' => $ingredient['ingredient_id'],
                    'quantity' => $ingredient['quantity'],
                    'unit' => $ingredient['unit'],
                ]);
            }

            // 既存の手順を削除
            RecipeInstruction::where('recipe_id', $recipe->id)->delete();

            // 調理手順を保存
            foreach ($validated['instructions'] as $index => $instruction) {
                $instructionImageUrl = null;

                if ($request->hasFile("instructions.{$index}.image")) {
                    $path = $request->file("instructions.{$index}.image")
                        ->store('instructions', 'public');
                    $instructionImageUrl = Storage::url($path);
                }

                RecipeInstruction::create([
                    'recipe_id' => $recipe->id,
                    'instruction_no' => $instruction['instruction_no'],
                    'description' => $instruction['description'],
                    'instruction_image_url' => $instructionImageUrl,
                    'user_id' => $userId,
                ]);
            }

            DB::commit();

            return redirect()->route('recipes.show', $recipe->id)->with('success', '編集内容を保存しました');
        } catch (\Exception $e) {
            Log::error("更新エラー: " . $e->getMessage());
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'レシピの更新に失敗しました: ' . $e->getMessage()]);
        }
    }

    /**
     * レシピを削除
     */
    public function destroy($id)
    {
        $userId = Auth::id();

        // 自分のレシピか確認
        $recipe = Recipe::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        DB::beginTransaction();

        try {
            // 画像を削除
            if ($recipe->recipe_image_url) {
                $path = str_replace('/storage/', '', $recipe->recipe_image_url);
                Storage::disk('public')->delete($path);
            }

            // 関連データを削除（カスケード削除）
            RecipeIngredient::where('recipe_id', $recipe->id)->delete();
            RecipeInstruction::where('recipe_id', $recipe->id)->delete();
            DB::table('goods')->where('recipe_id', $recipe->id)->delete();

            // レシピを削除
            $recipe->delete();

            DB::commit();

            return redirect()->route('recipes.index')->with('success', 'レシピを削除しました');
        } catch (\Exception $e) {
            Log::error("削除エラー: " . $e->getMessage());
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'レシピの削除に失敗しました']);
        }
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

    /**
     * 冷蔵庫から食材を削除
     */
    public function removeFromRefrigerator(Request $request)
    {
        $validated = $request->validate([
            'ingredient_ids' => 'required|array',
            'ingredient_ids.*' => 'required|exists:ingredients,id',
        ]);

        $userId = Auth::id();

        // 選択された食材を冷蔵庫から削除
        Refrigerator::where('user_id', $userId)
            ->whereIn('ingredients_id', $validated['ingredient_ids'])
            ->delete();

        return redirect()->back()->with('success', '冷蔵庫から削除しました');
    }

    /**
     * 買い物リストに追加
     */
    public function moveToShoppingList(Request $request)
    {
        $validated = $request->validate([
            'ingredient_ids' => 'required|array',
            'ingredient_ids.*' => 'required|exists:ingredients,id',
        ]);

        $userId = Auth::id();

        DB::beginTransaction();

        try {
            foreach ($validated['ingredient_ids'] as $ingredientId) {
                // 既に買い物リストに存在するかチェック
                $exists = DB::table('shopping_lists')
                    ->where('user_id', $userId)
                    ->where('ingredients_id', $ingredientId)
                    ->exists();

                // 存在しない場合のみ追加
                if (!$exists) {
                    DB::table('shopping_lists')->insert([
                        'user_id' => $userId,
                        'ingredients_id' => $ingredientId,
                        'check_flg' => 0,
                        'created_at' => now(),
                    ]);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', '買い物リストに追加しました');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('買い物リスト追加エラー: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => '追加に失敗しました']);
        }
    }
}
