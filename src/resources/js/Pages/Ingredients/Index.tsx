import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, router } from '@inertiajs/react';
import { Check, X, SlidersHorizontal, Search } from 'lucide-react';
import MobileLayout from '@/Layouts/MobileLayout';
import DesktopLayout from '@/Layouts/DesktopLayout';

interface Ingredient {
    ingredient_id: number;
    category_id: number;
    category_name: string;
    name: string;
    image_url: string;
    seasoning_flg: number;
    in_refrigerator: boolean;
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    categories: Array<{
        id: number;
        name: string;
    }>;
    ingredients: Array<Ingredient>;
    allIngredients: Array<Ingredient>;
    filters: {
        search?: string;
        category?: string;
        highlight?: string;
    };
    activeCategory: number;
    searchQuery: string;
    highlightId?: number;
}

export default function IngredientsIndex({ categories, ingredients, allIngredients, activeCategory, searchQuery, highlightId }: Props) {
    // 検索クエリの状態管理
    const [search, setSearch] = useState(searchQuery || '');

    // PC/モバイルの判定（768px以上でPC表示）
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const checkScreenSize = () => setIsDesktop(window.innerWidth >= 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // 在庫フィルターの状態管理: 'all' | 'in_stock' | 'out_of_stock'
    const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
    // フィルターボトムシートの開閉状態
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // 検索候補の表示状態
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIngredientId, setHighlightedIngredientId] = useState<number | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // カテゴリ横スクロールコンテナのref
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    // 各カテゴリボタンのrefマップ
    const categoryButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    // 検索ボックスのDOM参照と高さ（スペーサー・カテゴリbarのtop計算用）
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const [searchBoxHeight, setSearchBoxHeight] = useState(48);
    // カテゴリバーのDOM参照と高さ（スペーサー用）
    const categoryBarRef = useRef<HTMLDivElement>(null);
    const [categoryBarHeight, setCategoryBarHeight] = useState(50);

    // 実際のDOM高さを計測してスペーサーに反映（モバイルのみ）
    useEffect(() => {
        if (!isDesktop) {
            if (searchBoxRef.current) setSearchBoxHeight(searchBoxRef.current.offsetHeight);
            if (categoryBarRef.current) setCategoryBarHeight(categoryBarRef.current.offsetHeight);
        }
    }, [isDesktop]);

    // activeCategoryが変わったら選択中カテゴリを中央にスクロール
    useEffect(() => {
        const container = categoryScrollRef.current;
        const button = categoryButtonRefs.current.get(activeCategory);
        if (!container || !button) return;
        const scrollTo = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
        container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }, [activeCategory]);

    // URLパラメータからhighlightIdが渡された場合、ページ読み込み時にハイライト
    React.useEffect(() => {
        if (highlightId) {
            setTimeout(() => {
                scrollToIngredient(highlightId);
            }, 300);
        }
    }, [highlightId]);

    /**
     * カテゴリ選択時の処理
     * 選択されたカテゴリIDでページを更新
     */
    const handleCategorySelect = async (categoryId: number) => {
        router.get(route('ingredients.index'), {
            category: categoryId,
            search: search || undefined
        }, {
            preserveState: true,
            replace: true
        });
    };

    /**
     * 検索処理
     * 入力値が変更されたら候補を表示
     */
    // ページ内検索・ヘッダー検索の共通ロジック
    const handleSearchValue = (value: string) => {
        setSearch(value);
        setShowSuggestions(value.trim() ? true : false);
    };

    // ページ内検索ボックス用ハンドラ
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleSearchValue(e.target.value);
    };

    /**
     * 検索候補をフィルタリング
     */
    const searchSuggestions = useMemo(() => {
        if (!search.trim()) return [];

        return allIngredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 10); // 最大10件まで表示
    }, [search, allIngredients]);

    /**
     * 食材を選択して該当箇所までスクロール＆強調表示
     */
    const handleSelectIngredient = (ingredient: Ingredient) => {
        // 検索候補を非表示
        setShowSuggestions(false);
        setSearch('');

        // カテゴリが異なる場合はカテゴリを変更
        if (ingredient.category_id !== activeCategory) {
            // URLパラメータにhighlight_idを追加してカテゴリ変更
            router.get(route('ingredients.index'), {
                category: ingredient.category_id,
                highlight: ingredient.ingredient_id
            }, {
                preserveState: false,
                replace: false,
            });
        } else {
            // 同じカテゴリ内の場合は直接スクロール＆ハイライト
            setTimeout(() => {
                scrollToIngredient(ingredient.ingredient_id);
            }, 100);
        }
    };

    /**
     * 指定した食材までスクロールして強調表示
     */
    const scrollToIngredient = (ingredientId: number) => {
        const element = document.getElementById(`ingredient-${ingredientId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedIngredientId(ingredientId);

            // 3秒後にハイライトを解除
            setTimeout(() => {
                setHighlightedIngredientId(null);
            }, 3000);
        }
    };

    /**
     * 検索候補の外側をクリックしたら閉じる
     */
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // 検索候補のボタンをクリックした場合は何もしない（handleSelectIngredientが実行される）
            if (target.closest('[data-suggestion-item]')) {
                return;
            }

            // 検索コンテナ外をクリックした場合は候補を閉じる
            if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /**
     * 冷蔵庫の在庫状態を切り替え
     */
    const toggleRefrigerator = (ingredientId: number, currentState: boolean) => {
        try {
            router.post(route('ingredients.toggle-refrigerator'), {
                ingredient_id: ingredientId,
                in_refrigerator: !currentState
            }, {
                preserveState: true,
                preserveScroll: true
            });
        } catch (error) {
            console.error('在庫状態の更新に失敗しました:', error);
        }
    };

    /**
     * 在庫フィルターに基づいて食材をフィルタリング
     */
    const filteredIngredients = useMemo(() => {
        if (stockFilter === 'all') {
            return ingredients;
        } else if (stockFilter === 'in_stock') {
            return ingredients.filter(ing => ing.in_refrigerator);
        } else {
            return ingredients.filter(ing => !ing.in_refrigerator);
        }
    }, [ingredients, stockFilter]);

    // PC時はDesktopLayout、モバイル時はMobileLayoutを使用
    const pageContent = (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="食材管理 - ごはんどき" />

            {/* 検索ボックス + フィルターボタン（モバイル時のみ表示。PC時はDesktopHeaderに表示） */}
            {/* fixed にしてアドレスバー高さ変化による1pxずれを防止 */}
            {!isDesktop && (
            <>
            <div style={{ height: searchBoxHeight }} />
            <div
                ref={searchBoxRef}
                className="bg-white border-b fixed left-0 right-0 z-10 px-4 py-3"
                style={{ top: `${56 + categoryBarHeight}px`, borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        {/* 検索ボックス */}
                        <div className="flex-1 relative" ref={searchContainerRef}>
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: 'var(--dark-gray)' }}
                            >
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="食材を探す"
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border input-focus"
                                style={{ borderColor: 'var(--gray)' }}
                            />
                        </div>

                        {/* フィルターボタン（在庫フィルター適用中はメインカラーで強調） */}
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all"
                            style={{
                                backgroundColor: stockFilter !== 'all' ? 'var(--main-color)' : 'var(--light-gray)',
                                color: stockFilter !== 'all' ? 'white' : 'var(--dark-gray)',
                            }}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>フィルター</span>
                        </button>
                    </div>
                </div>
            </div>
            </>
            )}

            {/* 在庫フィルター選択ボトムシート（モバイル） */}
            {isFilterOpen && (
                <>
                    {/* 背景オーバーレイ（タップで閉じる） */}
                    <div
                        className="fixed inset-0 bg-black/40 z-[55]"
                        onClick={() => setIsFilterOpen(false)}
                    />

                    {/* ボトムシート本体 */}
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
                            {(['all', 'in_stock', 'out_of_stock'] as const).map((filter) => {
                                const label = filter === 'all' ? 'すべて' : filter === 'in_stock' ? '在庫あり' : '在庫なし';
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => { setStockFilter(filter); setIsFilterOpen(false); }}
                                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            backgroundColor: stockFilter === filter ? 'var(--base-color)' : 'transparent',
                                            color: stockFilter === filter ? 'var(--main-color)' : 'var(--black)',
                                            border: `1.5px solid ${stockFilter === filter ? 'var(--main-color)' : 'var(--gray)'}`,
                                        }}
                                    >
                                        <span>{label}</span>
                                        {stockFilter === filter && (
                                            <span
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                                style={{ backgroundColor: 'var(--main-color)' }}
                                            >
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* 検索候補のドロップダウン（Portalで描画） */}
            {showSuggestions && searchSuggestions.length > 0 && searchContainerRef.current && createPortal(
                <div
                    className="fixed bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    style={{
                        borderColor: 'var(--gray)',
                        top: searchContainerRef.current.getBoundingClientRect().bottom + 4,
                        left: searchContainerRef.current.getBoundingClientRect().left,
                        width: searchContainerRef.current.offsetWidth,
                        zIndex: 10000,
                    }}
                >
                    {searchSuggestions.map((ingredient) => (
                        <button
                            key={ingredient.ingredient_id}
                            data-suggestion-item
                            onClick={() => handleSelectIngredient(ingredient)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
                            style={{ borderColor: 'var(--gray)' }}
                        >
                            <div className="flex-1">
                                <div
                                    className="font-medium"
                                    style={{ color: 'var(--black)' }}
                                >
                                    {ingredient.name}
                                </div>
                                <div
                                    className="text-xs mt-0.5"
                                    style={{ color: 'var(--dark-gray)' }}
                                >
                                    {ingredient.category_name}
                                </div>
                            </div>
                            <div
                                className={`px-2 py-1 rounded text-xs ${
                                    ingredient.in_refrigerator ? 'text-white' : ''
                                }`}
                                style={{
                                    backgroundColor: ingredient.in_refrigerator ? 'var(--main-color)' : 'var(--light-gray)',
                                    color: ingredient.in_refrigerator ? 'white' : 'var(--dark-gray)'
                                }}
                            >
                                {ingredient.in_refrigerator ? '在庫あり' : '在庫なし'}
                            </div>
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {/* カテゴリ一覧（横スクロール） */}
            {/* モバイル: fixed でずれ防止、PC: sticky のまま */}
            {!isDesktop && <div style={{ height: categoryBarHeight }} />}
            <div
                ref={categoryBarRef}
                className="bg-white border-b z-10"
                style={{
                    borderColor: 'var(--gray)',
                    ...(isDesktop
                        ? { position: 'sticky', top: '97px' }
                        : { position: 'fixed', left: 0, right: 0, top: '56px' }
                    )
                }}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-2 py-3 overflow-x-auto scrollbar-hide" ref={categoryScrollRef}>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                ref={(el) => {
                                    if (el) categoryButtonRefs.current.set(category.id, el);
                                    else categoryButtonRefs.current.delete(category.id);
                                }}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`
                                    flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                                    ${activeCategory === category.id
                                        ? 'text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                                style={{
                                    backgroundColor: activeCategory === category.id ? 'var(--main-color)' : undefined,
                                    borderWidth: activeCategory === category.id ? 0 : 1,
                                    borderColor: activeCategory === category.id ? undefined : 'var(--gray)',
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


{/* 食材リスト：スマホ2列・PC4列グリッド表示 */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {filteredIngredients.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {filteredIngredients.map((ingredient) => (
                            <div
                                key={ingredient.ingredient_id}
                                id={`ingredient-${ingredient.ingredient_id}`}
                                onClick={() => toggleRefrigerator(ingredient.ingredient_id, ingredient.in_refrigerator)}
                                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 active:scale-98 cursor-pointer ${
                                    highlightedIngredientId === ingredient.ingredient_id ? 'ring-4 ring-offset-2' : ''
                                }`}
                                style={{
                                    borderColor: highlightedIngredientId === ingredient.ingredient_id ? 'var(--main-color)' : 'var(--gray)',
                                    '--tw-ring-color': highlightedIngredientId === ingredient.ingredient_id ? 'var(--sub-color)' : undefined
                                } as React.CSSProperties}
                            >
                                <div className="flex flex-col items-center p-4 gap-2">
                                    {/* チェックマーク or バツマーク */}
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor: ingredient.in_refrigerator ? 'var(--main-color)' : 'var(--gray)'
                                        }}
                                    >
                                        {ingredient.in_refrigerator ? (
                                            <Check className="w-6 h-6 text-white" />
                                        ) : (
                                            <X className="w-6 h-6 text-white" />
                                        )}
                                    </div>

                                    {/* 食材名 */}
                                    <h3
                                        className="font-semibold text-sm text-center leading-snug"
                                        style={{ color: 'var(--black)' }}
                                    >
                                        {ingredient.name}
                                    </h3>

                                    {/* 在庫あり・なしバッジ */}
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: ingredient.in_refrigerator ? 'var(--main-color)' : 'var(--light-gray)',
                                            color: ingredient.in_refrigerator ? 'white' : 'var(--dark-gray)'
                                        }}
                                    >
                                        {ingredient.in_refrigerator ? '在庫あり' : '在庫なし'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 検索結果が空の場合
                    <div className="text-center py-16">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--light-gray)' }}
                        >
                            <X
                                className="w-8 h-8"
                                style={{ color: 'var(--dark-gray)' }}
                            />
                        </div>
                        <h3
                            className="text-lg font-medium mb-2"
                            style={{ color: 'var(--black)' }}
                        >
                            食材が見つかりません
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--dark-gray)' }}
                        >
                            {search
                                ? `「${search}」に一致する食材がありません。`
                                : stockFilter === 'in_stock'
                                ? '在庫ありの食材がありません。'
                                : stockFilter === 'out_of_stock'
                                ? '在庫なしの食材がありません。'
                                : 'このカテゴリには食材が登録されていません。'
                            }
                        </p>
                    </div>
                )}
            </main>

        </div>
    );

    // PC時はDesktopLayout（ヘッダーに検索ボックスを表示）、モバイル時はMobileLayout
    return isDesktop ? (
        <DesktopLayout
            currentPage="refrigerators"
            searchValue={search}
            onSearchChange={handleSearchValue}
        >
            {pageContent}
        </DesktopLayout>
    ) : (
        <MobileLayout currentPage="refrigerators">
            {pageContent}
        </MobileLayout>
    );
}
