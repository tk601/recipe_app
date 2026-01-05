import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Head, router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import Footer from '@/Components/Mobile/Footer';

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

    // 在庫フィルターの状態管理: 'all' | 'in_stock' | 'out_of_stock'
    const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

    // 検索候補の表示状態
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIngredientId, setHighlightedIngredientId] = useState<number | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

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
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        // 検索候補を表示
        if (value.trim()) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
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

    return (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="食材管理 - ごはんどき" />

            {/* ヘッダー */}
            <header
                className="bg-white shadow-sm border-b sticky top-0 z-10"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="py-4">
                        {/* タイトル */}
                        <h1
                            className="text-xl font-bold mb-3"
                            style={{ color: 'var(--main-color)' }}
                        >
                            食材管理
                        </h1>

                        {/* 検索ボックス */}
                        <div className="relative" ref={searchContainerRef}>
                            <input
                                type="text"
                                placeholder="食材を探す"
                                value={search}
                                onChange={handleSearch}
                                className="w-full px-4 py-2 rounded-lg border input-focus"
                                style={{
                                    borderColor: 'var(--gray)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

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
            <div
                className="bg-white border-b sticky top-[88px] z-10"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-2 py-3 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
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

            {/* 在庫フィルター */}
            <div
                className="bg-white border-b sticky top-[144px] z-10"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-2 py-3">
                        {/* すべて */}
                        <button
                            onClick={() => setStockFilter('all')}
                            className={`
                                flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${stockFilter === 'all' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}
                            `}
                            style={{
                                backgroundColor: stockFilter === 'all' ? 'var(--main-color)' : 'white',
                                borderWidth: 1,
                                borderColor: stockFilter === 'all' ? 'var(--main-color)' : 'var(--gray)',
                            }}
                        >
                            すべて
                        </button>

                        {/* 在庫あり */}
                        <button
                            onClick={() => setStockFilter('in_stock')}
                            className={`
                                flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${stockFilter === 'in_stock' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}
                            `}
                            style={{
                                backgroundColor: stockFilter === 'in_stock' ? 'var(--main-color)' : 'white',
                                borderWidth: 1,
                                borderColor: stockFilter === 'in_stock' ? 'var(--main-color)' : 'var(--gray)',
                            }}
                        >
                            在庫あり
                        </button>

                        {/* 在庫なし */}
                        <button
                            onClick={() => setStockFilter('out_of_stock')}
                            className={`
                                flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${stockFilter === 'out_of_stock' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}
                            `}
                            style={{
                                backgroundColor: stockFilter === 'out_of_stock' ? 'var(--main-color)' : 'white',
                                borderWidth: 1,
                                borderColor: stockFilter === 'out_of_stock' ? 'var(--main-color)' : 'var(--gray)',
                            }}
                        >
                            在庫なし
                        </button>
                    </div>
                </div>
            </div>

            {/* 食材リスト */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {filteredIngredients.length > 0 ? (
                    <div className="space-y-2">
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
                                <div className="flex items-center p-4">
                                    {/* 左側：チェックマーク or バツマーク */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
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

                                    {/* 真ん中：食材名とカテゴリ名 */}
                                    <div className="flex-1 ml-4">
                                        <h3
                                            className="font-semibold text-base"
                                            style={{ color: 'var(--black)' }}
                                        >
                                            {ingredient.name}
                                        </h3>
                                        <p
                                            className="text-sm mt-0.5"
                                            style={{ color: 'var(--dark-gray)' }}
                                        >
                                            {ingredient.category_name}
                                        </p>
                                    </div>

                                    {/* 右側：在庫あり・なしの文字 */}
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                ingredient.in_refrigerator ? 'text-white' : ''
                                            }`}
                                            style={{
                                                backgroundColor: ingredient.in_refrigerator ? 'var(--main-color)' : 'var(--light-gray)',
                                                color: ingredient.in_refrigerator ? 'white' : 'var(--dark-gray)'
                                            }}
                                        >
                                            {ingredient.in_refrigerator ? '在庫あり' : '在庫なし'}
                                        </span>
                                    </div>
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

            {/* フッター */}
            <Footer currentPage="refrigerators" />
        </div>
    );
}
