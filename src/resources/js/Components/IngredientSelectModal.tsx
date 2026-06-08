import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';

// 食材の型定義
export interface IngredientItem {
    id: number;
    name: string;
    ingredient_category_id: number;
}

// 食材カテゴリの型定義
export interface IngredientCategoryItem {
    id: number;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    ingredients: IngredientItem[];
    ingredientCategories: IngredientCategoryItem[];
    // 確定時に選択済みIDセットを親に返す
    onConfirm: (selectedIds: Set<number>) => void;
    // 確定ボタンのラベル（デフォルト: '追加する'）
    confirmLabel?: string;
    // フッターに追加するボタンなど（例：買い物リストの「自由入力」ボタン）
    footerExtra?: React.ReactNode;
}

export default function IngredientSelectModal({
    isOpen,
    onClose,
    ingredients,
    ingredientCategories,
    onConfirm,
    confirmLabel = '追加する',
    footerExtra,
}: Props) {
    // 選択中の食材IDセット（モーダル内の一時状態）
    const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<number>>(new Set());
    // 選択中のカテゴリ
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    // 食材検索キーワード
    const [searchKeyword, setSearchKeyword] = useState('');
    // 検索候補の表示状態
    const [showSuggestions, setShowSuggestions] = useState(false);

    // カテゴリ横スクロールコンテナのref
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    // 各カテゴリボタンのrefマップ
    const categoryButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    // 検索入力エリアのref（ドロップダウン位置計算用）
    const searchInputRef = useRef<HTMLDivElement>(null);

    // モーダルが開いたときに状態をリセットし、最初のカテゴリを選択
    useEffect(() => {
        if (isOpen) {
            setSelectedIngredientIds(new Set());
            setSearchKeyword('');
            setShowSuggestions(false);
            setSelectedCategoryId(ingredientCategories[0]?.id || null);
        }
    }, [isOpen]);

    // 選択カテゴリが変わったら中央にスクロール
    useEffect(() => {
        if (selectedCategoryId === null) return;
        const container = categoryScrollRef.current;
        const button = categoryButtonRefs.current.get(selectedCategoryId);
        if (!container || !button) return;
        const scrollTo = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
        container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }, [selectedCategoryId]);

    // 検索候補の外側をクリックしたら閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('[data-suggestion-item]')) return;
            if (searchInputRef.current && !searchInputRef.current.contains(target)) {
                setShowSuggestions(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // 検索候補（最大10件）
    const searchSuggestions = useMemo(() => {
        if (!searchKeyword.trim()) return [];
        return ingredients
            .filter(ing => ing.name.toLowerCase().includes(searchKeyword.toLowerCase()))
            .slice(0, 10);
    }, [searchKeyword, ingredients]);

    // カテゴリでフィルタリングされた食材リスト
    const filteredIngredients = useMemo(() => {
        return selectedCategoryId
            ? ingredients.filter(ing => ing.ingredient_category_id === selectedCategoryId)
            : ingredients;
    }, [selectedCategoryId, ingredients]);

    /**
     * 食材の選択/選択解除
     */
    const toggleIngredient = (id: number) => {
        const newSet = new Set(selectedIngredientIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIngredientIds(newSet);
    };

    /**
     * 検索候補から食材を選択（カテゴリタブも合わせて移動）
     */
    const handleSelectFromSuggestion = (ingredientId: number, categoryId: number) => {
        setShowSuggestions(false);
        setSearchKeyword('');
        setSelectedCategoryId(categoryId);
        const newSet = new Set(selectedIngredientIds);
        newSet.add(ingredientId);
        setSelectedIngredientIds(newSet);
    };

    /**
     * 確定ボタン
     */
    const handleConfirm = () => {
        onConfirm(selectedIngredientIds);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col">
                {/* モーダルヘッダー */}
                <div
                    className="flex-shrink-0 flex justify-between items-center p-4 border-b"
                    style={{ borderColor: 'var(--gray)' }}
                >
                    <h3 className="font-bold" style={{ color: 'var(--black)' }}>材料を選択</h3>
                    <button onClick={onClose}>
                        <X className="w-6 h-6" style={{ color: 'var(--dark-gray)' }} />
                    </button>
                </div>

                {/* 検索ボックス */}
                <div
                    className="flex-shrink-0 p-4 border-b"
                    style={{ borderColor: 'var(--gray)' }}
                >
                    <div className="relative" ref={searchInputRef}>
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                            style={{ color: 'var(--dark-gray)' }}
                        />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={e => {
                                const value = e.target.value;
                                setSearchKeyword(value);
                                setShowSuggestions(value.trim() !== '');
                            }}
                            placeholder="食材を検索..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: 'var(--gray)',
                                '--tw-ring-color': 'var(--main-color)',
                            } as React.CSSProperties}
                        />
                    </div>

                    {/* 検索候補ドロップダウン */}
                    {showSuggestions && searchSuggestions.length > 0 && searchInputRef.current && createPortal(
                        <div
                            className="fixed bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto"
                            style={{
                                borderColor: 'var(--gray)',
                                top: searchInputRef.current.getBoundingClientRect().bottom + 4,
                                left: searchInputRef.current.getBoundingClientRect().left,
                                width: searchInputRef.current.offsetWidth,
                                zIndex: 10001,
                            }}
                        >
                            {searchSuggestions.map(ingredient => {
                                const category = ingredientCategories.find(cat => cat.id === ingredient.ingredient_category_id);
                                return (
                                    <button
                                        key={ingredient.id}
                                        data-suggestion-item
                                        onClick={() => handleSelectFromSuggestion(ingredient.id, ingredient.ingredient_category_id)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
                                        style={{ borderColor: 'var(--gray)' }}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium" style={{ color: 'var(--black)' }}>
                                                {ingredient.name}
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ color: 'var(--dark-gray)' }}>
                                                {category?.name}
                                            </div>
                                        </div>
                                        <div
                                            className="px-2 py-1 rounded text-xs"
                                            style={{
                                                backgroundColor: selectedIngredientIds.has(ingredient.id) ? 'var(--main-color)' : 'var(--light-gray)',
                                                color: selectedIngredientIds.has(ingredient.id) ? 'white' : 'var(--dark-gray)',
                                            }}
                                        >
                                            {selectedIngredientIds.has(ingredient.id) ? '選択中' : '未選択'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>,
                        document.body
                    )}
                </div>

                {/* カテゴリタブ（横スクロール、選択中カテゴリを中央に） */}
                <div
                    ref={categoryScrollRef}
                    className="flex-shrink-0 flex overflow-x-auto p-2 border-b scrollbar-hide"
                    style={{ borderColor: 'var(--gray)' }}
                >
                    {ingredientCategories.map(cat => (
                        <button
                            key={cat.id}
                            ref={el => {
                                if (el) categoryButtonRefs.current.set(cat.id, el);
                                else categoryButtonRefs.current.delete(cat.id);
                            }}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mr-2 ${
                                selectedCategoryId === cat.id ? '' : 'opacity-60'
                            }`}
                            style={{
                                backgroundColor: selectedCategoryId === cat.id ? 'var(--main-color)' : 'var(--light-gray)',
                                color: selectedCategoryId === cat.id ? 'white' : 'var(--dark-gray)',
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* 食材リスト（スクロール） */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredIngredients.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {filteredIngredients.map(ing => (
                                <button
                                    key={ing.id}
                                    onClick={() => toggleIngredient(ing.id)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${
                                        selectedIngredientIds.has(ing.id) ? 'font-bold' : ''
                                    }`}
                                    style={{
                                        borderColor: selectedIngredientIds.has(ing.id) ? 'var(--main-color)' : 'var(--gray)',
                                        backgroundColor: selectedIngredientIds.has(ing.id) ? 'var(--main-color)' : 'white',
                                        color: selectedIngredientIds.has(ing.id) ? 'white' : 'var(--black)',
                                    }}
                                >
                                    {ing.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
                                該当する食材が見つかりませんでした
                            </p>
                        </div>
                    )}
                </div>

                {/* フッター（確定ボタン + オプション追加コンテンツ） */}
                <div
                    className="flex-shrink-0 p-4 border-t space-y-2"
                    style={{ borderColor: 'var(--gray)' }}
                >
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIngredientIds.size === 0}
                        className="w-full py-3 rounded-lg font-bold text-white"
                        style={{
                            backgroundColor: selectedIngredientIds.size === 0 ? 'var(--gray)' : 'var(--main-color)',
                        }}
                    >
                        {confirmLabel}
                        {selectedIngredientIds.size > 0 && ` (${selectedIngredientIds.size}個)`}
                    </button>
                    {footerExtra}
                </div>
            </div>
        </div>
    );
}
