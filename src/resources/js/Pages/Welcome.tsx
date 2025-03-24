import React from 'react';

interface WelcomeProps {
    refrigeratorItems?: Array<{
        id: number;
        name: string;
        quantity: number;
        expiry_date: string;
    }>;
}

export default function Welcome({ refrigeratorItems = [] }: WelcomeProps) {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">冷蔵庫管理アプリ</h1>

            <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">冷蔵庫の中身</h2>
                {refrigeratorItems.length > 0 ? (
                    <ul className="border rounded-lg divide-y">
                        {refrigeratorItems.map((item) => (
                            <li key={item.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                        賞味期限: {item.expiry_date}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">
                                        数量: {item.quantity}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">冷蔵庫の中身がありません</p>
                )}
            </div>
        </div>
    );
}
