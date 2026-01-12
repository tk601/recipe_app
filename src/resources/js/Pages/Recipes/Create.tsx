import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
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

// 選択された食材の型定義
interface SelectedIngredient {
    ingredient_id: number;
    ingredient_name: string;
    quantity: string;
    unit: string;
}

// 調理手順の型定義
interface Instruction {
    instruction_no: number;
    description: string;
    image: File | null;
    image_preview: string | null;
}

// フォームデータの型定義
interface RecipeFormData {
    recipe_name: string;
    recipe_category_id: string;
    serving_size: string;
    recommended_points: string;
    recipe_image: File | null;
    ingredients: SelectedIngredient[];
    instructions: Instruction[];
    publish_flg: boolean;
    [key: string]: any; // Inertia.jsのuseFormが要求するインデックスシグネチャ
}

interface Props {
    ingredients: Ingredient[];
    ingredientCategories: IngredientCategory[];
    recipeCategories: { id: number; recipe_category_name: string }[];
}

export default function RecipeCreate({ ingredients, ingredientCategories, recipeCategories }: Props) {
    // フォームデータの管理
    const { data, setData, post, processing, errors } = useForm<RecipeFormData>({
        recipe_name: '',
        recipe_category_id: '',
        serving_size: '2',
        recommended_points: '',
        recipe_image: null,
        ingredients: [],
        instructions: [],
        publish_flg: false,
    });

    // 画像プレビュー
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // 食材選択モーダルの表示状態
    const [showIngredientModal, setShowIngredientModal] = useState(false);

    // 選択中の食材カテゴリ
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // 一時的に選択された食材ID
    const [tempSelectedIngredients, setTempSelectedIngredients] = useState<Set<number>>(new Set());

    // 公開確認モーダルの表示状態
    const [showPublishModal, setShowPublishModal] = useState(false);

    /**
     * 戻るボタン
     */
    const handleBack = () => {
        router.visit(route('recipes.index'));
    };

    /**
     * メイン画像の選択
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('recipe_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
     * 選択した食材を確定
     */
    const confirmIngredientSelection = () => {
        const newIngredients = Array.from(tempSelectedIngredients).map(id => {
            const ingredient = ingredients.find(ing => ing.id === id);
            return {
                ingredient_id: id,
                ingredient_name: ingredient?.name || '',
                quantity: '',
                unit: '',
            };
        });

        setData('ingredients', [...data.ingredients, ...newIngredients]);
        closeIngredientModal();
    };

    /**
     * 食材を削除
     */
    const removeIngredient = (index: number) => {
        const newIngredients = data.ingredients.filter((_, i) => i !== index);
        setData('ingredients', newIngredients);
    };

    /**
     * 食材の数量・単位を更新
     */
    const updateIngredient = (index: number, field: 'quantity' | 'unit', value: string) => {
        const newIngredients = [...data.ingredients];
        newIngredients[index][field] = value;
        setData('ingredients', newIngredients);
    };

    /**
     * 手順を追加
     */
    const addInstruction = () => {
        const newInstructions = [...data.instructions];
        newInstructions.push({
            instruction_no: newInstructions.length + 1,
            description: '',
            image: null,
            image_preview: null,
        });
        setData('instructions', newInstructions);
    };

    /**
     * 手順を削除
     */
    const removeInstruction = (index: number) => {
        const newInstructions = data.instructions.filter((_, i) => i !== index);
        // instruction_noを振り直す
        newInstructions.forEach((inst, i) => {
            inst.instruction_no = i + 1;
        });
        setData('instructions', newInstructions);
    };

    /**
     * 手順の説明を更新
     */
    const updateInstructionDescription = (index: number, value: string) => {
        const newInstructions = [...data.instructions];
        newInstructions[index].description = value;
        setData('instructions', newInstructions);
    };

    /**
     * 手順の画像を更新
     */
    const updateInstructionImage = (index: number, file: File | null) => {
        const newInstructions = [...data.instructions];
        newInstructions[index].image = file;

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                newInstructions[index].image_preview = reader.result as string;
                setData('instructions', [...newInstructions]);
            };
            reader.readAsDataURL(file);
        } else {
            newInstructions[index].image_preview = null;
            setData('instructions', newInstructions);
        }
    };

    /**
     * 保存ボタンクリック
     */
    const handleSave = () => {
        // バリデーション
        if (!data.recipe_name) {
            alert('レシピ名を入力してください');
            return;
        }
        if (!data.recipe_category_id) {
            alert('カテゴリを選択してください');
            return;
        }
        if (data.ingredients.length === 0) {
            alert('材料を追加してください');
            return;
        }
        if (data.instructions.length === 0) {
            alert('調理手順を追加してください');
            return;
        }

        // 公開確認モーダルを表示
        setShowPublishModal(true);
    };

    /**
     * 公開設定を決定して保存
     */
    const handleSubmit = (publish: boolean) => {
        setData('publish_flg', publish);

        // FormDataを作成
        const formData = new FormData();

        // CSRFトークンを追加
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            formData.append('_token', csrfToken);
        }

        formData.append('recipe_name', data.recipe_name);
        formData.append('recipe_category_id', data.recipe_category_id);
        formData.append('serving_size', data.serving_size);
        formData.append('recommended_points', data.recommended_points);
        formData.append('publish_flg', publish ? '1' : '0');

        if (data.recipe_image) {
            formData.append('recipe_image', data.recipe_image);
        }

        // 食材データ
        data.ingredients.forEach((ing, index) => {
            formData.append(`ingredients[${index}][ingredient_id]`, ing.ingredient_id.toString());
            formData.append(`ingredients[${index}][quantity]`, ing.quantity);
            formData.append(`ingredients[${index}][unit]`, ing.unit);
        });

        // 手順データ
        data.instructions.forEach((inst, index) => {
            formData.append(`instructions[${index}][instruction_no]`, inst.instruction_no.toString());
            formData.append(`instructions[${index}][description]`, inst.description);
            if (inst.image) {
                formData.append(`instructions[${index}][image]`, inst.image);
            }
        });

        // 保存処理
        router.post(route('recipes.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                router.visit(route('recipes.index'));
            },
        });
    };

    // カテゴリでフィルタリングされた食材
    const filteredIngredients = selectedCategoryId
        ? ingredients.filter(ing => ing.ingredient_category_id === selectedCategoryId)
        : ingredients;

    return (
        <div
            className="min-h-screen pb-20"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="レシピ作成 - ごはんどき" />

            {/* ヘッダー */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="py-3 flex items-center">
                        <button
                            onClick={handleBack}
                            className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft
                                className="w-5 h-5"
                                style={{ color: 'var(--main-color)' }}
                            />
                        </button>
                        <h1
                            className="text-xl font-bold"
                            style={{ color: 'var(--main-color)' }}
                        >
                            レシピ作成
                        </h1>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto px-4 py-4">
                <div className="space-y-6">
                    {/* メイン画像 */}
                    <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--black)' }}>
                            レシピ画像
                        </label>
                        <div
                            className="relative w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
                            style={{ borderColor: 'var(--gray)' }}
                            onClick={() => document.getElementById('recipe-image-input')?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--dark-gray)' }} />
                                    <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
                                        画像をアップロード
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            id="recipe-image-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* レシピ名 */}
                    <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--black)' }}>
                            レシピ名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.recipe_name}
                            onChange={(e) => setData('recipe_name', e.target.value)}
                            placeholder="例: 絶品！ガパオライス"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: 'var(--gray)',
                                '--tw-ring-color': 'var(--main-color)'
                            } as React.CSSProperties}
                        />
                    </div>

                    {/* カテゴリと人数 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--black)' }}>
                                カテゴリ <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.recipe_category_id}
                                onChange={(e) => setData('recipe_category_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: 'var(--gray)',
                                    '--tw-ring-color': 'var(--main-color)'
                                } as React.CSSProperties}
                            >
                                <option value="">選択してください</option>
                                {recipeCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.recipe_category_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--black)' }}>
                                人数
                            </label>
                            <select
                                value={data.serving_size}
                                onChange={(e) => setData('serving_size', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: 'var(--gray)',
                                    '--tw-ring-color': 'var(--main-color)'
                                } as React.CSSProperties}
                            >
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <option key={num} value={num}>{num}人前</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 材料 */}
                    <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--black)' }}>
                            材料 <span className="text-red-500">*</span>
                        </label>

                        {data.ingredients.length > 0 ? (
                            <div className="space-y-2 mb-3">
                                {data.ingredients.map((ing, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded" style={{ borderColor: 'var(--gray)' }}>
                                        <span className="flex-1 text-sm" style={{ color: 'var(--black)' }}>
                                            {ing.ingredient_name}
                                        </span>
                                        <input
                                            type="text"
                                            value={ing.quantity}
                                            onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                                            placeholder="数量"
                                            className="w-20 px-2 py-1 border rounded text-sm"
                                            style={{ borderColor: 'var(--gray)' }}
                                        />
                                        <input
                                            type="text"
                                            value={ing.unit}
                                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                            placeholder="単位"
                                            className="w-16 px-2 py-1 border rounded text-sm"
                                            style={{ borderColor: 'var(--gray)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="p-1"
                                        >
                                            <X className="w-4 h-4" style={{ color: 'var(--dark-gray)' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4 mb-3" style={{ color: 'var(--dark-gray)' }}>
                                材料を追加してください
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={openIngredientModal}
                            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            style={{ backgroundColor: 'var(--main-color)', color: 'white' }}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            材料を追加
                        </button>
                    </div>

                    {/* 調理手順 */}
                    <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                        <label className="block text-sm font-bold mb-3" style={{ color: 'var(--black)' }}>
                            調理手順 <span className="text-red-500">*</span>
                        </label>

                        {data.instructions.length > 0 ? (
                            <div className="space-y-4 mb-3">
                                {data.instructions.map((inst, index) => (
                                    <div key={index} className="border rounded-lg p-3" style={{ borderColor: 'var(--gray)' }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm" style={{ color: 'var(--main-color)' }}>
                                                手順 {inst.instruction_no}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeInstruction(index)}
                                                className="p-1"
                                            >
                                                <X className="w-4 h-4" style={{ color: 'var(--dark-gray)' }} />
                                            </button>
                                        </div>

                                        <textarea
                                            value={inst.description}
                                            onChange={(e) => updateInstructionDescription(index, e.target.value)}
                                            placeholder="手順の説明を入力"
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 text-sm"
                                            style={{
                                                borderColor: 'var(--gray)',
                                                '--tw-ring-color': 'var(--main-color)'
                                            } as React.CSSProperties}
                                        />

                                        <div
                                            className="relative w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
                                            style={{ borderColor: 'var(--gray)' }}
                                            onClick={() => document.getElementById(`instruction-image-${index}`)?.click()}
                                        >
                                            {inst.image_preview ? (
                                                <img src={inst.image_preview} alt={`手順${inst.instruction_no}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-8 h-8 mx-auto mb-1" style={{ color: 'var(--dark-gray)' }} />
                                                    <p className="text-xs" style={{ color: 'var(--dark-gray)' }}>
                                                        画像をアップロード（任意）
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id={`instruction-image-${index}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => updateInstructionImage(index, e.target.files?.[0] || null)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4 mb-3" style={{ color: 'var(--dark-gray)' }}>
                                手順を追加してください
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={addInstruction}
                            className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                            style={{ backgroundColor: 'var(--main-color)', color: 'white' }}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            手順を追加
                        </button>
                    </div>

                    {/* おすすめポイント */}
                    <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--black)' }}>
                            おすすめポイント
                        </label>
                        <textarea
                            value={data.recommended_points}
                            onChange={(e) => setData('recommended_points', e.target.value)}
                            placeholder="このレシピのおすすめポイントを教えてください"
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: 'var(--gray)',
                                '--tw-ring-color': 'var(--main-color)'
                            } as React.CSSProperties}
                        />
                    </div>

                    {/* 保存ボタン */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={processing}
                        className="w-full py-3 rounded-lg font-bold text-white shadow-md"
                        style={{ backgroundColor: 'var(--main-color)' }}
                    >
                        {processing ? '保存中...' : '保存する'}
                    </button>
                </div>
            </main>

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
                        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 140px)' }}>
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
                        </div>

                        {/* 確定ボタン */}
                        <div className="p-4 border-t" style={{ borderColor: 'var(--gray)' }}>
                            <button
                                onClick={confirmIngredientSelection}
                                disabled={tempSelectedIngredients.size === 0}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: tempSelectedIngredients.size === 0 ? 'var(--gray)' : 'var(--main-color)' }}
                            >
                                追加する
                                {tempSelectedIngredients.size > 0 && ` (${tempSelectedIngredients.size}個)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 公開確認モーダル */}
            {showPublishModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--black)' }}>
                            レシピを公開しますか？
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'var(--dark-gray)' }}>
                            公開すると他のユーザーがこのレシピを見ることができます
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleSubmit(true)}
                                className="w-full py-3 rounded-lg font-bold text-white"
                                style={{ backgroundColor: 'var(--main-color)' }}
                            >
                                公開する
                            </button>
                            <button
                                onClick={() => handleSubmit(false)}
                                className="w-full py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--light-gray)', color: 'var(--dark-gray)' }}
                            >
                                非公開で保存
                            </button>
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="w-full py-3 text-sm"
                                style={{ color: 'var(--dark-gray)' }}
                            >
                                キャンセル
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
