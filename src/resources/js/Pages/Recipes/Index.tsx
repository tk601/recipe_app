import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Heart, Plus, X, Search } from 'lucide-react';
import Header from '@/Components/Mobile/Header';
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

// お気に入りのページネーション情報
interface FavoritesPagination {
    currentPage: number;
    hasMore: boolean;
    total: number;
}

interface Props {
    categories: RecipeCategory[];
    favoriteRecipes: Recipe[];
    favoritesPagination: FavoritesPagination;
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

/**
 * 遅延読み込み画像コンポーネント
 * Intersection Observer で表示領域に入ったタイミングで画像を読み込み、
 * 読み込み中は DaisyUI のスケルトンを表示する
 */
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    // idle: 未読み込み / loading: 読み込み中 / loaded: 完了 / error: エラー
    const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 表示領域の 200px 手前から先読みを開始する
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStatus('loading');
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full">
            {/* 読み込み前・読み込み中はスケルトン表示 */}
            {(status === 'idle' || status === 'loading') && (
                <div className="skeleton w-full h-full rounded-none" />
            )}

            {/* 画像を不透明度 0 で読み込んでおき、完了後にフェードイン */}
            {(status === 'loading' || status === 'loaded') && (
                <img
                    src={src || '/images/no-image.png'}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                        status === 'loaded' ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}

            {/* エラー時は no-image にフォールバック */}
            {status === 'error' && (
                <img
                    src="/images/no-image.png"
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            )}
        </div>
    );
};

export default function RecipesIndex({ categories, favoriteRecipes, favoritesPagination }: Props) {
    // フラッシュメッセージを取得
    const page = usePage<PageProps>();
    const flash = page.props.flash;

    // カテゴリの表示数管理
    const [showAllCategories, setShowAllCategories] = useState(false);
    // フラッシュメッセージの表示状態
    const [showFlash, setShowFlash] = useState(false);

    // 検索クエリの状態管理
    const [searchQuery, setSearchQuery] = useState('');
    // 検索結果の状態管理
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    // 検索中フラグ
    const [isSearching, setIsSearching] = useState(false);
    // デバウンス用タイマー
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 蓄積したお気に入りレシピ（無限スクロールで追加していく）
    const [allFavoriteRecipes, setAllFavoriteRecipes] = useState<Recipe[]>(favoriteRecipes);
    // 現在のページネーション状態
    const [pagination, setPagination] = useState<FavoritesPagination>(favoritesPagination);
    // 追加読み込み中フラグ
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // 無限スクロールの監視対象要素（リスト末尾）
    const loadMoreRef = useRef<HTMLDivElement>(null);

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
     * 検索ボックスの入力ハンドラ
     * 入力後300msのデバウンスでAPIを呼ぶ
     */
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // 既存のタイマーをクリア
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        // 入力が空の場合は検索結果をリセット
        if (!value.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        // 300msのデバウンスでAPI呼び出し
        searchTimerRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    route('recipes.search') + `?q=${encodeURIComponent(value)}`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    }
                );

                if (!response.ok) throw new Error('検索エラー');

                const data = await response.json();
                setSearchResults(data.recipes);
            } catch (error) {
                console.error('レシピの検索に失敗しました:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    /**
     * 検索クエリをクリア
     */
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
    };

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

    /**
     * お気に入りレシピを追加で読み込む（無限スクロール用）
     * fetch で JSON エンドポイントを叩き、取得結果を既存リストに追記する
     */
    const loadMoreFavorites = useCallback(async () => {
        // 読み込み中 or 次ページなし の場合は何もしない
        if (isLoadingMore || !pagination.hasMore) return;

        setIsLoadingMore(true);

        try {
            const nextPage = pagination.currentPage + 1;
            const response = await fetch(
                route('recipes.favorite-list') + `?page=${nextPage}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('レスポンスエラー');
            }

            const data = await response.json();

            // 取得したレシピを既存リストに追記
            setAllFavoriteRecipes(prev => [...prev, ...data.items]);
            setPagination({
                currentPage: data.currentPage,
                hasMore:     data.hasMore,
                total:       data.total,
            });
        } catch (error) {
            console.error('お気に入りの追加読み込みに失敗しました:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, pagination]);

    /**
     * リスト末尾の要素を Intersection Observer で監視し、
     * 表示領域に入ったら次ページを読み込む
     */
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    loadMoreFavorites();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [loadMoreFavorites]);

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

            <div className="sticky top-0 z-30">
                <Header currentPage="recipe" />

                {/* 検索ボックス */}
                <div
                    className="bg-white border-b px-4 py-3"
                    style={{ borderColor: 'var(--gray)' }}
                >
                <div className="max-w-7xl mx-auto">
                    <div className="relative">
                        {/* 検索アイコン */}
                        <div
                            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: 'var(--dark-gray)' }}
                        >
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="レシピ名・食材名で検索"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-9 py-2 rounded-lg border"
                            style={{ borderColor: 'var(--gray)' }}
                        />
                        {/* クリアボタン（入力中のみ表示） */}
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--dark-gray)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                </div>
            </div>

            {/* メインコンテンツ：検索中は検索結果、それ以外はカテゴリ＋お気に入り */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {searchQuery ? (
                    /* 検索結果セクション */
                    <div>
                        <h2
                            className="text-lg font-bold mb-4"
                            style={{ color: 'var(--black)' }}
                        >
                            検索結果
                            {!isSearching && (
                                <span
                                    className="ml-2 text-sm font-normal"
                                    style={{ color: 'var(--dark-gray)' }}
                                >
                                    {searchResults.length}件
                                </span>
                            )}
                        </h2>

                        {isSearching ? (
                            // 検索中スピナー
                            <div className="flex justify-center py-12">
                                <span
                                    className="loading loading-spinner loading-md"
                                    style={{ color: 'var(--main-color)' }}
                                />
                            </div>
                        ) : searchResults.length > 0 ? (
                            // 検索結果を2列グリッドで表示
                            <div className="grid grid-cols-2 gap-4">
                                {searchResults.map((recipe) => (
                                    <div
                                        key={recipe.recipe_id}
                                        onClick={() => handleRecipeClick(recipe.recipe_id)}
                                        className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 active:scale-95 cursor-pointer"
                                        style={{ borderColor: 'var(--gray)' }}
                                    >
                                        {/* 料理画像（遅延読み込み） */}
                                        <div className="relative aspect-square">
                                            <LazyImage
                                                src={recipe.recipe_image_url || '/images/no-image.png'}
                                                alt={recipe.recipe_name}
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
                            // 検索結果なし
                            <div className="text-center py-12">
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--dark-gray)' }}
                                >
                                    「{searchQuery}」に一致するレシピが見つかりませんでした
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 通常表示：カテゴリ選択 ＋ お気に入り */
                    <>
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
                                {/* 総件数も表示 */}
                                お気に入り
                                {pagination.total > 0 && (
                                    <span
                                        className="ml-2 text-sm font-normal"
                                        style={{ color: 'var(--dark-gray)' }}
                                    >
                                        {allFavoriteRecipes.length} / {pagination.total}件
                                    </span>
                                )}
                            </h2>

                            {allFavoriteRecipes.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {allFavoriteRecipes.map((recipe) => (
                                            <div
                                                key={recipe.recipe_id}
                                                onClick={() => handleRecipeClick(recipe.recipe_id)}
                                                className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 active:scale-95 cursor-pointer"
                                                style={{ borderColor: 'var(--gray)' }}
                                            >
                                                {/* 料理画像（遅延読み込み） */}
                                                <div className="relative aspect-square">
                                                    <LazyImage
                                                        src={recipe.recipe_image_url || '/images/no-image.png'}
                                                        alt={recipe.recipe_name}
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

                                    {/* 無限スクロールの監視対象（リスト末尾に配置） */}
                                    <div ref={loadMoreRef} className="mt-4 flex justify-center py-4">
                                        {isLoadingMore && (
                                            // 読み込み中スピナー
                                            <span className="loading loading-spinner loading-md" style={{ color: 'var(--main-color)' }} />
                                        )}
                                        {!pagination.hasMore && allFavoriteRecipes.length > 0 && (
                                            // 全件読み込み完了メッセージ
                                            <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
                                                全 {pagination.total} 件を表示しました
                                            </p>
                                        )}
                                    </div>
                                </>
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
                    </>
                )}

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
