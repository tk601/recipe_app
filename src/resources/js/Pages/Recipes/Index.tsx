import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Heart, ArrowLeft, Search } from 'lucide-react';
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
}

interface Props {
    categories: RecipeCategory[];
    recipes: Recipe[];
    selectedCategoryId: number | null;
    favoriteRecipes: Recipe[];
}

export default function RecipesIndex({ categories, recipes, selectedCategoryId, favoriteRecipes }: Props) {
    // フィルターの状態管理: 'all' | 'cookable'
    const [recipeFilter, setRecipeFilter] = useState<'cookable' | 'all'>('cookable');
    // 検索キーワードの状態管理
    const [searchQuery, setSearchQuery] = useState('');
    // カテゴリの表示数管理
    const [showAllCategories, setShowAllCategories] = useState(false);

    // 現在選択中のカテゴリ情報を取得
    const selectedCategory = useMemo(() => {
        return categories.find(cat => cat.id === selectedCategoryId);
    }, [categories, selectedCategoryId]);

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
     * カテゴリ選択画面に戻る
     */
    const handleBackToCategories = () => {
        router.get(route('recipes.index'), {}, {
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
     * 表示するカテゴリを決定（最大6個まで、もっと見るで全て表示）
     */
    const displayedCategories = useMemo(() => {
        const maxDisplay = 6;
        return showAllCategories ? categories : categories.slice(0, maxDisplay);
    }, [categories, showAllCategories]);

    /**
     * もっと見るボタンの表示判定
     */
    const hasMoreCategories = categories.length > 6;

    /**
     * フィルターと検索に基づいてレシピをフィルタリング
     */
    const filteredRecipes = useMemo(() => {
        let filtered = recipes;

        // フィルター適用
        if (recipeFilter === 'cookable') {
            filtered = filtered.filter(recipe => recipe.can_cook);
        }

        // 検索キーワード適用
        if (searchQuery.trim()) {
            filtered = filtered.filter(recipe =>
                recipe.recipe_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.ingredients.some(ingredient =>
                    ingredient.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        return filtered;
    }, [recipes, recipeFilter, searchQuery]);

    return (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="レシピ - ごはんどき" />

            {/* ヘッダー：カテゴリ未選択時 */}
            {!selectedCategoryId && (
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
            )}

            {/* ヘッダー：カテゴリ選択時 */}
            {selectedCategoryId && selectedCategory && (
                <header
                    className="bg-white shadow-sm sticky top-0 z-10"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        {/* タイトルバー */}
                        <div className="py-3 flex items-center border-b" style={{ borderColor: 'var(--gray)' }}>
                            {/* 戻るボタン */}
                            <button
                                onClick={handleBackToCategories}
                                className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft
                                    className="w-5 h-5"
                                    style={{ color: 'var(--main-color)' }}
                                />
                            </button>

                            {/* カテゴリ名 */}
                            <h1
                                className="text-xl font-bold"
                                style={{ color: 'var(--main-color)' }}
                            >
                                {selectedCategory.recipe_category_name}
                            </h1>
                        </div>

                        {/* 検索ボックス */}
                        <div className="py-3">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--dark-gray)' }}
                                />
                                <input
                                    type="text"
                                    placeholder="料理名・食材で検索"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'var(--gray)',
                                        '--tw-ring-color': 'var(--main-color)'
                                    } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        {/* フィルターボタン */}
                        <div className="flex space-x-2 pb-3 px-0">
                            <button
                                onClick={() => setRecipeFilter('cookable')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    recipeFilter === 'cookable' ? '' : 'opacity-60'
                                }`}
                                style={{
                                    backgroundColor: recipeFilter === 'cookable' ? 'var(--main-color)' : 'var(--light-gray)',
                                    color: recipeFilter === 'cookable' ? 'white' : 'var(--dark-gray)'
                                }}
                            >
                                作れる料理
                            </button>
                            <button
                                onClick={() => setRecipeFilter('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    recipeFilter === 'all' ? '' : 'opacity-60'
                                }`}
                                style={{
                                    backgroundColor: recipeFilter === 'all' ? 'var(--main-color)' : 'var(--light-gray)',
                                    color: recipeFilter === 'all' ? 'white' : 'var(--dark-gray)'
                                }}
                            >
                                全て表示
                            </button>
                        </div>
                    </div>
                </header>
            )}

            {/* カテゴリ未選択時：カテゴリ選択画面 */}
            {!selectedCategoryId && (
                <main className="max-w-7xl mx-auto px-4 py-4">
                    {/* カテゴリ選択セクション */}
                    <h2
                        className="text-lg font-bold mb-4"
                        style={{ color: 'var(--black)' }}
                    >
                        カテゴリを選択
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                            <div className="grid grid-cols-2 gap-4">
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
                </main>
            )}

            {/* カテゴリ選択時：料理一覧画面 */}
            {selectedCategoryId && (
                <main className="max-w-7xl mx-auto px-4 py-4">
                        {filteredRecipes.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {filteredRecipes.map((recipe) => (
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
                                <p style={{ color: 'var(--dark-gray)' }}>
                                    {recipeFilter === 'cookable'
                                        ? '作れる料理がありません'
                                        : 'レシピがありません'}
                                </p>
                            </div>
                        )}
                </main>
            )}

            {/* フッター */}
            <Footer currentPage="recipe" />
        </div>
    );
}
