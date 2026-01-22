import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Heart, Refrigerator as RefrigeratorIcon } from 'lucide-react';
import Footer from '@/Components/Mobile/Footer';

interface Recipe {
    id: number;
    recipe_name: string;
    recipe_image_url: string;
    recipe_category_id: number;
    recipe_category_name: string;
    serving_size: number;
    recommended_points: string | null;
    likes_count: number;
    is_liked: boolean;
}

interface Ingredient {
    id: number;
    ingredient_name: string;
    quantity: number;
    unit: string;
    in_stock: boolean; // 冷蔵庫の在庫情報
}

interface Instruction {
    instruction_no: number;
    description: string;
    instruction_image_url: string | null;
}

interface Props {
    recipe: Recipe;
    ingredients: Ingredient[];
    instructions: Instruction[];
}

export default function RecipeShow({ recipe, ingredients, instructions }: Props) {
    // 冷蔵庫確認モーダルの表示状態
    const [showRefrigeratorModal, setShowRefrigeratorModal] = useState(false);

    // 選択された食材ID
    const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<number>>(new Set());
    /**
     * 前の画面に戻る
     */
    const handleBack = () => {
        router.visit(route('recipes.index', { category: recipe.recipe_category_id }));
    };

    /**
     * いいねボタンをクリック
     */
    const handleLike = () => {
        router.post(route('recipes.toggle-like'), {
            recipe_id: recipe.id
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    /**
     * 冷蔵庫確認モーダルを開く
     */
    const openRefrigeratorModal = () => {
        setShowRefrigeratorModal(true);
        setSelectedIngredientIds(new Set());
    };

    /**
     * 冷蔵庫確認モーダルを閉じる
     */
    const closeRefrigeratorModal = () => {
        setShowRefrigeratorModal(false);
        setSelectedIngredientIds(new Set());
    };

    /**
     * 食材の選択/選択解除
     */
    const toggleIngredientSelection = (ingredientId: number) => {
        const newSelection = new Set(selectedIngredientIds);
        if (newSelection.has(ingredientId)) {
            newSelection.delete(ingredientId);
        } else {
            newSelection.add(ingredientId);
        }
        setSelectedIngredientIds(newSelection);
    };

    /**
     * 冷蔵庫から削除
     */
    const handleRemoveFromRefrigerator = () => {
        if (selectedIngredientIds.size === 0) {
            alert('食材を選択してください');
            return;
        }

        if (!confirm('選択した食材を冷蔵庫から削除しますか？')) {
            return;
        }

        router.post(route('recipes.remove-from-refrigerator'), {
            ingredient_ids: Array.from(selectedIngredientIds)
        }, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                closeRefrigeratorModal();
            }
        });
    };

    /**
     * 買い物リストに移動
     */
    const handleMoveToShoppingList = () => {
        if (selectedIngredientIds.size === 0) {
            alert('食材を選択してください');
            return;
        }

        if (!confirm('選択した食材を買い物リストに移動しますか？')) {
            return;
        }

        router.post(route('recipes.move-to-shopping-list'), {
            ingredient_ids: Array.from(selectedIngredientIds)
        }, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                closeRefrigeratorModal();
            }
        });
    };

    return (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title={`${recipe.recipe_name} - ごはんどき`} />

            {/* レシピ画像ヘッダー */}
            <div className="relative w-full" style={{ height: '300px' }}>
                <img
                    src={recipe.recipe_image_url || '/images/no-image.png'}
                    alt={recipe.recipe_name}
                    className="w-full h-full object-cover"
                />

                {/* 戻るボタン */}
                <button
                    onClick={handleBack}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-white active:scale-95"
                >
                    <ArrowLeft
                        className="w-6 h-6"
                        style={{ color: 'var(--main-color)' }}
                    />
                </button>

                {/* いいねボタン */}
                <button
                    onClick={handleLike}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-white active:scale-95"
                >
                    <Heart
                        className="w-6 h-6"
                        style={{
                            color: recipe.is_liked ? 'var(--main-color)' : 'var(--dark-gray)',
                            fill: recipe.is_liked ? 'var(--main-color)' : 'none'
                        }}
                    />
                </button>

                {/* グラデーションオーバーレイ */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            <main className="max-w-7xl mx-auto px-4">
                {/* レシピ名といいね数 */}
                <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-6 py-5 shadow-sm">
                    <h1
                        className="text-2xl font-bold mb-2"
                        style={{ color: 'var(--black)' }}
                    >
                        {recipe.recipe_name}
                    </h1>
                    <div className="flex items-center justify-between">
                        <span
                            className="text-sm"
                            style={{ color: 'var(--dark-gray)' }}
                        >
                            {recipe.recipe_category_name} / {recipe.serving_size}人分
                        </span>
                        {recipe.likes_count > 0 && (
                            <div
                                className="flex items-center text-sm"
                                style={{ color: 'var(--dark-gray)' }}
                            >
                                <Heart className="w-4 h-4 mr-1" />
                                {recipe.likes_count}
                            </div>
                        )}
                    </div>
                </div>

                {/* 材料一覧 */}
                <div className="bg-white mt-4 rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--gray)' }}>
                        <h2
                            className="text-lg font-bold"
                            style={{ color: 'var(--main-color)' }}
                        >
                            材料
                        </h2>
                        <button
                            onClick={openRefrigeratorModal}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            style={{ backgroundColor: 'var(--main-color)', color: 'white' }}
                        >
                            <RefrigeratorIcon className="w-4 h-4" />
                            冷蔵庫を確認
                        </button>
                    </div>
                    <div className="space-y-3">
                        {ingredients.map((ingredient, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center py-2"
                            >
                                <span
                                    className="font-medium"
                                    style={{ color: 'var(--black)' }}
                                >
                                    {ingredient.ingredient_name}
                                </span>
                                <span
                                    className="text-sm"
                                    style={{ color: 'var(--dark-gray)' }}
                                >
                                    {ingredient.quantity} {ingredient.unit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 調理手順 */}
                <div className="bg-white mt-4 rounded-lg shadow-sm p-6">
                    <h2
                        className="text-lg font-bold mb-4 pb-2 border-b"
                        style={{
                            color: 'var(--main-color)',
                            borderColor: 'var(--gray)'
                        }}
                    >
                        調理手順
                    </h2>
                    <div className="space-y-4">
                        {instructions.map((instruction) => (
                            <div
                                key={instruction.instruction_no}
                                className="flex gap-4"
                            >
                                {/* ステップ番号 */}
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                    style={{ backgroundColor: 'var(--main-color)' }}
                                >
                                    {instruction.instruction_no}
                                </div>

                                {/* 手順の説明 */}
                                <div className="flex-1">
                                    <p
                                        className="leading-relaxed"
                                        style={{ color: 'var(--black)' }}
                                    >
                                        {instruction.description}
                                    </p>
                                    {instruction.instruction_image_url && (
                                        <img
                                            src={instruction.instruction_image_url}
                                            alt={`手順${instruction.instruction_no}`}
                                            className="mt-2 rounded-lg w-full max-w-sm"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 調理のポイント */}
                {recipe.recommended_points && (
                    <div className="bg-white mt-4 rounded-lg shadow-sm p-6 mb-4">
                        <h2
                            className="text-lg font-bold mb-4 pb-2 border-b"
                            style={{
                                color: 'var(--main-color)',
                                borderColor: 'var(--gray)'
                            }}
                        >
                            調理のポイント
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: 'var(--black)' }}
                        >
                            {recipe.recommended_points}
                        </p>
                    </div>
                )}
            </main>

            {/* 冷蔵庫確認モーダル */}
            {showRefrigeratorModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col">
                        {/* モーダルヘッダー */}
                        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--gray)' }}>
                            <h3 className="font-bold text-lg" style={{ color: 'var(--black)' }}>冷蔵庫を確認</h3>
                            <button onClick={closeRefrigeratorModal}>
                                <ArrowLeft className="w-6 h-6" style={{ color: 'var(--dark-gray)' }} />
                            </button>
                        </div>

                        {/* 食材リスト */}
                        <div className="overflow-y-auto flex-1 p-4">
                            <div className="space-y-2">
                                {ingredients.map((ingredient) => (
                                    <div
                                        key={ingredient.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg"
                                        style={{ borderColor: 'var(--gray)' }}
                                    >
                                        {/* チェックボックス */}
                                        <input
                                            type="checkbox"
                                            checked={selectedIngredientIds.has(ingredient.id)}
                                            onChange={() => toggleIngredientSelection(ingredient.id)}
                                            className="w-5 h-5 rounded cursor-pointer"
                                            style={{ accentColor: 'var(--main-color)' }}
                                        />

                                        {/* 食材情報 */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="font-medium"
                                                    style={{ color: 'var(--black)' }}
                                                >
                                                    {ingredient.ingredient_name}
                                                </span>
                                                {/* 在庫バッジ */}
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{
                                                        backgroundColor: ingredient.in_stock ? 'var(--main-color)' : 'var(--light-gray)',
                                                        color: ingredient.in_stock ? 'white' : 'var(--dark-gray)'
                                                    }}
                                                >
                                                    {ingredient.in_stock ? '在庫あり' : '在庫なし'}
                                                </span>
                                            </div>
                                            <span
                                                className="text-sm"
                                                style={{ color: 'var(--dark-gray)' }}
                                            >
                                                必要量: {ingredient.quantity} {ingredient.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--gray)' }}>
                            <button
                                onClick={handleRemoveFromRefrigerator}
                                disabled={selectedIngredientIds.size === 0}
                                className="w-full py-3 rounded-lg font-bold transition-opacity"
                                style={{
                                    backgroundColor: selectedIngredientIds.size === 0 ? 'var(--gray)' : '#ef4444',
                                    color: 'white',
                                    opacity: selectedIngredientIds.size === 0 ? 0.5 : 1
                                }}
                            >
                                冷蔵庫から削除 {selectedIngredientIds.size > 0 && `(${selectedIngredientIds.size}個)`}
                            </button>
                            <button
                                onClick={handleMoveToShoppingList}
                                disabled={selectedIngredientIds.size === 0}
                                className="w-full py-3 rounded-lg font-bold transition-opacity"
                                style={{
                                    backgroundColor: selectedIngredientIds.size === 0 ? 'var(--gray)' : 'var(--main-color)',
                                    color: 'white',
                                    opacity: selectedIngredientIds.size === 0 ? 0.5 : 1
                                }}
                            >
                                買い物リストに移動 {selectedIngredientIds.size > 0 && `(${selectedIngredientIds.size}個)`}
                            </button>
                            <button
                                onClick={closeRefrigeratorModal}
                                className="w-full py-3 text-sm"
                                style={{ color: 'var(--dark-gray)' }}
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* フッター */}
            <Footer currentPage="recipe" />
        </div>
    );
}
