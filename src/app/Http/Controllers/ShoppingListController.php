<?php

namespace App\Http\Controllers;

use App\Models\ShoppingList;
use App\Models\Ingredient;
use App\Models\Refrigerator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShoppingListController extends Controller
{
    /**
     * 買い物リスト一覧を表示
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        // ユーザーの買い物リストを取得
        $shoppingLists = ShoppingList::where('user_id', $userId)
            ->with('ingredient.category')
            ->orderBy('created_at', 'desc')
            ->get();

        // 材料マスタとカテゴリを取得
        $ingredients = Ingredient::with('category')->orderBy('name')->get();
        $ingredientCategories = \App\Models\IngredientCategory::orderBy('name')->get();

        // ユーザーの冷蔵庫にある材料IDのリストを取得
        $refrigeratorIngredientIds = Refrigerator::where('user_id', $userId)
            ->pluck('ingredients_id')
            ->toArray();

        return Inertia::render('Mobile/ShoppingLists', [
            'shoppingLists' => $shoppingLists->map(fn($item) => [
                'id' => $item->id,
                'ingredients_id' => $item->ingredients_id,
                'custom_item' => $item->custom_item,
                'user_id' => $item->user_id,
                'created_at' => $item->created_at,
                'ingredient' => $item->ingredient ? [
                    'id' => $item->ingredient->id,
                    'ingredient_name' => $item->ingredient->name,
                    'ingredient_category_id' => $item->ingredient->ingredient_category_id,
                    'category' => $item->ingredient->category ? [
                        'id' => $item->ingredient->category->id,
                        'category_name' => $item->ingredient->category->name,
                    ] : null,
                ] : null,
                // 冷蔵庫に在庫があるかどうか
                'in_refrigerator' => $item->ingredients_id ? in_array($item->ingredients_id, $refrigeratorIngredientIds) : false,
            ]),
            'ingredients' => $ingredients->map(fn($ing) => [
                'id' => $ing->id,
                'name' => $ing->name,
                'ingredient_category_id' => $ing->ingredient_category_id,
            ]),
            'ingredientCategories' => $ingredientCategories->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
            ]),
        ]);
    }

    /**
     * 買い物リストに追加（複数対応 + 自由入力対応）
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ingredient_ids' => 'nullable|array',
            'ingredient_ids.*' => 'required|exists:ingredients,id',
            'custom_item' => 'nullable|string|max:255',
        ]);

        $userId = $request->user()->id;

        $addedCount = 0;
        $skippedCount = 0;

        // 材料マスタから選択された場合
        if (!empty($validated['ingredient_ids'])) {
            foreach ($validated['ingredient_ids'] as $ingredientId) {
                // 既に同じ材料が買い物リストにあるか確認
                $exists = ShoppingList::where('user_id', $userId)
                    ->where('ingredients_id', $ingredientId)
                    ->exists();

                if ($exists) {
                    $skippedCount++;
                    continue;
                }

                ShoppingList::create([
                    'ingredients_id' => $ingredientId,
                    'user_id' => $userId,
                ]);

                $addedCount++;
            }
        }

        // 自由入力項目がある場合
        if (!empty($validated['custom_item'])) {
            ShoppingList::create([
                'custom_item' => $validated['custom_item'],
                'user_id' => $userId,
            ]);

            $addedCount++;
        }

        $message = "{$addedCount}個のアイテムを買い物リストに追加しました";
        if ($skippedCount > 0) {
            $message .= "（{$skippedCount}個は既に追加済み）";
        }

        return back()->with('success', $message);
    }

    /**
     * 買い物リストから削除（複数対応）
     */
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:shopping_lists,id',
        ]);

        $userId = $request->user()->id;

        // ユーザーの買い物リストのみ削除
        ShoppingList::where('user_id', $userId)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return back()->with('success', '買い物リストから削除しました');
    }

    /**
     * 買い物リストから冷蔵庫に移動（複数対応）
     */
    public function moveToRefrigerator(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:shopping_lists,id',
        ]);

        $userId = $request->user()->id;

        // 選択された買い物リストアイテムを取得
        $shoppingListItems = ShoppingList::where('user_id', $userId)
            ->whereIn('id', $validated['ids'])
            ->get();

        // 冷蔵庫に追加（材料IDがある項目のみ）
        foreach ($shoppingListItems as $item) {
            // 自由入力項目は冷蔵庫に移動できないのでスキップ
            if (empty($item->ingredients_id)) {
                continue;
            }

            // 既に冷蔵庫にある場合はスキップ
            $exists = Refrigerator::where('user_id', $userId)
                ->where('ingredients_id', $item->ingredients_id)
                ->exists();

            if (!$exists) {
                Refrigerator::create([
                    'ingredients_id' => $item->ingredients_id,
                    'user_id' => $userId,
                ]);
            }
        }

        // 買い物リストから削除
        ShoppingList::where('user_id', $userId)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return back()->with('success', '冷蔵庫に保存しました');
    }
}
