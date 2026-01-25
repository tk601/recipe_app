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

        return Inertia::render('Mobile/ShoppingLists', [
            'shoppingLists' => $shoppingLists,
        ]);
    }

    /**
     * 買い物リストに追加
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
        ]);

        $userId = $request->user()->id;

        // 既に同じ材料が買い物リストにあるか確認
        $exists = ShoppingList::where('user_id', $userId)
            ->where('ingredients_id', $validated['ingredient_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', '既に買い物リストに追加されています');
        }

        ShoppingList::create([
            'ingredients_id' => $validated['ingredient_id'],
            'user_id' => $userId,
            'check_flg' => 0,
        ]);

        return back()->with('success', '買い物リストに追加しました');
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

        // 冷蔵庫に追加
        foreach ($shoppingListItems as $item) {
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
