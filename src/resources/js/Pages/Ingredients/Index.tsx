import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    categories: Array<{
        id: number;
        ingredients_category_name: string;
    }>;
    ingredients: Array<{
        ingredient_id: number;
        ingredients_category_name: string;
        ingredients_name: string;
        ingredients_image_url: string;
        seasoning_flg: number;
    }>;
    filters: {
        search?: string;
        category?: string;
    };
    activeCategory: number;
    searchQuery: string;
}

export default function IngredientsIndex({ categories, ingredients, activeCategory, searchQuery }: Props) {
    // console.log('categories', categories);
    // console.log('ingredients', ingredients);
    // console.log('activeCategory', activeCategory);
    // console.log('searchQuery', searchQuery);
    // console.log('React version:', React.version);
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);
    
    // 検索クエリの状態管理
    const [search, setSearch] = useState(searchQuery || '');
    
    /**
     * カテゴリ選択時の処理
     * 選択されたカテゴリIDでページを更新
     */
    const handleCategorySelect = async (categoryId: number) => {
        router.get(route('ingredients.index'), {
            category: categoryId,
            search: search || undefined
        }, {
            preserveState: true, // 検索状態を保持
            replace: true // ブラウザ履歴を置き換え
        });
    };

    /**
     * 検索処理
     * 入力値が変更されたら即座に検索を実行
     */
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        // // デバウンス処理（300ms後に検索実行）
        // clearTimeout(window.searchTimeout);
        // window.searchTimeout = setTimeout(() => {
        //     router.get(route('ingredients.index'), {
        //         category: activeCategory,
        //         search: value || undefined
        //     }, {
        //         preserveState: true,
        //         replace: true
        //     });
        // }, 300);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="食材一覧" />
            
            {/* ヘッダー */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* ロゴ */}
                        <div className="flex items-center space-x-3">
                            {/* <ChefHat className="h-8 w-8 text-green-600" /> */}
                            <h1 className="text-2xl font-bold text-gray-900">
                                食材リスト
                            </h1>
                        </div>
                        
                        {/* 検索ボックス */}
                        <div className="relative max-w-md w-full">
                            {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
                            <input
                                type="text"
                                placeholder="食材を探す"
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* カテゴリ一覧（横スクロール） */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 py-4 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`
                                    flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                    ${activeCategory === category.id
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {category.ingredients_category_name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 食材一覧 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {ingredients.map((ingredient) => (
                            <div
                                key={ingredient.ingredient_id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                                    {/*
                                    {ingredient.ingredients_image_url ? (
                                        <img
                                            src={ingredient.ingredients_image_url}
                                            alt={ingredient.ingredients_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            
                                        </div>
                                    )}
                                    */}
                                </div>
                                
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        {ingredient.ingredients_name}
                                    </h3>
                                    {ingredient.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {ingredient.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // 検索結果が空の場合
                    <div className="text-center py-16">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            食材が見つかりません
                        </h3>
                        <p className="text-gray-600">
                            {search 
                                ? `「${search}」に一致する食材がありません。別のキーワードで検索してみてください。`
                                : 'このカテゴリには食材が登録されていません。'
                            }
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
