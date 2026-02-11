import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Heart, Plus, X } from 'lucide-react';
import Footer from '@/Components/Mobile/Footer';

interface RecipeCategory {
    id: number;
    recipe_category_name: string;
    recipe_category_image_url: string;
    cookable_count: number;
}

interface Recipe {
    recipe_id: number;
    recipe_name: string;
    recipe_image_url: string;
    recipe_category_id: number;
    ingredients: string[];
    can_cook: boolean;
    likes_count: number;
    is_liked: boolean;
    is_my_recipe?: boolean;
}

interface Props {
    categories: RecipeCategory[];
    favoriteRecipes: Recipe[];
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

export default function RecipesIndex({ categories, favoriteRecipes }: Props) {
    // フラッシュメッセージを取得
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    // カテゴリの表示数管理
    const [showAllCategories, setShowAllCategories] = useState(false);
    // フラッシュメッセージの表示状態
    const [showFlash, setShowFlash] = useState(false);

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
     * カテゴリ選択時の処理
     */
    const handleCategorySelect = (categoryId: number) => {
        router.get(route('recipes.index'), {
            category: categoryId
        }, {
            preserveState: false,
            replace: true
        });
    };

    /**
     * レシピ詳細画面に遷移
     */
    const handleRecipeClick = (recipeId: number) => {
        router.visit(route('recipes.show', recipeId));
    };

    /**
     * いいねボタンをクリック
     */
    const handleLike = (e: React.MouseEvent, recipeId: number) => {
        e.stopPropagation(); // 親要素のクリックイベントを防ぐ
        router.post(route('recipes.toggle-like'), {
            recipe_id: recipeId
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    /**
     * 画面サイズを判定（768px以上をPC画面とする）
     */
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // 初回レンダリング時に画面サイズをチェック
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    /**
     * 表示するカテゴリを決定（スマホ: 6個、PC: 8個まで、もっと見るで全て表示）
     */
    const displayedCategories = useMemo(() => {
        const maxDisplay = isDesktop ? 8 : 6;
        return showAllCategories ? categories : categories.slice(0, maxDisplay);
    }, [categories, showAllCategories, isDesktop]);

    /**
     * もっと見るボタンの表示判定（スマホ: 6個以上、PC: 8個以上）
     */
    const hasMoreCategories = isDesktop ? categories.length > 8 : categories.length > 6;

    return (
        <div
            className="min-h-screen pb-20 md:pb-8"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="レシピ - ごはんどき" />

            {/* フラッシュメッセージ */}
            {showFlash && (flash?.success || flash?.error) && (
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

            {/* ヘッダー */}
            <header
                className="bg-white shadow-sm border-b sticky top-0 z-10"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="py-4">
                        <h1
                            className="text-xl font-bold"
                            style={{ color: 'var(--main-color)' }}
                        >
                            レシピ
                        </h1>
                    </div>
                </div>
            </header>

            {/* カテゴリ選択画面 */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {/* カテゴリ選択セクション */}
                    <h2
                        className="text-lg font-bold mb-4"
                        style={{ color: 'var(--black)' }}
                    >
                        カテゴリを選択
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        {displayedCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className="bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 active:scale-95 hover:shadow-md"
                                style={{ borderColor: 'var(--gray)' }}
                            >
                                {/* カテゴリ名 */}
                                <h3
                                    className="font-bold text-center text-lg mb-2"
                                    style={{ color: 'var(--black)' }}
                                >
                                    {category.recipe_category_name}
                                </h3>

                                {/* 作れる料理数 */}
                                <div
                                    className="text-sm text-center"
                                    style={{ color: category.cookable_count > 0 ? 'var(--main-color)' : 'var(--dark-gray)' }}
                                >
                                    {category.cookable_count > 0 ? `作れる料理: ${category.cookable_count}件` : '0件'}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* もっと見るボタン */}
                    {hasMoreCategories && !showAllCategories && (
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setShowAllCategories(true)}
                                className="px-6 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-md"
                                style={{
                                    backgroundColor: 'var(--light-gray)',
                                    color: 'var(--main-color)'
                                }}
                            >
                                もっと見る
                            </button>
                        </div>
                    )}

                    {/* お気に入り一覧セクション */}
                    <div className="mt-8">
                        <h2
                            className="text-lg font-bold mb-4"
                            style={{ color: 'var(--black)' }}
                        >
                            お気に入り
                        </h2>
                        {favoriteRecipes.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {favoriteRecipes.map((recipe) => (
                                    <div
                                        key={recipe.recipe_id}
                                        onClick={() => handleRecipeClick(recipe.recipe_id)}
                                        className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 active:scale-95 cursor-pointer"
                                        style={{ borderColor: 'var(--gray)' }}
                                    >
                                        {/* 料理画像 */}
                                        <div className="relative aspect-square">
                                            <img
                                                src={recipe.recipe_image_url || '/images/no-image.png'}
                                                alt={recipe.recipe_name}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* いいねボタン */}
                                            <button
                                                onClick={(e) => handleLike(e, recipe.recipe_id)}
                                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-all duration-200 hover:bg-white"
                                            >
                                                <Heart
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: recipe.is_liked ? 'var(--main-color)' : 'var(--dark-gray)',
                                                        fill: recipe.is_liked ? 'var(--main-color)' : 'none'
                                                    }}
                                                />
                                            </button>

                                            {/* 作れるバッジ */}
                                            {recipe.can_cook && (
                                                <div
                                                    className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
                                                    style={{ backgroundColor: 'var(--main-color)' }}
                                                >
                                                    作れる!
                                                </div>
                                            )}
                                        </div>

                                        {/* 料理情報 */}
                                        <div className="p-3">
                                            <h3
                                                className="font-bold text-sm mb-1"
                                                style={{ color: 'var(--black)' }}
                                            >
                                                {recipe.recipe_name}
                                            </h3>

                                            {/* 食材リスト */}
                                            <div
                                                className="text-xs line-clamp-2"
                                                style={{ color: 'var(--dark-gray)' }}
                                            >
                                                {recipe.ingredients.join('、')}
                                            </div>

                                            {/* いいね数 */}
                                            {recipe.likes_count > 0 && (
                                                <div
                                                    className="text-xs mt-2 flex items-center"
                                                    style={{ color: 'var(--dark-gray)' }}
                                                >
                                                    <Heart className="w-3 h-3 mr-1" />
                                                    {recipe.likes_count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--dark-gray)' }}
                                >
                                    いいねをしたレシピが表示されます！
                                </p>
                            </div>
                        )}
                    </div>
                    {/* レシピ作成ボタン（浮動） */}
                    <button
                        onClick={() => router.visit(route('recipes.create'))}
                        className="fixed bottom-24 md:bottom-20 right-4 md:right-16 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 hover:shadow-xl active:scale-95 z-20"
                        style={{ backgroundColor: 'var(--main-color)' }}
                    >
                        <span className="text-white font-bold text-sm">レシピ作成</span>
                        <Plus className="w-4 h-4 text-white" />
                    </button>
            </main>

            {/* フッター */}
            <Footer currentPage="recipe" />
        </div>
    );
}
