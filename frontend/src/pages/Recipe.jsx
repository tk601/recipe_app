import React from 'react';

const Recipe = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">レシピページ</h1>
        <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full mb-2 flex items-center justify-center text-3xl">👤</div>
            <h2 className="text-xl font-medium">ユーザー名</h2>
            <p className="text-gray-600">user@example.com</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
                編集する
            </button>
        </div>
    </div>
);

export default Recipe;
