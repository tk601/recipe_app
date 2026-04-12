import React, { useState, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Camera, Lock, X, Trash2, LogOut } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';
import DesktopLayout from '@/Layouts/DesktopLayout';

// 型定義
interface User {
    id: number;
    name: string;
    email: string;
    profile_image_url: string | null;
    is_social_login: boolean;
}

interface RecipeCategory {
    id: number;
    recipe_category_name: string;
    recipe_category_image_url: string;
    my_recipes_count: number;
}

interface Props {
    user: User;
    recipeCategories: RecipeCategory[];
}

interface FlashMessages {
    success?: string;
    error?: string;
}

interface PageProps extends Props {
    auth: {
        user: any;
    };
    flash?: FlashMessages;
    [key: string]: any;
}

export default function ProfilePage({ user, recipeCategories }: Props) {
    // フラッシュメッセージを取得
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    // PC/モバイルの判定（768px以上でPC表示）
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const checkScreenSize = () => setIsDesktop(window.innerWidth >= 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // 状態管理
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [showFlash, setShowFlash] = useState(false);


    /**
     * カテゴリ選択時の処理（レシピ画面に移動してマイレシピフィルターを適用）
     */
    const handleCategorySelect = (categoryId: number) => {
        router.get(route('recipes.index', {
            category: categoryId,
            filter: 'my_recipe' // マイレシピフィルターを適用
        }));
    };

    // フォームデータ
    const [profileForm, setProfileForm] = useState({
        name: user.name,
        email: user.email,
        profile_image: null as File | null,
        profile_image_preview: user.profile_image_url ? `/storage/${user.profile_image_url}` : null as string | null,
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

    // ファイル入力用ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // フラッシュメッセージが存在する場合に表示
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            // 3秒後に自動的に非表示
            const timer = setTimeout(() => {
                setShowFlash(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    /**
     * プロフィール画像をクリックしてファイル選択を開く（編集モード時のみ）
     */
    const handleImageClick = () => {
        if (isEditingProfile) {
            fileInputRef.current?.click();
        }
    };

    /**
     * プロフィール画像の変更（プレビューのみ）
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // プレビュー用にFileReaderで読み込む
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm({
                    ...profileForm,
                    profile_image: file,
                    profile_image_preview: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * プロフィール情報の更新
     */
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        // FormDataを作成
        const formData = new FormData();
        formData.append('name', profileForm.name);
        formData.append('email', profileForm.email);

        // 画像が選択されている場合
        if (profileForm.profile_image) {
            formData.append('profile_image', profileForm.profile_image);
        }

        router.post(route('profile.update-profile'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingProfile(false);
            },
        });
    };

    /**
     * プロフィール編集をキャンセル
     */
    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setProfileForm({
            name: user.name,
            email: user.email,
            profile_image: null,
            profile_image_preview: user.profile_image_url ? `/storage/${user.profile_image_url}` : null,
        });
    };

    /**
     * パスワードの更新
     */
    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('profile.update-password'), passwordForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingPassword(false);
                setPasswordForm({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
        });
    };

    /**
     * アカウント削除
     */
    const handleDeleteAccount = () => {
        router.delete(route('profile.destroy'), {
            data: user.is_social_login ? {} : { password: deleteAccountPassword },
            preserveScroll: true,
        });
    };

    /**
     * ログアウト処理
     */
    const handleLogout = () => {
        router.post(route('logout'));
    };

    // PC時はDesktopLayout、モバイル時はMobileLayoutを使用
    const pageContent = (
        <>
            <Head title="プロフィール" />

            {/* フラッシュメッセージ */}
            {showFlash && flash && (
                <div
                    className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-fade-in"
                    style={{
                        backgroundColor: flash?.success ? 'var(--main-color)' : '#ef4444',
                        color: 'white'
                    }}
                >
                    <span className="font-medium">{flash?.success || flash?.error}</span>
                    <button
                        onClick={() => setShowFlash(false)}
                        className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="min-h-screen bg-[var(--base-color)] pb-20 md:pb-8">

                {/* PC画面用のコンテナ */}
                <div className="max-w-6xl mx-auto md:p-8">

                    {/* PC画面では2カラムレイアウト、スマホでは1カラム */}
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        {/* 左カラム: プロフィール情報 (PC: 1/3, スマホ: 100%) */}
                        <div className="md:col-span-1">
                            <div className="bg-white shadow md:rounded-lg">
                                {/* プロフィール画像 */}
                                <div className="flex flex-col items-center pt-6 pb-4">
                                    <div className="relative">
                                        <div
                                            className={`w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 ${isEditingProfile ? 'cursor-pointer hover:opacity-80' : ''} transition`}
                                            onClick={handleImageClick}
                                        >
                                            {profileForm.profile_image_preview ? (
                                                <img
                                                    src={profileForm.profile_image_preview}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl text-gray-400">
                                                    👤
                                                </div>
                                            )}
                                        </div>
                                        {isEditingProfile && (
                                            <button
                                                onClick={handleImageClick}
                                                className="absolute bottom-0 right-0 bg-[var(--main-color)] text-white p-2 rounded-full shadow-lg hover:bg-[var(--sub-color)] transition"
                                            >
                                                <Camera size={16} className="md:w-5 md:h-5" />
                                            </button>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                {/* プロフィール編集フォーム */}
                                <div className="px-6 pb-6">
                                    {isEditingProfile ? (
                                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--black)] mb-1">
                                                    ユーザー名
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--black)] mb-1">
                                                    メールアドレス
                                                </label>
                                                <input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 bg-[var(--main-color)] text-white py-2 rounded-lg hover:bg-[var(--sub-color)] transition"
                                                >
                                                    保存
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="flex-1 bg-gray-300 text-[var(--black)] py-2 rounded-lg hover:bg-gray-400 transition"
                                                >
                                                    キャンセル
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="text-center">
                                                <p className="text-xl font-bold text-[var(--black)]">{user.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                                            </div>
                                            {user.is_social_login && (
                                                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                                    <p className="text-sm text-blue-700 text-center">ソーシャルログインでログイン中</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setIsEditingProfile(true)}
                                                className="w-full bg-[var(--main-color)] text-white py-2 rounded-lg hover:bg-[var(--sub-color)] transition"
                                            >
                                                プロフィールを編集
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full bg-gray-100 text-[var(--black)] py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                            >
                                                <LogOut size={18} />
                                                ログアウト
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 右カラム: 各種設定 (PC: 2/3, スマホ: 100%) */}
                        <div className="md:col-span-2">
                            <div className="p-4 md:p-0 space-y-6">
                                {/* パスワード変更セクション（ソーシャルログイン以外） */}
                                {!user.is_social_login && (
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Lock size={20} className="text-[var(--main-color)]" />
                                            <h2 className="text-lg font-bold text-[var(--black)]">パスワード変更</h2>
                                        </div>

                                        {isEditingPassword ? (
                                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--black)] mb-1">
                                                        現在のパスワード
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.current_password}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--black)] mb-1">
                                                        新しいパスワード
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.password}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                                                        required
                                                        minLength={8}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--black)] mb-1">
                                                        新しいパスワード（確認）
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.password_confirmation}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                                                        required
                                                        minLength={8}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="flex-1 bg-[var(--main-color)] text-white py-2 rounded-lg hover:bg-[var(--sub-color)] transition"
                                                    >
                                                        パスワードを変更
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditingPassword(false);
                                                            setPasswordForm({
                                                                current_password: '',
                                                                password: '',
                                                                password_confirmation: '',
                                                            });
                                                        }}
                                                        className="flex-1 bg-gray-300 text-[var(--black)] py-2 rounded-lg hover:bg-gray-400 transition"
                                                    >
                                                        キャンセル
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditingPassword(true)}
                                                className="w-full bg-gray-100 text-[var(--black)] py-2 rounded-lg hover:bg-gray-200 transition"
                                            >
                                                パスワードを変更する
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* 作成したレシピセクション */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-lg font-bold text-[var(--black)] mb-4">作成したレシピ</h2>

                                    {/* カテゴリ一覧を表示 */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-600 mb-3">カテゴリから選ぶ</h3>
                                            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {recipeCategories.map((category) => (
                                                    <button
                                                        key={category.id}
                                                        onClick={() => handleCategorySelect(category.id)}
                                                        className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                                    >
                                                        <div className="w-16 h-16 mb-2 rounded-full overflow-hidden bg-white">
                                                            <img
                                                                src={category.recipe_category_image_url}
                                                                alt={category.recipe_category_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <p className="text-xs font-medium text-center text-[var(--black)] mb-1">
                                                            {category.recipe_category_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {category.my_recipes_count}件
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                </div>

                                {/* アカウント削除セクション */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Trash2 size={20} className="text-red-500" />
                                        <h2 className="text-lg font-bold text-red-500">アカウント削除</h2>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
                                    </p>
                                    <button
                                        onClick={() => setIsDeleteAccountModalOpen(true)}
                                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                                    >
                                        アカウントを削除する
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* アカウント削除確認モーダル */}
            {isDeleteAccountModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-red-500 mb-4">アカウント削除の確認</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            本当にアカウントを削除しますか？この操作は取り消せません。
                        </p>

                        {!user.is_social_login && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[var(--black)] mb-1">
                                    パスワードを入力して確認してください
                                </label>
                                <input
                                    type="password"
                                    value={deleteAccountPassword}
                                    onChange={(e) => setDeleteAccountPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="パスワード"
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                                disabled={!user.is_social_login && !deleteAccountPassword}
                            >
                                削除する
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleteAccountModalOpen(false);
                                    setDeleteAccountPassword('');
                                }}
                                className="flex-1 bg-gray-300 text-[var(--black)] py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );

    return isDesktop ? (
        <DesktopLayout currentPage="profile">
            {pageContent}
        </DesktopLayout>
    ) : (
        <MobileLayout currentPage="profile">
            {pageContent}
        </MobileLayout>
    );
}
