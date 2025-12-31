import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="ごはんどき - パスワード再設定" />

            <div className="w-full max-w-md">
                {/* パスワード再設定フォーム */}
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
                        className="text-xl font-bold text-center mb-4"
                        style={{ color: 'var(--main-color)' }}
                    >
                        パスワードを忘れた場合
                    </h2>

                    <p
                        className="text-sm text-center mb-6"
                        style={{ color: 'var(--black)' }}
                    >
                        登録されているメールアドレスを入力してください。
                        <br />
                        パスワード再設定用のリンクをお送りします。
                    </p>

                    {/* 送信完了メッセージ */}
                    {status && (
                        <div
                            className="mb-6 p-3 rounded-lg text-sm font-medium text-center"
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
                        <div className="mb-6">
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
                                className="w-full px-4 py-3 rounded-lg border input-focus"
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

                        {/* 送信ボタン */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: 'var(--main-color)',
                            }}
                        >
                            {processing ? '送信中...' : 'パスワード再設定リンクを送信'}
                        </button>
                    </form>

                    {/* 区切り線 */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
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

                    {/* ログインページへのリンク */}
                    <Link
                        href={route('login')}
                        className="w-full inline-flex justify-center items-center py-3 px-4 border rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                        style={{
                            borderColor: 'var(--main-color)',
                            color: 'var(--main-color)',
                            backgroundColor: 'white'
                        }}
                    >
                        ログイン画面に戻る
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
