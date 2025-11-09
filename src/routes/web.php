<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\IngredientController;
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

    // 材料管理のルート
    Route::resource('ingredients', IngredientController::class);

    // // API用ルート
    // Route::get('/api/ingredients/expiring-soon', [IngredientController::class, 'expiringSoon'])
    //     ->name('ingredients.expiring-soon');
});
require __DIR__.'/auth.php';
