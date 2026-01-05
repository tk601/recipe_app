<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\IngredientCategory;
use App\Models\Refrigerator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class IngredientController extends Controller
{
    /**
     * 材料一覧を表示
     * デフォルトで「野菜」のカテゴリーを表示する
     */
    public function index(Request $request)
    {
        // TODO::検索条件を作成する
        // 理想：空白を削除するとか、漢字でもひらがなでもカナでもカタカナでも、全角でも半角でも、検索できるようにする

        Log::info('search:', ['value' => $request->search]);

        // カテゴリの一覧を取得する
        $categories = IngredientCategory::select('id', 'name')
            ->orderBy('id', 'asc')
            ->get();

        // デフォルトカテゴリとして「野菜」を設定し、存在しない場合は最初のカテゴリを設定する
        $defaultCategory = $categories->firstWhere('name', '野菜') ?? $categories->first();
        $defaultCategoryId = $request->get('category', $defaultCategory->id);


        // ユーザーの冷蔵庫にある食材IDを取得
        $userRefrigeratorIngredients = Refrigerator::where('user_id', Auth::id())
            ->pluck('ingredients_id')
            ->toArray();

        // 食材の一覧を取得する
        $ingredients = Ingredient::select('ingredient_categories.name as category_name', 'ingredient_categories.id as category_id', 'ingredients.id as ingredient_id','ingredients.name', 'ingredients.image_url', 'ingredients.seasoning_flg')
            ->join('ingredient_categories', 'ingredients.ingredient_category_id', '=', 'ingredient_categories.id')
            ->where('ingredient_category_id', $defaultCategoryId)
            ->orderBy('ingredients.name', 'asc')
            ->get()
            ->map(function ($ingredient) use ($userRefrigeratorIngredients) {
                // 冷蔵庫にあるかどうかのフラグを追加
                $ingredient->in_refrigerator = in_array($ingredient->ingredient_id, $userRefrigeratorIngredients);
                return $ingredient;
            });

        // 検索用：全カテゴリの食材を取得（検索候補表示用）
        $allIngredients = Ingredient::select('ingredient_categories.name as category_name', 'ingredient_categories.id as category_id', 'ingredients.id as ingredient_id','ingredients.name', 'ingredients.image_url', 'ingredients.seasoning_flg')
            ->join('ingredient_categories', 'ingredients.ingredient_category_id', '=', 'ingredient_categories.id')
            ->orderBy('ingredients.name', 'asc')
            ->get()
            ->map(function ($ingredient) use ($userRefrigeratorIngredients) {
                // 冷蔵庫にあるかどうかのフラグを追加
                $ingredient->in_refrigerator = in_array($ingredient->ingredient_id, $userRefrigeratorIngredients);
                return $ingredient;
            });


        // デバッグ: リクエストパラメータを確認
        \Log::info('Request parameters:', [
            'all' => $request->all(),
            'query' => $request->query(),
            'highlight_input' => $request->input('highlight'),
            'highlight_query' => $request->query('highlight'),
        ]);

        // highlightパラメータを取得（query stringから）
        $highlightId = $request->query('highlight') ? (int) $request->query('highlight') : null;
        \Log::info('highlightId:', ['value' => $highlightId]);

        return Inertia::render('Ingredients/Index', [
            'categories' => $categories,
            'ingredients' => $ingredients,
            'allIngredients' => $allIngredients,
            'activeCategory' => (int) $defaultCategoryId,
            'searchQuery' => $request->search ?? '',
            'highlightId' => $highlightId,
        ]);
    }

    /**
     * 冷蔵庫の在庫状態を切り替え
     */
    public function toggleRefrigerator(Request $request)
    {
        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'in_refrigerator' => 'required|boolean',
        ]);

        $userId = Auth::id();
        $ingredientId = $validated['ingredient_id'];
        $inRefrigerator = $validated['in_refrigerator'];

        if ($inRefrigerator) {
            // 冷蔵庫に追加
            Refrigerator::firstOrCreate([
                'user_id' => $userId,
                'ingredients_id' => $ingredientId,
            ]);
        } else {
            // 冷蔵庫から削除
            Refrigerator::where('user_id', $userId)
                ->where('ingredients_id', $ingredientId)
                ->delete();
        }

        // Inertiaリクエストの場合は前のページにリダイレクト（非同期で状態を保持）
        return redirect()->back();
    }
}
