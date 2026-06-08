import React, { useState, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import DesktopLayout from '@/Layouts/DesktopLayout';
import IngredientSelectModal from '@/Components/IngredientSelectModal';
import AlertModal from '@/Components/AlertModal';

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

interface RecipeData {
    id: number;
    recipe_name: string;
    recipe_category_id: number;
    serving_size: number;
    recommended_points: string | null;
    recipe_image_url: string | null;
    publish_flg: boolean;
}

interface RecipeIngredient {
    id: number;
    ingredient_id: number;
    ingredient_name: string;
    quantity: string;
    unit: string;
}

interface RecipeInstruction {
    instruction_no: number;
    description: string;
    instruction_image_url: string | null;
}

interface Props {
    recipe: RecipeData;
    recipeIngredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    ingredients: Ingredient[];
    ingredientCategories: IngredientCategory[];
    recipeCategories: { id: number; recipe_category_name: string }[];
}

export default function RecipeEdit({ recipe, recipeIngredients, instructions: initialInstructions, ingredients, ingredientCategories, recipeCategories }: Props) {
    // フォームデータの管理（既存データで初期化）
    const { data, setData, post, processing, errors } = useForm<RecipeFormData>({
        recipe_name: recipe.recipe_name,
        recipe_category_id: recipe.recipe_category_id.toString(),
        serving_size: recipe.serving_size.toString(),
        recommended_points: recipe.recommended_points || '',
        recipe_image: null,
        ingredients: recipeIngredients.map(ing => ({
            ingredient_id: ing.ingredient_id,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
        })),
        instructions: initialInstructions.map(inst => ({
            instruction_no: inst.instruction_no,
            description: inst.description,
            image: null,
            image_preview: inst.instruction_image_url,
        })),
        publish_flg: recipe.publish_flg,
    });

    // 画像プレビュー（既存画像で初期化）
    const [imagePreview, setImagePreview] = useState<string | null>(recipe.recipe_image_url);

    // 食材選択モーダルの表示状態
    const [showIngredientModal, setShowIngredientModal] = useState(false);

    // 削除確認モーダルの表示状態
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // アラートモーダルの状態（メッセージが空の場合は非表示）
    const [alertMessage, setAlertMessage] = useState('');

    // 画面サイズを判定（768px以上をPC画面とする）
    const [isDesktop, setIsDesktop] = useState(false);

    // PC用サブヘッダーの表示状態（下スクロール時に非表示）
    const [isSubHeaderVisible, setIsSubHeaderVisible] = useState(true);
    const lastScrollYRef = useRef(0);

    // 画面サイズのチェック
    useEffect(() => {
        const checkScreenSize = () => setIsDesktop(window.innerWidth >= 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // スクロール方向を検知してPC用サブヘッダーの表示を制御する
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollYRef.current && currentScrollY > 60) {
                // 下スクロール：サブヘッダーを非表示
                setIsSubHeaderVisible(false);
            } else {
                // 上スクロール or ページ上部付近：サブヘッダーを表示
                setIsSubHeaderVisible(true);
            }
            lastScrollYRef.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /**
     * 戻るボタン
     */
    const handleBack = () => {
        router.visit(route('recipes.show', recipe.id));
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
    };

    /**
     * 選択した食材を確定してフォームに追加
     */
    const handleConfirmIngredients = (selectedIds: Set<number>) => {
        const newIngredients = Array.from(selectedIds).map(id => {
            const ingredient = ingredients.find(ing => ing.id === id);
            return {
                ingredient_id: id,
                ingredient_name: ingredient?.name || '',
                quantity: '',
                unit: '',
            };
        });
        setData('ingredients', [...data.ingredients, ...newIngredients]);
        setShowIngredientModal(false);
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
     * レシピ削除
     */
    const handleDelete = () => {
        router.delete(route('recipes.destroy', recipe.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
            }
        });
    };

    /**
     * 保存ボタンクリック（既存の公開設定を維持したまま保存）
     */
    const handleSave = () => {
        // バリデーション
        if (!data.recipe_name) {
            setAlertMessage('レシピ名を入力してください');
            return;
        }
        if (!data.recipe_category_id) {
            setAlertMessage('カテゴリを選択してください');
            return;
        }
        if (data.ingredients.length === 0) {
            setAlertMessage('材料を追加してください');
            return;
        }
        if (data.instructions.length === 0) {
            setAlertMessage('調理手順を追加してください');
            return;
        }

        // FormDataを作成（画像ファイルを含むため）
        const formData = new FormData();

        // 基本情報（既存の公開設定を維持）
        formData.append('recipe_name', data.recipe_name);
        formData.append('recipe_category_id', data.recipe_category_id);
        formData.append('serving_size', data.serving_size);
        formData.append('recommended_points', data.recommended_points);
        formData.append('publish_flg', data.publish_flg ? '1' : '0');

        // レシピ画像
        if (data.recipe_image) {
            formData.append('recipe_image', data.recipe_image);
        }

        // 材料
        data.ingredients.forEach((ingredient, index) => {
            formData.append(`ingredients[${index}][ingredient_id]`, ingredient.ingredient_id.toString());
            formData.append(`ingredients[${index}][quantity]`, ingredient.quantity);
            formData.append(`ingredients[${index}][unit]`, ingredient.unit);
        });

        // 調理手順
        data.instructions.forEach((instruction, index) => {
            formData.append(`instructions[${index}][instruction_no]`, instruction.instruction_no.toString());
            formData.append(`instructions[${index}][description]`, instruction.description);

            // 手順画像
            if (instruction.image) {
                formData.append(`instructions[${index}][image]`, instruction.image);
            }
        });

        // _methodフィールドを追加してPUTメソッドとして送信（Laravel spoofing）
        formData.append('_method', 'PUT');

        // router.postを使用してFormDataを送信
        router.post(route('recipes.update', recipe.id), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // =============================================
    // 食材選択モーダル（PC・モバイル共通）
    // =============================================
    const ingredientModal = (
        <IngredientSelectModal
            isOpen={showIngredientModal}
            onClose={() => setShowIngredientModal(false)}
            ingredients={ingredients}
            ingredientCategories={ingredientCategories}
            onConfirm={handleConfirmIngredients}
            confirmLabel="追加する"
        />
    );

    // =============================================
    // 削除確認モーダル（PC・モバイル共通）
    // =============================================
    const deleteModal = showDeleteModal ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden">
                <div className="p-6 border-b" style={{ borderColor: 'var(--gray)' }}>
                    <h3 className="font-bold text-lg text-center" style={{ color: 'var(--black)' }}>
                        レシピを削除しますか？
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-center" style={{ color: 'var(--dark-gray)' }}>
                        この操作は取り消せません。<br />
                        本当に「{recipe.recipe_name}」を削除しますか？
                    </p>
                </div>
                <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--gray)' }}>
                    <button
                        onClick={handleDelete}
                        className="w-full py-3 rounded-lg font-bold transition-all active:scale-95"
                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                        削除する
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="w-full py-3 text-sm"
                        style={{ color: 'var(--dark-gray)' }}
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    // =========================================
    // PC用レイアウト
    // =========================================
    if (isDesktop) {
        return (
            <DesktopLayout currentPage="recipe">
                <div className="min-h-screen" style={{ backgroundColor: 'var(--base-color)' }}>
                    <Head title="レシピ編集 - ごはんどき" />

                    {/* ===== PC用サブヘッダー ===== */}
                    {/* 左：戻るボタン＋「レシピ編集」　右：保存ボタン・削除ボタン */}
                    {/* 下スクロール時に -translate-y-full でヘッダー裏に隠れる */}
                    <div
                        className={`sticky top-16 z-20 bg-white border-b transition-transform duration-300 ${
                            isSubHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                        }`}
                        style={{ borderColor: 'var(--gray)' }}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="flex items-center justify-between py-3">
                                {/* 左：戻るボタン＋ページタイトル */}
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft
                                        className="w-5 h-5 flex-shrink-0"
                                        style={{ color: 'var(--main-color)' }}
                                    />
                                    <span
                                        className="text-xl font-bold"
                                        style={{ color: 'var(--main-color)' }}
                                    >
                                        レシピ編集
                                    </span>
                                </button>

                                {/* 右：削除ボタン・保存ボタン */}
                                <div className="flex items-center gap-2">
                                    {/* 削除ボタン */}
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all hover:bg-red-50"
                                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                    >
                                        削除する
                                    </button>
                                    {/* 保存ボタン */}
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
                                        style={{ backgroundColor: 'var(--main-color)', color: 'white' }}
                                    >
                                        {processing ? '保存中...' : '保存する'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* メインコンテンツ */}
                    <div className="max-w-7xl mx-auto px-4 py-6">

                        {/* ===== 上部: 画像（左 3/5）＋ レシピ名・カテゴリ・人数（右 2/5）===== */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="grid grid-cols-5">
                                {/* 左: レシピ画像アップロードエリア */}
                                <div
                                    className="col-span-3 relative cursor-pointer group"
                                    style={{ height: '420px' }}
                                    onClick={() => document.getElementById('recipe-image-input')?.click()}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="プレビュー"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ backgroundColor: 'var(--light-gray)' }}
                                        >
                                            <div className="text-center">
                                                <ImageIcon
                                                    className="w-16 h-16 mx-auto mb-3"
                                                    style={{ color: 'var(--dark-gray)' }}
                                                />
                                                <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
                                                    クリックして画像をアップロード
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {/* ホバー時のオーバーレイ */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/90 rounded-lg px-4 py-2 flex items-center gap-2">
                                            <Upload className="w-4 h-4" style={{ color: 'var(--main-color)' }} />
                                            <span className="font-medium text-sm" style={{ color: 'var(--main-color)' }}>
                                                {imagePreview ? '画像を変更' : '画像をアップロード'}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        id="recipe-image-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* 右: レシピ名・カテゴリ・人数の入力フォーム */}
                                <div className="col-span-2 p-8 flex flex-col gap-6">
                                    {/* レシピ名 */}
                                    <div>
                                        <label
                                            className="block text-sm font-bold mb-2"
                                            style={{ color: 'var(--black)' }}
                                        >
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

                                    {/* カテゴリ */}
                                    <div>
                                        <label
                                            className="block text-sm font-bold mb-2"
                                            style={{ color: 'var(--black)' }}
                                        >
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

                                    {/* 人数 */}
                                    <div>
                                        <label
                                            className="block text-sm font-bold mb-2"
                                            style={{ color: 'var(--black)' }}
                                        >
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
                            </div>
                        </div>

                        {/* ===== 下部: 調理手順（左 2/3）＋ 材料（右 1/3）===== */}
                        <div className="grid grid-cols-3 gap-6 mt-6">

                            {/* 左: 調理手順 ＋ おすすめポイント */}
                            <div className="col-span-2 space-y-6">
                                {/* 調理手順 */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2
                                        className="text-lg font-bold mb-4 pb-2 border-b"
                                        style={{ color: 'var(--main-color)', borderColor: 'var(--gray)' }}
                                    >
                                        調理手順 <span className="text-red-500 text-sm">*</span>
                                    </h2>

                                    {data.instructions.length > 0 ? (
                                        <div className="space-y-4 mb-4">
                                            {data.instructions.map((inst, index) => (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-4"
                                                    style={{ borderColor: 'var(--gray)' }}
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        {/* ステップ番号バッジ */}
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                                                            style={{ backgroundColor: 'var(--main-color)' }}
                                                        >
                                                            {inst.instruction_no}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeInstruction(index)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <X className="w-4 h-4" style={{ color: 'var(--dark-gray)' }} />
                                                        </button>
                                                    </div>

                                                    <textarea
                                                        value={inst.description}
                                                        onChange={(e) => updateInstructionDescription(index, e.target.value)}
                                                        placeholder="手順の説明を入力"
                                                        rows={3}
                                                        className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 text-sm"
                                                        style={{
                                                            borderColor: 'var(--gray)',
                                                            '--tw-ring-color': 'var(--main-color)'
                                                        } as React.CSSProperties}
                                                    />

                                                    <div
                                                        className="relative w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
                                                        style={{ borderColor: 'var(--gray)' }}
                                                        onClick={() => !inst.image_preview && document.getElementById(`instruction-image-${index}`)?.click()}
                                                    >
                                                        {inst.image_preview ? (
                                                            <img
                                                                src={inst.image_preview}
                                                                alt={`手順${inst.instruction_no}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="text-center">
                                                                <Upload
                                                                    className="w-8 h-8 mx-auto mb-1"
                                                                    style={{ color: 'var(--dark-gray)' }}
                                                                />
                                                                <p className="text-xs" style={{ color: 'var(--dark-gray)' }}>
                                                                    画像をアップロード（任意）
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {inst.image_preview && (
                                                        <button
                                                            type="button"
                                                            onClick={() => document.getElementById(`instruction-image-${index}`)?.click()}
                                                            className="mt-2 w-full py-2 rounded-lg font-medium text-white text-sm"
                                                            style={{ backgroundColor: 'var(--main-color)' }}
                                                        >
                                                            画像を変更
                                                        </button>
                                                    )}
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
                                        <p className="text-sm text-center py-6 mb-4" style={{ color: 'var(--dark-gray)' }}>
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
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2
                                        className="text-lg font-bold mb-4 pb-2 border-b"
                                        style={{ color: 'var(--main-color)', borderColor: 'var(--gray)' }}
                                    >
                                        おすすめポイント
                                    </h2>
                                    <textarea
                                        value={data.recommended_points}
                                        onChange={(e) => setData('recommended_points', e.target.value)}
                                        placeholder="このレシピのおすすめポイントを教えてください"
                                        rows={4}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: 'var(--gray)',
                                            '--tw-ring-color': 'var(--main-color)'
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            {/* 右: 材料 */}
                            <div className="col-span-1">
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky" style={{ top: '120px' }}>
                                    <h2
                                        className="text-lg font-bold mb-4 pb-2 border-b"
                                        style={{ color: 'var(--main-color)', borderColor: 'var(--gray)' }}
                                    >
                                        材料 <span className="text-red-500 text-sm">*</span>
                                    </h2>

                                    {data.ingredients.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            {data.ingredients.map((ing, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 py-2 border-b last:border-0"
                                                    style={{ borderColor: 'var(--light-gray)' }}
                                                >
                                                    <span
                                                        className="flex-1 text-sm font-medium"
                                                        style={{ color: 'var(--black)' }}
                                                    >
                                                        {ing.ingredient_name}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={ing.quantity}
                                                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                                                        placeholder="数量"
                                                        className="w-16 px-2 py-1 border rounded text-sm"
                                                        style={{ borderColor: 'var(--gray)' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={ing.unit}
                                                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                                        placeholder="単位"
                                                        className="w-14 px-2 py-1 border rounded text-sm"
                                                        style={{ borderColor: 'var(--gray)' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeIngredient(index)}
                                                        className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                                    >
                                                        <X className="w-4 h-4" style={{ color: 'var(--dark-gray)' }} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-center py-6 mb-4" style={{ color: 'var(--dark-gray)' }}>
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
                            </div>
                        </div>
                    </div>

                    {/* モーダル */}
                    {ingredientModal}
                    {deleteModal}
                    <AlertModal
                        isOpen={!!alertMessage}
                        message={alertMessage}
                        onClose={() => setAlertMessage('')}
                    />
                </div>
            </DesktopLayout>
        );
    }

    // =========================================
    // スマホ用レイアウト
    // =========================================
    return (
        <div
            className="min-h-screen pb-8"
            style={{ backgroundColor: 'var(--base-color)' }}
        >
            <Head title="レシピ編集 - ごはんどき" />

            {/* スマホ用ヘッダー */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={handleBack}
                                className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--main-color)' }} />
                            </button>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--main-color)' }}>
                                レシピ編集
                            </h1>
                        </div>
                        {/* 保存ボタン（ヘッダー右側） */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={processing}
                            className="px-4 py-2 rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: 'var(--main-color)' }}
                        >
                            {processing ? '保存中...' : '保存する'}
                        </button>
                    </div>
                </div>
            </header>

            {/* スマホ用メインコンテンツ（縦スタック） */}
            <main className="max-w-4xl mx-auto px-4 py-4">
                <div className="space-y-4">
                    {/* メイン画像 */}
                    <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: 'var(--gray)' }}>
                        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--black)' }}>
                            レシピ画像
                        </label>
                        <div
                            className="relative w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
                            style={{ borderColor: 'var(--gray)' }}
                            onClick={() => !imagePreview && document.getElementById('recipe-image-input-mobile')?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--dark-gray)' }} />
                                    <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>画像をアップロード</p>
                                </div>
                            )}
                        </div>
                        {imagePreview && (
                            <button
                                type="button"
                                onClick={() => document.getElementById('recipe-image-input-mobile')?.click()}
                                className="mt-3 w-full py-2 rounded-lg font-medium text-white"
                                style={{ backgroundColor: 'var(--main-color)' }}
                            >
                                画像を変更
                            </button>
                        )}
                        <input
                            id="recipe-image-input-mobile"
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

                    {/* カテゴリ・人数 */}
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
                                <option value="">選択</option>
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
                                            <button type="button" onClick={() => removeInstruction(index)} className="p-1">
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
                                            onClick={() => !inst.image_preview && document.getElementById(`instruction-image-mobile-${index}`)?.click()}
                                        >
                                            {inst.image_preview ? (
                                                <img src={inst.image_preview} alt={`手順${inst.instruction_no}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-8 h-8 mx-auto mb-1" style={{ color: 'var(--dark-gray)' }} />
                                                    <p className="text-xs" style={{ color: 'var(--dark-gray)' }}>画像をアップロード（任意）</p>
                                                </div>
                                            )}
                                        </div>
                                        {inst.image_preview && (
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById(`instruction-image-mobile-${index}`)?.click()}
                                                className="mt-2 w-full py-2 rounded-lg font-medium text-white text-sm"
                                                style={{ backgroundColor: 'var(--main-color)' }}
                                            >
                                                画像を変更
                                            </button>
                                        )}
                                        <input
                                            id={`instruction-image-mobile-${index}`}
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
                                        <button type="button" onClick={() => removeIngredient(index)} className="p-1">
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

                    {/* 削除ボタン */}
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={processing}
                        className="w-full py-3 rounded-lg font-bold text-white shadow-md"
                        style={{ backgroundColor: '#ef4444' }}
                    >
                        削除する
                    </button>
                </div>
            </main>

            {/* モーダル */}
            {ingredientModal}
            {deleteModal}
            <AlertModal
                isOpen={!!alertMessage}
                message={alertMessage}
                onClose={() => setAlertMessage('')}
            />
        </div>
    );
}
