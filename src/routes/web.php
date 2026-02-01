<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ShoppingListController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('RecipeMain');
// });

// ログイン機能をInertiaで作成した時に作成されたもの
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
Route::get('/dashboard', function () {
    // return Inertia::render('Dashboard');
    return redirect()->route('ingredients.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// ログインユーザーのみアクセス可能なルート
Route::middleware('auth')->group(function () {
    // プロフィール関連（breezeで作成したもの）
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // モバイル用プロフィール画面
    Route::get('/mobile/profile', [ProfileController::class, 'show'])->name('mobile.profile');
    Route::post('/profile/update-profile', [ProfileController::class, 'updateProfile'])->name('profile.update-profile');
    Route::post('/profile/update-image', [ProfileController::class, 'updateProfileImage'])->name('profile.update-image');
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');

    // 材料管理のルート
    Route::resource('ingredients', IngredientController::class);

    // 冷蔵庫の在庫状態を切り替え
    Route::post('/ingredients/toggle-refrigerator', [IngredientController::class, 'toggleRefrigerator'])
        ->name('ingredients.toggle-refrigerator');

    // レシピ管理のルート
    Route::get('/recipes', [RecipeController::class, 'index'])->name('recipes.index');
    Route::get('/recipes/create', [RecipeController::class, 'create'])->name('recipes.create');
    Route::post('/recipes', [RecipeController::class, 'store'])->name('recipes.store');
    Route::get('/recipes/{id}', [RecipeController::class, 'show'])->name('recipes.show');
    Route::get('/recipes/{id}/edit', [RecipeController::class, 'edit'])->name('recipes.edit');
    Route::put('/recipes/{id}', [RecipeController::class, 'update'])->name('recipes.update');
    Route::delete('/recipes/{id}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

    // レシピのいいねを切り替え
    Route::post('/recipes/toggle-like', [RecipeController::class, 'toggleLike'])
        ->name('recipes.toggle-like');

    // 冷蔵庫から食材を削除
    Route::post('/recipes/remove-from-refrigerator', [RecipeController::class, 'removeFromRefrigerator'])
        ->name('recipes.remove-from-refrigerator');

    // 冷蔵庫から買い物リストに移動
    Route::post('/recipes/move-to-shopping-list', [RecipeController::class, 'moveToShoppingList'])
        ->name('recipes.move-to-shopping-list');

    // 買い物リスト管理のルート
    Route::get('/shopping-lists', [ShoppingListController::class, 'index'])->name('shopping-lists.index');
    Route::post('/shopping-lists', [ShoppingListController::class, 'store'])->name('shopping-lists.store');
    Route::delete('/shopping-lists', [ShoppingListController::class, 'destroy'])->name('shopping-lists.destroy');
    Route::post('/shopping-lists/move-to-refrigerator', [ShoppingListController::class, 'moveToRefrigerator'])
        ->name('shopping-lists.move-to-refrigerator');

});
require __DIR__.'/auth.php';
