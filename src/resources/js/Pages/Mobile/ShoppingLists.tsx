import { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, router } from '@inertiajs/react';
import { PageProps, ShoppingList } from '@/types';
import { ShoppingCart, Trash2, Plus, X, Search } from 'lucide-react';
import Header from '@/Components/Mobile/Header';
import Footer from '@/Components/Mobile/Footer';

// 食材の型定義
interface Ingredient {
    id: number;
    name: string;
    ingredient_category_id: number;
}

// 食材カテゴリの型定義
interface IngredientCategory {
    id: number;
    name: string;
}

interface ShoppingListsProps extends PageProps {
    shoppingLists: ShoppingList[];
    ingredients: Ingredient[];
    ingredientCategories: IngredientCategory[];
}

const ShoppingLists = ({ shoppingLists, ingredients, ingredientCategories }: ShoppingListsProps) => {
    // 選択された食材のIDを管理
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    // 食材選択モーダルの表示状態
    const [showIngredientModal, setShowIngredientModal] = useState(false);

    // 選択中の食材カテゴリ
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // 一時的に選択された食材ID
    const [tempSelectedIngredients, setTempSelectedIngredients] = useState<Set<number>>(new Set());

    // 食材検索キーワード
    const [ingredientSearchKeyword, setIngredientSearchKeyword] = useState('');

    // 自由入力項目
    const [customItem, setCustomItem] = useState('');

    // 検索候補の表示状態
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const searchInputRef = useRef<HTMLDivElement>(null);

    // 削除確認モーダルの表示状態
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 冷蔵庫保存確認モーダルの表示状態とメッセージ
    const [showRefrigeratorModal, setShowRefrigeratorModal] = useState(false);
    const [refrigeratorModalData, setRefrigeratorModalData] = useState({
        itemsToSave: 0,
        alreadyInRefrigerator: 0,
        customItems: 0
    });

    // 全選択/全解除のトグル
    const handleToggleAll = () => {
        if (selectedItems.length === shoppingLists.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(shoppingLists.map(item => item.id));
        }
    };

    // 個別の選択/解除のトグル
    const handleToggleItem = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };


    // 選択した食材を削除（モーダルを開く）
    const handleDelete = () => {
        if (selectedItems.length === 0) {
            return;
        }
        setShowDeleteModal(true);
    };

    // 削除を確定
    const confirmDelete = () => {
        router.delete(route('shopping-lists.destroy'), {
            data: { ids: selectedItems },
            onSuccess: () => {
                setSelectedItems([]);
                setShowDeleteModal(false);
            },
        });
    };

    // 選択した食材を冷蔵庫に保存（モーダルを開く）
    const handleMoveToRefrigerator = () => {
        if (selectedItems.length === 0) {
            return;
        }

        // 選択されたアイテムの情報を取得
        const selectedItemsData = shoppingLists.filter(item => selectedItems.includes(item.id));

        // 冷蔵庫に保存できるアイテム（ingredients_idがあり、かつ冷蔵庫にないもの）をカウント
        const itemsToSave = selectedItemsData.filter(item => item.ingredients_id && !item.in_refrigerator);

        // 自由入力アイテムの数
        const customItemsCount = selectedItemsData.filter(item => item.custom_item).length;

        // 既に冷蔵庫にあるアイテムの数
        const alreadyInRefrigeratorCount = selectedItemsData.filter(item => item.ingredients_id && item.in_refrigerator).length;

        // モーダルデータを設定
        setRefrigeratorModalData({
            itemsToSave: itemsToSave.length,
            alreadyInRefrigerator: alreadyInRefrigeratorCount,
            customItems: customItemsCount
        });

        setShowRefrigeratorModal(true);
    };

    // 冷蔵庫保存を確定
    const confirmMoveToRefrigerator = () => {
        router.post(route('shopping-lists.move-to-refrigerator'), {
            ids: selectedItems,
        }, {
            onSuccess: () => {
                setSelectedItems([]);
                setShowRefrigeratorModal(false);
            },
        });
    };

    /**
     * 食材選択モーダルを開く
     */
    const openIngredientModal = () => {
        setShowIngredientModal(true);
        setSelectedCategoryId(ingredientCategories[0]?.id || null);
    };

    /**
     * 食材選択モーダルを閉じる
     */
    const closeIngredientModal = () => {
        setShowIngredientModal(false);
        setTempSelectedIngredients(new Set());
        setIngredientSearchKeyword('');
        setShowSearchSuggestions(false);
        setCustomItem('');
    };

    /**
     * 食材の選択/選択解除
     */
    const toggleIngredientSelection = (ingredientId: number) => {
        const newSelection = new Set(tempSelectedIngredients);
        if (newSelection.has(ingredientId)) {
            newSelection.delete(ingredientId);
        } else {
            newSelection.add(ingredientId);
        }
        setTempSelectedIngredients(newSelection);
    };

    /**
     * 選択した食材を確定して買い物リストに追加
     */
    const confirmIngredientSelection = () => {
        // 食材も自由入力も何も選択されていない場合は何もしない
        if (tempSelectedIngredients.size === 0 && !customItem.trim()) {
            return;
        }

        router.post(route('shopping-lists.store'), {
            ingredient_ids: tempSelectedIngredients.size > 0 ? Array.from(tempSelectedIngredients) : undefined,
            custom_item: customItem.trim() || undefined,
        }, {
            onSuccess: () => {
                closeIngredientModal();
            },
        });
    };

    /**
     * 検索候補をフィルタリング（検索キーワードのみで絞り込み）
     */
    const searchSuggestions = useMemo(() => {
        if (!ingredientSearchKeyword.trim()) return [];

        return ingredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(ingredientSearchKeyword.toLowerCase())
        ).slice(0, 10); // 最大10件まで表示
    }, [ingredientSearchKeyword, ingredients]);

    /**
     * 検索入力の変更処理
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setIngredientSearchKeyword(value);

        // 検索候補を表示
        if (value.trim()) {
            setShowSearchSuggestions(true);
        } else {
            setShowSearchSuggestions(false);
        }
    };

    /**
     * 検索候補から食材を選択
     */
    const handleSelectFromSuggestion = (ingredientId: number, categoryId: number) => {
        // 検索候補を非表示
        setShowSearchSuggestions(false);
        setIngredientSearchKeyword('');

        // カテゴリを変更
        setSelectedCategoryId(categoryId);

        // 食材を選択状態にする
        const newSelection = new Set(tempSelectedIngredients);
        newSelection.add(ingredientId);
        setTempSelectedIngredients(newSelection);
    };

    // カテゴリでフィルタリングされた食材
    const filteredIngredients = ingredients.filter(ing => {
        // カテゴリフィルター
        const categoryMatch = selectedCategoryId
            ? ing.ingredient_category_id === selectedCategoryId
            : true;

        return categoryMatch;
    });

    /**
     * 検索候補の外側をクリックしたら閉じる
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // 検索候補のボタンをクリックした場合は何もしない
            if (target.closest('[data-suggestion-item]')) {
                return;
            }

            // 検索コンテナ外をクリックした場合は候補を閉じる
            if (searchInputRef.current && !searchInputRef.current.contains(target)) {
                setShowSearchSuggestions(false);
            }
        };

        if (showIngredientModal) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showIngredientModal]);

    return (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="買い物リスト - ごはんどき" />

            {/* ヘッダー */}
            <Header currentPage="shoppingLists" />

            {/* 買い物リストの内容 */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                {shoppingLists.length === 0 ? (
                    // 空の状態
                    <div className="text-center py-16">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--light-gray)' }}
                        >
                            <ShoppingCart
                                className="w-8 h-8"
                                style={{ color: 'var(--dark-gray)' }}
                            />
                        </div>
                        <h3
                            className="text-lg font-medium mb-2"
                            style={{ color: 'var(--black)' }}
                        >
                            買い物リストは空です
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--dark-gray)' }}
                        >
                            レシピから食材を追加してみましょう
                        </p>
                    </div>
                ) : (
                    <>
                        {/* 全選択チェックボックス */}
                        <div
                            className="bg-white rounded-lg shadow-sm border p-4 mb-4"
                            style={{ borderColor: 'var(--gray)' }}
                        >
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded"
                                    style={{
                                        accentColor: 'var(--main-color)', // チェックマークは自動的に白色になります
                                    }}
                                    checked={selectedItems.length === shoppingLists.length && shoppingLists.length > 0}
                                    onChange={handleToggleAll}
                                />
                                <span
                                    className="font-semibold"
                                    style={{ color: 'var(--black)' }}
                                >
                                    全選択 ({selectedItems.length}/{shoppingLists.length})
                                </span>
                            </label>
                        </div>

                        {/* 食材リスト */}
                        <div className="space-y-2">
                            {shoppingLists.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-lg shadow-sm border transition-all ${
                                        selectedItems.includes(item.id)
                                            ? 'ring-2 ring-offset-2'
                                            : ''
                                    }`}
                                    style={{
                                        borderColor: selectedItems.includes(item.id) ? 'var(--main-color)' : 'var(--gray)',
                                        '--tw-ring-color': 'var(--sub-color)'
                                    } as React.CSSProperties}
                                >
                                    <label className="flex items-center p-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded flex-shrink-0"
                                            style={{
                                                accentColor: 'var(--main-color)', // チェックマークは自動的に白色になります
                                            }}
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleToggleItem(item.id)}
                                        />
                                        <div className="flex-1 ml-3">
                                            <h3
                                                className="font-semibold text-base"
                                                style={{ color: 'var(--black)' }}
                                            >
                                                {item.custom_item || item.ingredient?.ingredient_name || '不明な食材'}
                                            </h3>
                                            {!item.custom_item && item.ingredient?.category && (
                                                <p
                                                    className="text-sm mt-0.5"
                                                    style={{ color: 'var(--dark-gray)' }}
                                                >
                                                    {item.ingredient.category.category_name}
                                                </p>
                                            )}
                                            {item.custom_item && (
                                                <p
                                                    className="text-sm mt-0.5"
                                                    style={{ color: 'var(--dark-gray)' }}
                                                >
                                                    自由入力
                                                </p>
                                            )}
                                        </div>

                                        {/* 冷蔵庫で管理できる材料の場合、在庫状態を表示 */}
                                        {item.ingredients_id && (
                                            <div className="flex-shrink-0">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        item.in_refrigerator ? 'text-white' : ''
                                                    }`}
                                                    style={{
                                                        backgroundColor: item.in_refrigerator ? 'var(--main-color)' : 'var(--light-gray)',
                                                        color: item.in_refrigerator ? 'white' : 'var(--dark-gray)'
                                                    }}
                                                >
                                                    {item.in_refrigerator ? '在庫あり' : '在庫なし'}
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* 材料追加フローティングボタン */}
            {selectedItems.length === 0 && (
                <button
                    onClick={openIngredientModal}
                    className="fixed right-4 shadow-lg rounded-full w-14 h-14 flex items-center justify-center transition-all active:scale-95"
                    style={{
                        bottom: '88px',
                        backgroundColor: 'var(--main-color)',
                        color: 'white',
                    }}
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}

            {/* 選択時のアクションボタン */}
            {selectedItems.length > 0 && (
                <div
                    className="fixed left-0 right-0 p-4 shadow-lg"
                    style={{
                        bottom: '72px', // フッターの高さ分上に配置
                        backgroundColor: 'var(--white)',
                        borderTop: '1px solid var(--gray)'
                    }}
                >
                    <div className="max-w-7xl mx-auto flex gap-2">
                        {/* 削除ボタン */}
                        <button
                            onClick={handleDelete}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-95"
                            style={{
                                backgroundColor: '#EF4444',
                                color: 'white'
                            }}
                        >
                            <Trash2 className="w-5 h-5" />
                            削除 ({selectedItems.length})
                        </button>

                        {/* 冷蔵庫に保存ボタン */}
                        <button
                            onClick={handleMoveToRefrigerator}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-95"
                            style={{
                                backgroundColor: 'var(--main-color)',
                                color: 'white'
                            }}
                        >
                            冷蔵庫に保存 ({selectedItems.length})
                        </button>
                    </div>
                </div>
            )}

            {/* 材料選択モーダル */}
            {showIngredientModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden">
                        {/* モーダルヘッダー */}
                        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--gray)' }}>
                            <h3 className="font-bold" style={{ color: 'var(--black)' }}>材料を選択</h3>
                            <button onClick={closeIngredientModal}>
                                <X className="w-6 h-6" style={{ color: 'var(--dark-gray)' }} />
                            </button>
                        </div>

                        {/* 検索ボックスと自由入力欄 */}
                        <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--gray)' }}>
                            {/* 食材検索 */}
                            <div className="relative" ref={searchInputRef}>
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--dark-gray)' }}
                                />
                                <input
                                    type="text"
                                    value={ingredientSearchKeyword}
                                    onChange={handleSearchChange}
                                    placeholder="食材を検索..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'var(--gray)',
                                        '--tw-ring-color': 'var(--main-color)'
                                    } as React.CSSProperties}
                                />
                            </div>

                            {/* 自由入力欄 */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={customItem}
                                    onChange={(e) => setCustomItem(e.target.value)}
                                    placeholder="または自由に入力（例: チョコレート、お菓子など）"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'var(--gray)',
                                        '--tw-ring-color': 'var(--sub-color)'
                                    } as React.CSSProperties}
                                />
                            </div>
                        </div>

                            {/* 検索候補のドロップダウン */}
                            {showSearchSuggestions && searchSuggestions.length > 0 && searchInputRef.current && createPortal(
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
                                    {searchSuggestions.map((ingredient) => {
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
                                                        {category?.name}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`px-2 py-1 rounded text-xs ${
                                                        tempSelectedIngredients.has(ingredient.id) ? 'text-white' : ''
                                                    }`}
                                                    style={{
                                                        backgroundColor: tempSelectedIngredients.has(ingredient.id) ? 'var(--main-color)' : 'var(--light-gray)',
                                                        color: tempSelectedIngredients.has(ingredient.id) ? 'white' : 'var(--dark-gray)'
                                                    }}
                                                >
                                                    {tempSelectedIngredients.has(ingredient.id) ? '選択中' : '未選択'}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>,
                                document.body
                            )}

                        {/* カテゴリタブ */}
                        <div className="flex overflow-x-auto p-2 border-b" style={{ borderColor: 'var(--gray)' }}>
                            {ingredientCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mr-2 ${
                                        selectedCategoryId === cat.id ? '' : 'opacity-60'
                                    }`}
                                    style={{
                                        backgroundColor: selectedCategoryId === cat.id ? 'var(--main-color)' : 'var(--light-gray)',
                                        color: selectedCategoryId === cat.id ? 'white' : 'var(--dark-gray)'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* 食材リスト */}
                        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 220px)' }}>
                            {filteredIngredients.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredIngredients.map(ing => (
                                        <button
                                            key={ing.id}
                                            onClick={() => toggleIngredientSelection(ing.id)}
                                            className={`p-3 rounded-lg border text-sm transition-all ${
                                                tempSelectedIngredients.has(ing.id) ? 'font-bold' : ''
                                            }`}
                                            style={{
                                                borderColor: tempSelectedIngredients.has(ing.id) ? 'var(--main-color)' : 'var(--gray)',
                                                backgroundColor: tempSelectedIngredients.has(ing.id) ? 'var(--main-color)' : 'white',
                                                color: tempSelectedIngredients.has(ing.id) ? 'white' : 'var(--black)'
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

                        {/* 確定ボタン */}
                        <div className="p-4 border-t" style={{ borderColor: 'var(--gray)' }}>
                            <button
                                onClick={confirmIngredientSelection}
                                disabled={tempSelectedIngredients.size === 0 && !customItem.trim()}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: (tempSelectedIngredients.size === 0 && !customItem.trim()) ? 'var(--gray)' : 'var(--main-color)' }}
                            >
                                買い物リストに追加
                                {tempSelectedIngredients.size > 0 && ` (${tempSelectedIngredients.size}個)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 削除確認モーダル */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            削除の確認
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--dark-gray)' }}>
                            選択した{selectedItems.length}個のアイテムを買い物リストから削除しますか？
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: '#EF4444' }}
                            >
                                削除する
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 冷蔵庫保存確認モーダル */}
            {showRefrigeratorModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            冷蔵庫に保存しますか？
                        </h3>
                        <div className="text-sm mb-6 space-y-2" style={{ color: 'var(--dark-gray)' }}>
                            {refrigeratorModalData.itemsToSave > 0 && (
                                <p>
                                    <span className="font-medium" style={{ color: 'var(--main-color)' }}>
                                        在庫なし {refrigeratorModalData.itemsToSave}個
                                    </span>
                                    を冷蔵庫に保存します
                                </p>
                            )}
                            {refrigeratorModalData.alreadyInRefrigerator > 0 && (
                                <p className="text-xs">
                                    （{refrigeratorModalData.alreadyInRefrigerator}個は既に冷蔵庫にあります）
                                </p>
                            )}
                            {refrigeratorModalData.customItems > 0 && (
                                <p className="text-xs">
                                    （自由入力の{refrigeratorModalData.customItems}個は冷蔵庫に保存できません）
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={confirmMoveToRefrigerator}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: 'var(--main-color)' }}
                            >
                                保存する
                            </button>
                            <button
                                onClick={() => setShowRefrigeratorModal(false)}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* フッター */}
            <Footer currentPage="shoppingLists" />
        </div>
    );
};

export default ShoppingLists;
