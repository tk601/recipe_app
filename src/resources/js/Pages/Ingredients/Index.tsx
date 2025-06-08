import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    ingredients: {
        // data: Array<{
        //     id: number;
        //     name: string;
        //     category: string;
        //     quantity: number;
        //     unit: string;
        //     expiry_date?: string;
        //     memo?: string;
        // }>;
        // links: Array<{
        //     url: string | null;
        //     label: string;
        //     active: boolean;
        // }>;
    };
    categories: string[];
    filters: {
        search?: string;
        category?: string;
    };
}

export default function Index({ auth, ingredients, categories}: Props) {
    // // 検索とフィルタリングの状態管理
    // const [search, setSearch] = useState(filters.search || '');
    // const [category, setCategory] = useState(filters.category || '');

    // // 検索とフィルタを実行
    // const handleFilter = () => {
    //     router.get(route('ingredients.index'), {
    //         search: search,
    //         category: category,
    //     }, {
    //         preserveState: true,
    //     });
    // };

    // // フィルタをリセット
    // const handleReset = () => {
    //     setSearch('');
    //     setCategory('');
    //     router.get(route('ingredients.index'));
    // };

    // // 賞味期限の表示色を決定
    // const getExpiryColor = (expiryDate: string) => {
    //     if (!expiryDate) return 'text-gray-500';
        
    //     const today = new Date();
    //     const expiry = new Date(expiryDate);
    //     const diffTime = expiry.getTime() - today.getTime();
    //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    //     if (diffDays < 0) return 'text-red-600 font-bold'; // 期限切れ
    //     if (diffDays <= 3) return 'text-orange-600 font-semibold'; // 期限間近
    //     return 'text-green-600'; // 安全
    // };

    // // 材料削除
    // const handleDelete = (ingredient: { id: number; name: string }) => {
    //     if (confirm(`「${ingredient.name}」を削除しますか？`)) {
    //         router.delete(route('ingredients.destroy', ingredient.id));
    //     }
    // };

    return (
        <AuthenticatedLayout
            // user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        冷蔵庫の材料
                    </h2>
                    <Link
                        href={route('ingredients.create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        材料を追加
                    </Link>
                </div>
            }
        >
            <Head title="材料一覧" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* 検索・フィルタ機能 */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 検索フィールド */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        材料名で検索
                                    </label>
                                    {/* <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="材料名を入力..."
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    /> */}
                                </div>

                                {/* カテゴリーフィルタ */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        カテゴリー
                                    </label>
                                    {/* <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">すべて</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select> */}
                                </div>

                                {/* 検索ボタン */}
                                <div className="flex items-end space-x-2">
                                    {/* <button
                                        onClick={handleFilter}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        検索
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                    >
                                        リセット
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 材料一覧 */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                        {ingredients}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
