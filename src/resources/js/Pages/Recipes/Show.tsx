import React from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Heart } from 'lucide-react';
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
                    <h2
                        className="text-lg font-bold mb-4 pb-2 border-b"
                        style={{
                            color: 'var(--main-color)',
                            borderColor: 'var(--gray)'
                        }}
                    >
                        材料
                    </h2>
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

            {/* フッター */}
            <Footer currentPage="recipe" />
        </div>
    );
}
