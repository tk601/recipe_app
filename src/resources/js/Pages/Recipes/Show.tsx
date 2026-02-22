import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Heart, Refrigerator as RefrigeratorIcon, X, Edit } from 'lucide-react';
import Footer from '@/Components/Mobile/Footer';

interface Recipe {
    id: number;
    recipe_name: string;
    recipe_image_url: string;
    recipe_category_id: number;
    recipe_category_name: string;
    serving_size: number;
    recommended_points: string | null;
    user_id: number;
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

interface FlashMessages {
    success?: string;
    error?: string;
}

interface Props {
    recipe: Recipe | null;
    ingredients: Ingredient[];
    instructions: Instruction[];
}

interface PageProps extends Props {
    auth: {
        user: any;
    };
    flash?: FlashMessages;
    [key: string]: any;
}

export default function RecipeShow({ recipe, ingredients, instructions }: Props) {
    // フラッシュメッセージを取得
    const page = usePage<PageProps>();
    const flash = page.props.flash;
    const currentUser = page.props.auth.user;

    // 冷蔵庫確認モーダルの表示状態
    const [showRefrigeratorModal, setShowRefrigeratorModal] = useState(false);

    // 選択された食材ID
    const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<number>>(new Set());

    // フラッシュメッセージの表示状態
    const [showFlash, setShowFlash] = useState(false);

    // 自分のレシピかどうかを判定
    const isOwner = recipe && currentUser && recipe.user_id === currentUser.id;

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
     * 前の画面に戻る
     */
    const handleBack = () => {
        // URLパラメータから遷移元を確認
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get('from');

        // プロフィール画面から来た場合はプロフィール画面に戻る
        if (from === 'profile') {
            router.visit(route('mobile.profile'));
        } else {
            // それ以外はレシピ一覧に戻る
            router.visit(route('recipes.index', { category: recipe.recipe_category_id }));
        }
    };

    /**
     * レシピ編集画面に遷移
     */
    const handleEdit = () => {
        router.visit(route('recipes.edit', recipe.id));
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

        // 在庫がある食材のみをフィルタリング
        const inStockIngredientIds = Array.from(selectedIngredientIds).filter(id => {
            const ingredient = ingredients.find(ing => ing.id === id);
            return ingredient?.in_stock === true;
        });

        if (inStockIngredientIds.length === 0) {
            alert('冷蔵庫に在庫のある食材を選択してください');
            return;
        }

        router.post(route('recipes.remove-from-refrigerator'), {
            ingredient_ids: inStockIngredientIds
        }, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                closeRefrigeratorModal();
            }
        });
    };

    /**
     * 買い物リストに追加
     */
    const handleMoveToShoppingList = () => {
        if (selectedIngredientIds.size === 0) {
            alert('食材を選択してください');
            return;
        }

        // 全ての選択された食材を買い物リストに追加
        const selectedIdsArray = Array.from(selectedIngredientIds);

        router.post(route('recipes.move-to-shopping-list'), {
            ingredient_ids: selectedIdsArray
        }, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                closeRefrigeratorModal();
            }
        });
    };

    // レシピが見つからない場合のメッセージ表示
    if (!recipe) {
        return (
            <div
                className="min-h-screen pb-20 md:pb-8"
                style={{ backgroundColor: 'var(--base-color)' }}
            >
                <Head title="レシピが見つかりません - ごはんどき" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
                        <div
                            className="text-5xl mb-4"
                        >
                            🍳
                        </div>
                        <h1
                            className="text-xl font-bold mb-2"
                            style={{ color: 'var(--black)' }}
                        >
                            お探しのレシピはありませんでした
                        </h1>
                        <p
                            className="text-sm mb-6"
                            style={{ color: 'var(--dark-gray)' }}
                        >
                            レシピが削除されたか、非公開に設定されている可能性があります。
                        </p>
                        <button
                            onClick={() => router.visit(route('recipes.index'))}
                            className="px-6 py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: 'var(--main-color)' }}
                        >
                            レシピ一覧に戻る
                        </button>
                    </div>
                </div>
                <Footer currentPage="recipe" />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-20 md:pb-8"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title={`${recipe.recipe_name} - ごはんどき`} />

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

            {/* レシピ画像ヘッダー */}
            <div className="relative w-full md:max-w-6xl md:mx-auto md:mt-8 md:rounded-xl md:overflow-hidden" style={{ height: '300px' }}>
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

                {/* 右上のボタン群 */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {/* 編集ボタン（自分のレシピの場合のみ表示） */}
                    {isOwner && (
                        <button
                            onClick={handleEdit}
                            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-white active:scale-95"
                        >
                            <Edit
                                className="w-5 h-5"
                                style={{ color: 'var(--main-color)' }}
                            />
                        </button>
                    )}

                    {/* いいねボタン */}
                    <button
                        onClick={handleLike}
                        className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md transition-all duration-200 hover:bg-white active:scale-95"
                    >
                        <Heart
                            className="w-6 h-6"
                            style={{
                                color: recipe.is_liked ? 'var(--main-color)' : 'var(--dark-gray)',
                                fill: recipe.is_liked ? 'var(--main-color)' : 'none'
                            }}
                        />
                    </button>
                </div>

                {/* グラデーションオーバーレイ */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            <main className="max-w-6xl mx-auto px-4">
                {/* レシピ名といいね数 */}
                <div className="bg-white rounded-t-3xl md:rounded-xl -mt-6 md:mt-6 relative z-10 px-6 py-5 shadow-sm">
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

                {/* PC画面では2カラム、スマホでは1カラム */}
                <div className="md:grid md:grid-cols-3 md:gap-6 mt-4">
                    {/* 左カラム: 材料 (PC: 1/3, スマホ: 100%) */}
                    <div className="md:col-span-1">
                        {/* 材料一覧 */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
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
                    </div>

                    {/* 右カラム: 調理手順とポイント (PC: 2/3, スマホ: 100%) */}
                    <div className="md:col-span-2 mt-4 md:mt-0">
                        {/* 調理手順 */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
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
                    </div>
                </div>
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
                                        onClick={() => toggleIngredientSelection(ingredient.id)}
                                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                                        style={{ borderColor: 'var(--gray)' }}
                                    >
                                        {/* チェックボックス */}
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIngredientIds.has(ingredient.id)}
                                                onChange={() => {}} // クリックイベントは親要素で処理
                                                className="w-5 h-5 rounded cursor-pointer appearance-none border-2 checked:border-0"
                                                style={{
                                                    borderColor: 'var(--gray)',
                                                    backgroundColor: selectedIngredientIds.has(ingredient.id) ? 'var(--main-color)' : 'white'
                                                }}
                                            />
                                            {/* チェックマーク */}
                                            {selectedIngredientIds.has(ingredient.id) && (
                                                <svg
                                                    className="absolute w-3 h-3 pointer-events-none"
                                                    fill="none"
                                                    stroke="white"
                                                    strokeWidth="3"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>

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
                                冷蔵庫から削除 {selectedIngredientIds.size > 0 && `(${Array.from(selectedIngredientIds).filter(id => ingredients.find(ing => ing.id === id)?.in_stock).length}個)`}
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
                                買い物リストに追加 {selectedIngredientIds.size > 0 && `(${selectedIngredientIds.size}個)`}
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
