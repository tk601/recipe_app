import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps, ShoppingList } from '@/types';
import { ShoppingCart, Trash2, Refrigerator } from 'lucide-react';
import Footer from '@/Components/Mobile/Footer';

interface ShoppingListsProps extends PageProps {
    shoppingLists: ShoppingList[];
}

const ShoppingLists = ({ shoppingLists }: ShoppingListsProps) => {
    // 選択された食材のIDを管理
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

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

    // 冷蔵庫確認画面への遷移
    const handleGoToRefrigerator = () => {
        router.visit(route('ingredients.index'));
    };

    // 選択した食材を削除
    const handleDelete = () => {
        if (selectedItems.length === 0) {
            return;
        }

        if (!confirm('選択した食材を買い物リストから削除しますか？')) {
            return;
        }

        router.delete(route('shopping-lists.destroy'), {
            data: { ids: selectedItems },
            onSuccess: () => {
                setSelectedItems([]);
            },
        });
    };

    // 選択した食材を冷蔵庫に保存
    const handleMoveToRefrigerator = () => {
        if (selectedItems.length === 0) {
            return;
        }

        if (!confirm('選択した食材を冷蔵庫に保存しますか？')) {
            return;
        }

        router.post(route('shopping-lists.move-to-refrigerator'), {
            ids: selectedItems,
        }, {
            onSuccess: () => {
                setSelectedItems([]);
            },
        });
    };

    return (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="買い物リスト - ごはんどき" />

            {/* ヘッダー */}
            <header
                className="bg-white shadow-sm border-b sticky top-0 z-10"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="py-4">
                        <div className="flex items-center justify-between">
                            {/* タイトル */}
                            <h1
                                className="text-xl font-bold"
                                style={{ color: 'var(--main-color)' }}
                            >
                                買い物リスト
                            </h1>

                            {/* 冷蔵庫確認ボタン */}
                            <button
                                onClick={handleGoToRefrigerator}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: 'var(--main-color)',
                                    color: 'white'
                                }}
                            >
                                <Refrigerator className="w-4 h-4" />
                                冷蔵庫確認
                            </button>
                        </div>
                    </div>
                </div>
            </header>

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
                                        accentColor: 'var(--main-color)'
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
                                                accentColor: 'var(--main-color)'
                                            }}
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleToggleItem(item.id)}
                                        />
                                        <div className="flex-1 ml-3">
                                            <h3
                                                className="font-semibold text-base"
                                                style={{ color: 'var(--black)' }}
                                            >
                                                {item.ingredient?.ingredient_name || '不明な食材'}
                                            </h3>
                                            {item.ingredient?.category && (
                                                <p
                                                    className="text-sm mt-0.5"
                                                    style={{ color: 'var(--dark-gray)' }}
                                                >
                                                    {item.ingredient.category.category_name}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* フローティングアクションボタン */}
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
                            <Refrigerator className="w-5 h-5" />
                            冷蔵庫に保存 ({selectedItems.length})
                        </button>
                    </div>
                </div>
            )}

            {/* フッター */}
            <Footer currentPage="shoppingLists" />
        </div>
    );
};

export default ShoppingLists;
