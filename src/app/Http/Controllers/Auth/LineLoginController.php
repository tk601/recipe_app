<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;

class LineLoginController extends Controller
{
    /**
     * リダイレクト先のLINEの認証ページを作成
     */
    public function redirect()
    {
        return Socialite::driver('line')->redirect();
    }

    /**
     * LINEからのコールバックを処理
     */
    public function callback(): RedirectResponse
    {
        try {
            $lineUser = Socialite::driver('line')->user();
            
            // LINE IDがusersテーブルになければ新規作成
            $user = User::where('line_id', $lineUser->id)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $lineUser->name ?? 'LINE User',
                    // 'email' => $lineUser->email ?? 'example@example.com', // LINEはemailを返さない場合がある
                    'password' => Hash::make(Str::random(24)),
                    'line_id' => $lineUser->id,
                    'profile_image_url' => $lineUser->avatar,
                ]);
                
                event(new Registered($user));
            }
            
            // ログイン処理
            Auth::login($user);
            
            return redirect('/');
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['line' => 'LINEログインに失敗しました。' . $e->getMessage()]);
        }
    }
}
