import React, { useState, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Camera, Lock, X, Trash2 } from 'lucide-react';
import Footer from '@/Components/Mobile/Footer';

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

interface Recipe {
    id: number;
    recipe_name: string;
    recipe_image_url: string | null;
    recipe_category_id: number;
    recipe_category_name: string | null;
    serving_size: number;
    recommended_points: string | null;
    publish_flg: boolean;
    created_at: string;
    user_name?: string;
    ingredients_count: number;
    likes_count: number;
    is_liked: boolean;
}

interface Props {
    user: User;
    recipeCategories: RecipeCategory[];
    selectedCategoryId: number | null;
    myRecipes: Recipe[];
    likedRecipes: Recipe[];
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

export default function ProfilePage({ user, recipeCategories, selectedCategoryId, myRecipes, likedRecipes }: Props) {
    // フラッシュメッセージを取得
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    // 状態管理
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    // レシピフィルター: 'shared' | 'private'
    const [myRecipeFilter, setMyRecipeFilter] = useState<'all' | 'shared' | 'private'>('all');

    /**
     * カテゴリ選択時の処理
     */
    const handleCategorySelect = (categoryId: number) => {
        router.get(route('mobile.profile'), {
            category: categoryId
        }, {
            preserveState: false,
            preserveScroll: false,
        });
    };

    /**
     * すべてのレシピ表示に戻る
     */
    const handleShowAllRecipes = () => {
        router.get(route('mobile.profile'), {}, {
            preserveState: false,
            preserveScroll: false,
        });
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
     * レシピ詳細画面に遷移（from=profileパラメータ付き）
     */
    const handleRecipeClick = (recipeId: number) => {
        router.get(route('recipes.show', { id: recipeId, from: 'profile' }));
    };

    /**
     * フィルター後のレシピリスト
     */
    const filteredMyRecipes = myRecipes.filter((recipe) => {
        if (myRecipeFilter === 'all') return true;
        if (myRecipeFilter === 'shared') return recipe.publish_flg;
        if (myRecipeFilter === 'private') return !recipe.publish_flg;
        return true;
    });

    return (
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

            <div className="min-h-screen bg-[var(--base-color)] pb-20">
                {/* プロフィール情報セクション */}
                <div className="bg-white shadow">
                    {/* プロフィール画像 */}
                    <div className="flex flex-col items-center pt-6 pb-4">
                        <div className="relative">
                            <div
                                className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 ${isEditingProfile ? 'cursor-pointer hover:opacity-80' : ''} transition`}
                                onClick={handleImageClick}
                            >
                                {profileForm.profile_image_preview ? (
                                    <img
                                        src={profileForm.profile_image_preview}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                                        👤
                                    </div>
                                )}
                            </div>
                            {isEditingProfile && (
                                <button
                                    onClick={handleImageClick}
                                    className="absolute bottom-0 right-0 bg-[var(--main-color)] text-white p-2 rounded-full shadow-lg hover:bg-[var(--sub-color)] transition"
                                >
                                    <Camera size={16} />
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
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 space-y-6">
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

                        {/* カテゴリが選択されている場合は戻るボタンを表示 */}
                        {selectedCategoryId && (
                            <button
                                onClick={handleShowAllRecipes}
                                className="mb-4 px-4 py-2 bg-gray-100 text-[var(--black)] rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                            >
                                <span>←</span>
                                <span>すべてのカテゴリに戻る</span>
                            </button>
                        )}

                        {/* カテゴリ選択されていない場合はカテゴリ一覧を表示 */}
                        {!selectedCategoryId && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-3">カテゴリから選ぶ</h3>
                                <div className="grid grid-cols-3 gap-3">
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
                        )}

                        {/* フィルターボタン */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setMyRecipeFilter('all')}
                                className={`flex-1 py-2 rounded-lg transition ${
                                    myRecipeFilter === 'all'
                                        ? 'bg-[var(--main-color)] text-white'
                                        : 'bg-gray-200 text-[var(--black)]'
                                }`}
                            >
                                すべて ({myRecipes.length})
                            </button>
                            <button
                                onClick={() => setMyRecipeFilter('shared')}
                                className={`flex-1 py-2 rounded-lg transition ${
                                    myRecipeFilter === 'shared'
                                        ? 'bg-[var(--main-color)] text-white'
                                        : 'bg-gray-200 text-[var(--black)]'
                                }`}
                            >
                                共有中 ({myRecipes.filter(r => r.publish_flg).length})
                            </button>
                            <button
                                onClick={() => setMyRecipeFilter('private')}
                                className={`flex-1 py-2 rounded-lg transition ${
                                    myRecipeFilter === 'private'
                                        ? 'bg-[var(--main-color)] text-white'
                                        : 'bg-gray-200 text-[var(--black)]'
                                }`}
                            >
                                非公開 ({myRecipes.filter(r => !r.publish_flg).length})
                            </button>
                        </div>

                        {/* レシピリスト */}
                        {filteredMyRecipes.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">レシピがありません</p>
                        ) : (
                            <div className="space-y-3">
                                {filteredMyRecipes.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => handleRecipeClick(recipe.id)}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <div className="flex items-start gap-3">
                                            {recipe.recipe_image_url ? (
                                                <img
                                                    src={recipe.recipe_image_url}
                                                    alt={recipe.recipe_name}
                                                    className="w-20 h-20 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                                                    🍳
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[var(--black)] mb-1">{recipe.recipe_name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>🥘 {recipe.ingredients_count}品</span>
                                                    <span>❤️ {recipe.likes_count}</span>
                                                    {recipe.publish_flg ? (
                                                        <span className="text-green-600 font-medium">共有中</span>
                                                    ) : (
                                                        <span className="text-gray-500 font-medium">非公開</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* いいねしたレシピセクション */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-[var(--black)] mb-4">
                            いいねしたレシピ ({likedRecipes.length})
                        </h2>

                        {likedRecipes.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">いいねしたレシピがありません</p>
                        ) : (
                            <div className="space-y-3">
                                {likedRecipes.map((recipe) => (
                                    <div
                                        key={recipe.id}
                                        onClick={() => handleRecipeClick(recipe.id)}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <div className="flex items-start gap-3">
                                            {recipe.recipe_image_url ? (
                                                <img
                                                    src={recipe.recipe_image_url}
                                                    alt={recipe.recipe_name}
                                                    className="w-20 h-20 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                                                    🍳
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[var(--black)] mb-1">{recipe.recipe_name}</h3>
                                                <p className="text-sm text-gray-600 mb-1">by {recipe.user_name}</p>
                                                {recipe.recipe_category_name && (
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {recipe.recipe_category_name}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>🥘 {recipe.ingredients_count}品</span>
                                                    <span>❤️ {recipe.likes_count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
            </div>

            <Footer currentPage="profile" />
        </>
    );
}
