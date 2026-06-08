import { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps, ShoppingList } from '@/types';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import FloatingActionButton from '@/Components/FloatingActionButton';
import MobileLayout from '@/Layouts/MobileLayout';
import DesktopLayout from '@/Layouts/DesktopLayout';
import IngredientSelectModal from '@/Components/IngredientSelectModal';

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
    // PC/モバイルの判定（768px以上でPC表示）
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const checkScreenSize = () => setIsDesktop(window.innerWidth >= 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // 食材選択モーダルの表示状態
    const [showIngredientModal, setShowIngredientModal] = useState(false);

    // 自由入力項目
    const [customItem, setCustomItem] = useState('');

    // 自由入力ポップアップの表示状態
    const [showCustomItemModal, setShowCustomItemModal] = useState(false);

    // 自由入力バリデーションエラー
    const [customItemError, setCustomItemError] = useState('');

    // 削除確認モーダル（アイテム単体）
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

    // 購入済みアイテムの一括操作モーダル
    const [showPurchasedDeleteModal, setShowPurchasedDeleteModal] = useState(false);
    const [showPurchasedRefrigeratorModal, setShowPurchasedRefrigeratorModal] = useState(false);

    // カテゴリの開閉状態（デフォルトで全て開く）
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    // カテゴリの開閉をトグル
    const toggleCategory = (categoryName: string) => {
        const newCollapsed = new Set(collapsedCategories);
        if (newCollapsed.has(categoryName)) {
            newCollapsed.delete(categoryName);
        } else {
            newCollapsed.add(categoryName);
        }
        setCollapsedCategories(newCollapsed);
    };

    // 買い物リストをカテゴリごとにグループ化
    const groupedShoppingLists = useMemo(() => {
        const categoryMap = new Map<string, ShoppingList[]>();

        shoppingLists.forEach(item => {
            const categoryName = item.custom_item
                ? '自由入力'
                : (item.ingredient?.category?.category_name || 'その他');

            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, []);
            }
            categoryMap.get(categoryName)!.push(item);
        });

        return Array.from(categoryMap.entries()).map(([categoryName, items]) => ({
            categoryName,
            items,
        }));
    }, [shoppingLists]);

    // 購入進捗の計算
    const purchasedCount = shoppingLists.filter(item => item.purchased).length;
    const totalCount = shoppingLists.length;
    const progressPercent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

    /**
     * 購入済みフラグをトグル（非同期・画面リロードなし）
     */
    const togglePurchased = (id: number) => {
        router.patch(route('shopping-lists.toggle-purchased', id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    /**
     * アイテムを削除（確定）
     */
    const confirmDeleteItem = () => {
        if (deleteItemId === null) return;
        router.delete(route('shopping-lists.destroy'), {
            data: { ids: [deleteItemId] },
            onSuccess: () => {
                setDeleteItemId(null);
            },
        });
    };

    /**
     * 購入済みアイテムを一括削除（確定）
     */
    const confirmDeletePurchased = () => {
        const purchasedIds = shoppingLists.filter(item => item.purchased).map(item => item.id);
        router.delete(route('shopping-lists.destroy'), {
            data: { ids: purchasedIds },
            onSuccess: () => setShowPurchasedDeleteModal(false),
        });
    };

    /**
     * 購入済みアイテムを一括で冷蔵庫へ保存（確定）
     */
    const confirmMovePurchasedToRefrigerator = () => {
        const purchasedIds = shoppingLists.filter(item => item.purchased).map(item => item.id);
        router.post(route('shopping-lists.move-to-refrigerator'), {
            ids: purchasedIds,
        }, {
            onSuccess: () => setShowPurchasedRefrigeratorModal(false),
        });
    };

    /**
     * 食材選択モーダルを開く
     */
    const openIngredientModal = () => {
        setShowIngredientModal(true);
    };

    /**
     * 選択した食材を確定して買い物リストに追加
     */
    const handleConfirmIngredients = (selectedIds: Set<number>) => {
        if (selectedIds.size === 0) return;
        router.post(route('shopping-lists.store'), {
            ingredient_ids: Array.from(selectedIds),
        }, {
            onSuccess: () => {
                setShowIngredientModal(false);
                setCustomItem('');
            },
        });
    };

    /**
     * 自由入力ポップアップを開く
     */
    const openCustomItemModal = () => {
        setCustomItem('');
        setCustomItemError('');
        setShowCustomItemModal(true);
    };

    /**
     * 自由入力ポップアップを閉じる
     */
    const closeCustomItemModal = () => {
        setShowCustomItemModal(false);
        setCustomItem('');
        setCustomItemError('');
    };

    /**
     * 自由入力を保存する（バリデーション付き）
     */
    const confirmCustomItem = () => {
        const trimmed = customItem.trim();

        if (!trimmed) {
            setCustomItemError('入力してください');
            return;
        }

        if (trimmed.length > 50) {
            setCustomItemError('50文字以内で入力してください');
            return;
        }

        router.post(route('shopping-lists.store'), {
            custom_item: trimmed,
        }, {
            onSuccess: () => {
                closeCustomItemModal();
                setShowIngredientModal(false);
            },
        });
    };


    // PC時はDesktopLayout、モバイル時はMobileLayoutを使用
    const pageContent = (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="買い物リスト - ごはんどき" />

            {/* 買い物リストの内容 */}
            <main className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pb-4">
                {shoppingLists.length === 0 ? (
                    // 空の状態：PC/スマホで異なる画像を表示＋リスト追加ボタン
                    <div className="text-center py-8">
                        <img
                            src={isDesktop ? '/images/shopping_message_pc.png' : '/images/shopping_message_sp.png'}
                            alt="買い物リストは空です"
                            className="mx-auto max-w-full"
                        />
                        <button
                            onClick={openIngredientModal}
                            className="mt-6 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 mx-auto transition-all duration-200 hover:shadow-xl active:scale-95"
                            style={{ backgroundColor: 'var(--main-color)' }}
                        >
                            <span className="text-white font-bold text-sm">買い物リスト作成</span>
                            <Plus className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* 購入進捗バー */}
                        <div
                            className="bg-white rounded-lg shadow-sm border p-4"
                            style={{ borderColor: 'var(--gray)' }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium" style={{ color: 'var(--dark-gray)' }}>
                                    購入済み <span className="font-bold" style={{ color: 'var(--main-color)' }}>{purchasedCount}</span> / {totalCount}個
                                </span>
                                <span className="text-sm font-bold" style={{ color: 'var(--main-color)' }}>
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="w-full rounded-full h-2.5" style={{ backgroundColor: 'var(--light-gray)' }}>
                                <div
                                    className="h-2.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progressPercent}%`,
                                        backgroundColor: progressPercent === 100 ? '#22C55E' : 'var(--main-color)',
                                    }}
                                />
                            </div>

                            {/* 購入済みアイテムがある時のみ一括操作ボタンを表示 */}
                            {purchasedCount > 0 && (
                                <div className="flex gap-2 mt-3 justify-end">
                                    <button
                                        onClick={() => setShowPurchasedRefrigeratorModal(true)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95"
                                        style={{ borderColor: 'var(--main-color)', color: 'var(--main-color)', backgroundColor: 'white' }}
                                    >
                                        冷蔵庫へ保存
                                    </button>
                                    <button
                                        onClick={() => setShowPurchasedDeleteModal(true)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95"
                                        style={{ borderColor: '#EF4444', color: '#EF4444', backgroundColor: 'white' }}
                                    >
                                        削除
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* カテゴリ別アコーディオン表示 */}
                        {groupedShoppingLists.map(({ categoryName, items }) => {
                            const isCollapsed = collapsedCategories.has(categoryName);
                            const categoryPurchasedCount = items.filter(item => item.purchased).length;
                            return (
                                <div key={categoryName} className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: 'var(--gray)' }}>
                                    {/* カテゴリヘッダー（クリックで開閉） */}
                                    <button
                                        onClick={() => toggleCategory(categoryName)}
                                        className="w-full flex items-center justify-between px-4 py-3 font-semibold text-left"
                                        style={{ color: 'var(--black)', backgroundColor: 'var(--light-gray)' }}
                                    >
                                        <span>
                                            {categoryName}
                                            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--dark-gray)' }}>
                                                {categoryPurchasedCount}/{items.length}
                                            </span>
                                        </span>
                                        {isCollapsed
                                            ? <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--dark-gray)' }} />
                                            : <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--dark-gray)' }} />
                                        }
                                    </button>

                                    {/* アイテムリスト（開いている時のみ表示） */}
                                    {!isCollapsed && (
                                        <div className="divide-y" style={{ borderColor: 'var(--gray)' }}>
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center px-4 py-3 transition-all ${
                                                        item.purchased ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    {/* 購入チェックボックス */}
                                                    <label className="flex items-center flex-1 gap-3 cursor-pointer min-w-0">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-checkbox w-5 h-5 rounded flex-shrink-0"
                                                            checked={item.purchased}
                                                            onChange={() => togglePurchased(item.id)}
                                                        />
                                                        <span
                                                            className={`font-medium text-base truncate ${
                                                                item.purchased ? 'line-through' : ''
                                                            }`}
                                                            style={{ color: 'var(--black)' }}
                                                        >
                                                            {item.custom_item || item.ingredient?.ingredient_name || '不明な食材'}
                                                        </span>
                                                    </label>

                                                    {/* 在庫状態バッジ */}
                                                    {item.ingredients_id && (
                                                        <span
                                                            className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 mr-2"
                                                            style={{
                                                                backgroundColor: item.in_refrigerator ? 'var(--main-color)' : 'var(--light-gray)',
                                                                color: item.in_refrigerator ? 'white' : 'var(--dark-gray)'
                                                            }}
                                                        >
                                                            {item.in_refrigerator ? '在庫あり' : '在庫なし'}
                                                        </span>
                                                    )}

                                                    {/* 削除ボタン */}
                                                    <button
                                                        onClick={() => setDeleteItemId(item.id)}
                                                        className="flex-shrink-0 p-1.5 rounded-lg transition-all active:scale-95"
                                                        style={{ color: 'var(--dark-gray)' }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* 材料追加フローティングボタン（アイテムがある時 かつ モバイルのみ表示） */}
            {shoppingLists.length > 0 && !isDesktop && (
                <FloatingActionButton
                    label="追加"
                    onClick={openIngredientModal}
                    className="md:bottom-20 md:right-16"
                />
            )}

            {/* 材料選択モーダル */}
            <IngredientSelectModal
                isOpen={showIngredientModal}
                onClose={() => { setShowIngredientModal(false); setCustomItem(''); }}
                ingredients={ingredients}
                ingredientCategories={ingredientCategories}
                onConfirm={handleConfirmIngredients}
                confirmLabel="買い物リストに追加"
                footerExtra={
                    <button
                        onClick={openCustomItemModal}
                        className="w-full py-3 rounded-lg font-bold border"
                        style={{ borderColor: 'var(--sub-color)', color: 'var(--sub-color)', backgroundColor: 'white' }}
                    >
                        自由入力
                    </button>
                }
            />

            {/* 自由入力ポップアップ */}
            {showCustomItemModal && (
                <div className="fixed inset-0 bg-black/50 z-[10002] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            自由入力
                        </h3>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={customItem}
                                onChange={(e) => {
                                    setCustomItem(e.target.value);
                                    setCustomItemError('');
                                }}
                                placeholder="例: チョコレート、お菓子など"
                                maxLength={50}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: customItemError ? '#EF4444' : 'var(--gray)',
                                    '--tw-ring-color': 'var(--sub-color)'
                                } as React.CSSProperties}
                                autoFocus
                            />
                            <div className="flex justify-between items-center mt-1">
                                {customItemError ? (
                                    <p className="text-xs" style={{ color: '#EF4444' }}>{customItemError}</p>
                                ) : (
                                    <span />
                                )}
                                <p className="text-xs ml-auto" style={{ color: customItem.length > 50 ? '#EF4444' : 'var(--dark-gray)' }}>
                                    {customItem.length} / 50
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={confirmCustomItem}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: 'var(--main-color)' }}
                            >
                                買い物リストに追加
                            </button>
                            <button
                                onClick={closeCustomItemModal}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 購入済み一括削除確認モーダル */}
            {showPurchasedDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            購入済みを削除
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--dark-gray)' }}>
                            購入済みの{purchasedCount}個のアイテムを買い物リストから削除しますか？
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={confirmDeletePurchased}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: '#EF4444' }}
                            >
                                削除する
                            </button>
                            <button
                                onClick={() => setShowPurchasedDeleteModal(false)}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 購入済み一括冷蔵庫保存確認モーダル */}
            {showPurchasedRefrigeratorModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            冷蔵庫へ保存
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--dark-gray)' }}>
                            購入済みの{purchasedCount}個のアイテムを冷蔵庫に保存しますか？
                            <br />
                            <span className="text-xs">※自由入力のアイテムは保存されません</span>
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={confirmMovePurchasedToRefrigerator}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: 'var(--main-color)' }}
                            >
                                保存する
                            </button>
                            <button
                                onClick={() => setShowPurchasedRefrigeratorModal(false)}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 削除確認モーダル（アイテム単体） */}
            {deleteItemId !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            削除の確認
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--dark-gray)' }}>
                            このアイテムを買い物リストから削除しますか？
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={confirmDeleteItem}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: '#EF4444' }}
                            >
                                削除する
                            </button>
                            <button
                                onClick={() => setDeleteItemId(null)}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

    // PC時はDesktopLayout（検索なし・作成ボタンあり）、モバイル時はMobileLayout
    return isDesktop ? (
        <DesktopLayout currentPage="shoppingLists" onCreateClick={openIngredientModal}>
            {pageContent}
        </DesktopLayout>
    ) : (
        <MobileLayout currentPage="shoppingLists">
            {pageContent}
        </MobileLayout>
    );
};

export default ShoppingLists;
