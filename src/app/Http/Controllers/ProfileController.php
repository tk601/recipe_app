<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * モバイル用プロフィール画面の表示
     */
    public function show(Request $request): Response
    {
        $user = $request->user();

        // レシピカテゴリ一覧を取得
        $recipeCategories = \App\Models\RecipeCategory::all()->map(function ($category) use ($user) {
            // 各カテゴリごとに自分が作成したレシピの数を取得
            $myRecipesCount = $user->recipes()
                ->where('recipe_category_id', $category->id)
                ->count();

            return [
                'id' => $category->id,
                'recipe_category_name' => $category->recipe_category_name,
                'recipe_category_image_url' => $category->recipe_category_image_url,
                'my_recipes_count' => $myRecipesCount,
            ];
        });

        // ソーシャルログインの判定（パスワードがnullの場合はソーシャルログイン）
        $isSocialLogin = is_null($user->password);

        return Inertia::render('Mobile/ProfilePage', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image_url' => $user->profile_image_url,
                'is_social_login' => $isSocialLogin,
            ],
            'recipeCategories' => $recipeCategories,
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * プロフィール画像をアップロード
     */
    public function updateProfileImage(Request $request): RedirectResponse
    {
        $request->validate([
            'profile_image' => ['required', 'image', 'max:2048'], // 2MB以下
        ]);

        $user = $request->user();

        // 古い画像を削除
        if ($user->profile_image_url && Storage::disk('public')->exists($user->profile_image_url)) {
            Storage::disk('public')->delete($user->profile_image_url);
        }

        // 新しい画像を保存
        $path = $request->file('profile_image')->store('profile_images', 'public');
        $user->profile_image_url = $path;
        $user->save();

        return back()->with('success', 'プロフィール画像を更新しました');
    }

    /**
     * プロフィール情報を更新（モバイル用）
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'profile_image' => ['nullable', 'image', 'max:2048'], // 2MB以下
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // プロフィール画像がアップロードされている場合
        if ($request->hasFile('profile_image')) {
            // 古い画像を削除
            if ($user->profile_image_url && Storage::disk('public')->exists($user->profile_image_url)) {
                Storage::disk('public')->delete($user->profile_image_url);
            }

            // 新しい画像を保存
            $path = $request->file('profile_image')->store('profile_images', 'public');
            $user->profile_image_url = $path;
        }

        $user->save();

        return back()->with('success', 'プロフィールを更新しました');
    }

    /**
     * パスワードを更新
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'パスワードを更新しました');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // ソーシャルログインの場合はパスワード確認不要
        $user = $request->user();
        $isSocialLogin = is_null($user->password);

        if (!$isSocialLogin) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        }

        Auth::logout();

        // プロフィール画像を削除
        if ($user->profile_image_url && Storage::disk('public')->exists($user->profile_image_url)) {
            Storage::disk('public')->delete($user->profile_image_url);
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
