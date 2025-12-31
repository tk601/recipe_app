<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\IngredientCategory;
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

        // var_dump($request->search);

        // カテゴリの一覧を取得する
        $categories = IngredientCategory::select('id', 'name')
            ->orderBy('id', 'asc')
            ->get();

        // デフォルトカテゴリとして「野菜」を設定し、存在しない場合は最初のカテゴリを設定する
        $defaultCategory = $categories->firstWhere('name', '野菜') ?? $categories->first();
        $defaultCategoryId = $request->get('category', $defaultCategory->id);


        // 食材の一覧を取得する
        $ingredients = Ingredient::select('ingredient_categories.name', 'ingredient_categories.id as category_id', 'ingredients.id as ingredient_id','ingredients.name', 'ingredients.image_url', 'ingredients.seasoning_flg')
            ->join('ingredient_categories', 'ingredients.ingredient_category_id', '=', 'ingredient_categories.id')
            ->where('ingredient_category_id', $defaultCategoryId)
            ->when($request->search, function ($query, $search) {
                return $query->where('ingredients.name', 'like', "%{$search}%");
            })
            ->orderBy('ingredients.name', 'asc')
            ->get();


        return Inertia::render('Ingredients/Index', [
            'categories' => $categories,
            'ingredients' => $ingredients,
            'activeCategory' => (int) $defaultCategoryId,
            'searchQuery' => $request->search ?? '',
        ]);
    }

    // /**
    //  * 材料作成フォームを表示
    //  */
    // public function create()
    // {
    //     // よく使うカテゴリーの候補
    //     $categoryOptions = [
    //         '野菜',
    //         '果物',
    //         '肉類',
    //         '魚介類',
    //         '乳製品',
    //         '調味料',
    //         '冷凍食品',
    //         'その他'
    //     ];

    //     return Inertia::render('Ingredients/Create', [
    //         'categoryOptions' => $categoryOptions,
    //     ]);
    // }

    // /**
    //  * 材料を保存
    //  */
    // public function store(Request $request)
    // {
    //     // バリデーション
    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'category' => 'required|string|max:100',
    //         'quantity' => 'required|numeric|min:0',
    //         'unit' => 'required|string|max:50',
    //         'expiry_date' => 'nullable|date|after_or_equal:today',
    //         'memo' => 'nullable|string|max:1000',
    //     ], [
    //         'name.required' => '材料名は必須です。',
    //         'category.required' => 'カテゴリーは必須です。',
    //         'quantity.required' => '数量は必須です。',
    //         'quantity.numeric' => '数量は数値で入力してください。',
    //         'quantity.min' => '数量は0以上で入力してください。',
    //         'unit.required' => '単位は必須です。',
    //         'expiry_date.date' => '有効な日付を入力してください。',
    //         'expiry_date.after_or_equal' => '賞味期限は今日以降の日付を入力してください。',
    //     ]);

    //     // ログインユーザーのIDを追加
    //     $validated['user_id'] = Auth::id();

    //     // 材料を作成
    //     Ingredient::create($validated);

    //     return redirect()->route('ingredients.index')
    //         ->with('message', '材料を登録しました。');
    // }

    // /**
    //  * 材料詳細を表示
    //  */
    // public function show(Ingredient $ingredient)
    // {
    //     // 自分の材料のみアクセス可能
    //     if ($ingredient->user_id !== Auth::id()) {
    //         abort(403);
    //     }

    //     return Inertia::render('Ingredients/Show', [
    //         'ingredient' => $ingredient,
    //     ]);
    // }

    // /**
    //  * 材料編集フォームを表示
    //  */
    // public function edit(Ingredient $ingredient)
    // {
    //     // 自分の材料のみアクセス可能
    //     if ($ingredient->user_id !== Auth::id()) {
    //         abort(403);
    //     }

    //     $categoryOptions = [
    //         '野菜',
    //         '果物',
    //         '肉類',
    //         '魚介類',
    //         '乳製品',
    //         '調味料',
    //         '冷凍食品',
    //         'その他'
    //     ];

    //     return Inertia::render('Ingredients/Edit', [
    //         'ingredient' => $ingredient,
    //         'categoryOptions' => $categoryOptions,
    //     ]);
    // }

    // /**
    //  * 材料を更新
    //  */
    // public function update(Request $request, Ingredient $ingredient)
    // {
    //     // 自分の材料のみ更新可能
    //     if ($ingredient->user_id !== Auth::id()) {
    //         abort(403);
    //     }

    //     // バリデーション
    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'category' => 'required|string|max:100',
    //         'quantity' => 'required|numeric|min:0',
    //         'unit' => 'required|string|max:50',
    //         'expiry_date' => 'nullable|date',
    //         'memo' => 'nullable|string|max:1000',
    //     ], [
    //         'name.required' => '材料名は必須です。',
    //         'category.required' => 'カテゴリーは必須です。',
    //         'quantity.required' => '数量は必須です。',
    //         'quantity.numeric' => '数量は数値で入力してください。',
    //         'quantity.min' => '数量は0以上で入力してください。',
    //         'unit.required' => '単位は必須です。',
    //         'expiry_date.date' => '有効な日付を入力してください。',
    //     ]);

    //     // 材料を更新
    //     $ingredient->update($validated);

    //     return redirect()->route('ingredients.index')
    //         ->with('message', '材料を更新しました。');
    // }

    // /**
    //  * 材料を削除
    //  */
    // public function destroy(Ingredient $ingredient)
    // {
    //     // 自分の材料のみ削除可能
    //     if ($ingredient->user_id !== Auth::id()) {
    //         abort(403);
    //     }

    //     $ingredient->delete();

    //     return redirect()->route('ingredients.index')
    //         ->with('message', '材料を削除しました。');
    // }

    // /**
    //  * 賞味期限が近い材料を取得（API）
    //  */
    // public function expiringSoon()
    // {
    //     $ingredients = Ingredient::where('user_id', Auth::id())
    //         ->expiringSoon()
    //         ->orderBy('expiry_date', 'asc')
    //         ->get();

    //     return response()->json($ingredients);
    // }
}
