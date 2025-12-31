import { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    // パスワード表示/非表示の状態管理
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="ごはんどきログイン" />

            <div className="w-full max-w-md">
                {/* ログインフォーム */}
                <div
                    className="bg-white rounded-2xl shadow-lg p-8"
                    style={{ borderTop: '4px solid var(--main-color)' }}
                >
                    <div className="text-center mb-6">
                        <img
                            src="/images/gohandoki_moji.png"
                            alt="ごはんどき"
                            className="mx-auto w-64 max-w-full"
                        />
                    </div>
                    
                    <h2
                        className="text-xl font-bold text-center mb-6"
                        style={{ color: 'var(--main-color)' }}
                    >
                        ログイン
                    </h2>

                    {status && (
                        <div
                            className="mb-4 p-3 rounded-lg text-sm font-medium text-center"
                            style={{
                                backgroundColor: 'var(--base-color)',
                                color: 'var(--main-color)'
                            }}
                        >
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        {/* メールアドレス入力 */}
                        <div className="mb-5">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--black)' }}
                            >
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--sub-color)] transition-all"
                                style={{
                                    borderColor: 'var(--gray)',
                                }}
                                placeholder="example@email.com"
                                autoComplete="email"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* パスワード入力 */}
                        <div className="mb-6">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--black)' }}
                            >
                                パスワード
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--sub-color)] transition-all"
                                    style={{
                                        borderColor: 'var(--gray)',
                                    }}
                                    placeholder="パスワードを入力"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {/* パスワード表示/非表示切り替えボタン */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            className="w-5 h-5"
                                            style={{ color: 'var(--dark-gray)' }}
                                        />
                                    ) : (
                                        <Eye
                                            className="w-5 h-5"
                                            style={{ color: 'var(--dark-gray)' }}
                                        />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* パスワードを忘れた場合のリンク */}
                        {canResetPassword && (
                            <div className="mb-6 text-right">
                                <Link
                                    href={route('password.request')}
                                    className="text-sm hover:underline transition-all"
                                    style={{ color: 'var(--sub-color)' }}
                                >
                                    パスワードを忘れた場合
                                </Link>
                            </div>
                        )}

                        {/* ログインボタン */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: 'var(--main-color)',
                            }}
                        >
                            {processing ? 'ログイン中...' : 'ログイン'}
                        </button>
                    </form>

                    {/* 区切り線 */}
                    <div className="relative my-6">
                        <div
                            className="absolute inset-0 flex items-center"
                        >
                            <div
                                className="w-full border-t"
                                style={{ borderColor: 'var(--gray)' }}
                            ></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span
                                className="px-3 bg-white"
                                style={{ color: 'var(--dark-gray)' }}
                            >
                                または
                            </span>
                        </div>
                    </div>

                    {/* LINEログインボタン */}
                    <div className="mb-4">
                        <a
                            href={route('login.line')}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border rounded-lg shadow-sm bg-[#06C755] text-white font-medium hover:bg-[#06B64B] transition-all"
                        >
                            <img
                                src="/images/LINE_Brand_icon.png"
                                alt="LINE"
                                className="h-5 w-5 mr-2"
                            />
                            <span>LINEでログイン</span>
                        </a>
                    </div>

                    {/* 新規登録ボタン */}
                    <Link
                        href={route('register')}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                        style={{
                            borderColor: 'var(--main-color)',
                            color: 'var(--main-color)',
                            backgroundColor: 'white'
                        }}
                    >
                        新規登録
                    </Link>
                </div>

                {/* フッター */}
                <p
                    className="mt-6 text-center text-xs"
                    style={{ color: 'var(--dark-gray)' }}
                >
                    © 2025 ごはんどき. All rights reserved.
                </p>
            </div>
        </div>
    );
}
