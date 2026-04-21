import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Heart, ArrowLeft, Search, Plus, X, SlidersHorizontal } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';
import DesktopLayout from '@/Layouts/DesktopLayout';

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
    category: RecipeCategory;
    recipes: Recipe[];
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

// フィルター選択肢のラベル定義
const filterLabels: Record<'cookable' | 'all' | 'my_recipe', string> = {
    cookable: '作れる料理',
    all: '全て表示',
    my_recipe: 'マイレシピ',
};

export default function CategoryRecipes({ category, recipes }: Props) {
    // フラッシュメッセージを取得
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    // URLパラメータからフィルターを取得
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter') as 'cookable' | 'all' | 'my_recipe' | null;

    // フィルターの状態管理: 'all' | 'cookable' | 'my_recipe'
    // URLパラメータがあればそれを使用、なければデフォルトの'cookable'
    const [recipeFilter, setRecipeFilter] = useState<'cookable' | 'all' | 'my_recipe'>(
        filterParam && ['cookable', 'all', 'my_recipe'].includes(filterParam) ? filterParam : 'all'
    );
    // 検索キーワードの状態管理
    const [searchQuery, setSearchQuery] = useState('');
    // フラッシュメッセージの表示状態
    const [showFlash, setShowFlash] = useState(false);
    // スマホ用フィルターパネルの開閉状態
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 画面サイズを判定（768px以上をPC画面とする）
    const [isDesktop, setIsDesktop] = useState(false);

    // PC用サブヘッダーの表示状態（下スクロール時に非表示）
    const [isSubHeaderVisible, setIsSubHeaderVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    useEffect(() => {
        // 初回レンダリング時に画面サイズをチェック
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // スクロール方向を検知してPC用サブヘッダーの表示を制御する
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollYRef.current && currentScrollY > 60) {
                // 下スクロール：サブヘッダーを非表示
                setIsSubHeaderVisible(false);
            } else {
                // 上スクロール or ページ上部付近：サブヘッダーを表示
                setIsSubHeaderVisible(true);
            }
            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
     * デスクトップヘッダーの検索ボックスから呼ばれるハンドラ
     */
    const handleSearchValue = (value: string) => {
        setSearchQuery(value);
    };

    /**
     * スマホ用フィルター選択時の処理
     * 選択後にパネルを閉じる
     */
    const handleMobileFilterSelect = (filter: 'cookable' | 'all' | 'my_recipe') => {
        setRecipeFilter(filter);
        setIsFilterOpen(false);
    };

    /**
     * フィルターと検索に基づいてレシピをフィルタリング
     */
    const filteredRecipes = useMemo(() => {
        let filtered = recipes;

        // フィルター適用
        if (recipeFilter === 'cookable') {
            filtered = filtered.filter(recipe => recipe.can_cook);
        } else if (recipeFilter === 'my_recipe') {
            // マイレシピフィルター: user_idがログインユーザーと同じレシピのみ
            filtered = filtered.filter(recipe => recipe.is_my_recipe);
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

    const pageContent = (
        <div
            className="min-h-screen pb-20 md:pb-8"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title={`${category.recipe_category_name} - ごはんどき`} />

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

            {/* ===== PC用サブヘッダー ===== */}
            {/* 左：戻るボタン＋カテゴリ名　右：フィルターボタン（横並び） */}
            {/* 下スクロール時に -translate-y-full でヘッダー裏に隠れる */}
            <div
                className={`hidden md:block sticky top-16 z-20 bg-white border-b transition-transform duration-300 ${
                    isSubHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between py-3">
                        {/* 左：戻るボタン＋カテゴリ名 */}
                        <button
                            onClick={handleBackToCategories}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft
                                className="w-5 h-5"
                                style={{ color: 'var(--main-color)' }}
                            />
                            <span
                                className="text-xl font-bold"
                                style={{ color: 'var(--main-color)' }}
                            >
                                {category.recipe_category_name}
                            </span>
                        </button>

                        {/* 右：フィルターボタン群 */}
                        <div className="flex items-center gap-2">
                            {(['cookable', 'all', 'my_recipe'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setRecipeFilter(filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                        recipeFilter === filter ? '' : 'opacity-60'
                                    }`}
                                    style={{
                                        backgroundColor: recipeFilter === filter ? 'var(--main-color)' : 'var(--light-gray)',
                                        color: recipeFilter === filter ? 'white' : 'var(--dark-gray)',
                                    }}
                                >
                                    {filterLabels[filter]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== スマホ用サブヘッダー ===== */}
            <div
                className="md:hidden sticky top-14 z-20 bg-white border-b"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4">
                    {/* 1行目：戻るボタン＋カテゴリ名（左）　フィルタートグル（右） */}
                    <div className="flex items-center justify-between py-3">
                        {/* 左：戻るボタン＋カテゴリ名 */}
                        <button
                            onClick={handleBackToCategories}
                            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft
                                className="w-5 h-5"
                                style={{ color: 'var(--main-color)' }}
                            />
                            <span
                                className="text-base font-bold"
                                style={{ color: 'var(--main-color)' }}
                            >
                                {category.recipe_category_name}
                            </span>
                        </button>

                        {/* 右：フィルターボタン */}
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all"
                            style={{
                                backgroundColor: recipeFilter !== 'cookable' ? 'var(--main-color)' : 'var(--light-gray)',
                                color: recipeFilter !== 'cookable' ? 'white' : 'var(--dark-gray)',
                            }}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>フィルター</span>
                        </button>
                    </div>

                    {/* フィルター選択ポップアップ（オーバーレイ＋モーダル） */}
                    {isFilterOpen && (
                        <>
                            {/* 背景オーバーレイ（タップで閉じる）※フッターより上に重ねる */}
                            <div
                                className="fixed inset-0 bg-black/40 z-[55]"
                                onClick={() => setIsFilterOpen(false)}
                            />

                            {/* ポップアップ本体（フッターより上・pb-20でフッター分の余白を確保） */}
                            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl shadow-xl px-4 pb-20 pt-4">
                                {/* ハンドル */}
                                <div className="flex justify-center mb-4">
                                    <div
                                        className="w-10 h-1 rounded-full"
                                        style={{ backgroundColor: 'var(--gray)' }}
                                    />
                                </div>

                                {/* タイトル */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3
                                        className="text-base font-bold"
                                        style={{ color: 'var(--black)' }}
                                    >
                                        フィルター
                                    </h3>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-5 h-5" style={{ color: 'var(--dark-gray)' }} />
                                    </button>
                                </div>

                                {/* フィルター選択肢 */}
                                <div className="flex flex-col gap-2">
                                    {(['cookable', 'all', 'my_recipe'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => handleMobileFilterSelect(filter)}
                                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                            style={{
                                                backgroundColor: recipeFilter === filter ? 'var(--base-color)' : 'transparent',
                                                color: recipeFilter === filter ? 'var(--main-color)' : 'var(--black)',
                                                border: `1.5px solid ${recipeFilter === filter ? 'var(--main-color)' : 'var(--gray)'}`,
                                            }}
                                        >
                                            <span>{filterLabels[filter]}</span>
                                            {recipeFilter === filter && (
                                                <span
                                                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                                    style={{ backgroundColor: 'var(--main-color)' }}
                                                >
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* 検索ボックス（スマホのみ表示・スティッキー外に配置してスクロールで自然に消える） */}
            <div className="md:hidden bg-white border-b px-4 py-3" style={{ borderColor: 'var(--gray)' }}>
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--dark-gray)' }}
                    />
                    <input
                        type="text"
                        placeholder="レシピ名・食材名で検索"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm"
                        style={{
                            borderColor: 'var(--gray)',
                            '--tw-ring-color': 'var(--main-color)'
                        } as React.CSSProperties}
                    />
                </div>
            </div>

            {/* レシピ一覧 */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                : recipeFilter === 'my_recipe'
                                ? 'マイレシピがありません'
                                : 'レシピがありません'}
                        </p>
                    </div>
                )}

                {/* レシピ作成ボタン（浮動）※PC画面・フィルターポップアップ表示中は非表示 */}
                <button
                    onClick={() => router.visit(route('recipes.create'))}
                    className={`md:hidden fixed bottom-24 right-4 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 hover:shadow-xl active:scale-95 z-20 ${
                        isFilterOpen ? 'hidden' : ''
                    }`}
                    style={{ backgroundColor: 'var(--main-color)' }}
                >
                    <span className="text-white font-bold text-sm">レシピ作成</span>
                    <Plus className="w-4 h-4 text-white" />
                </button>
            </main>
        </div>
    );

    // PC時はDesktopLayout（ヘッダーに検索ボックスを表示）、モバイル時はMobileLayout
    return isDesktop ? (
        <DesktopLayout
            currentPage="recipe"
            searchValue={searchQuery}
            onSearchChange={handleSearchValue}
        >
            {pageContent}
        </DesktopLayout>
    ) : (
        <MobileLayout currentPage="recipe">
            {pageContent}
        </MobileLayout>
    );
}
