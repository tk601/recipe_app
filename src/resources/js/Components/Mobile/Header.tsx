import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, CookingPot, Refrigerator, ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
    /** 現在のページ（ハンバーガーメニューのアクティブ表示に使用） */
    currentPage?: string;
}

/**
 * 共通ヘッダーコンポーネント
 * 左: アプリロゴ、右: ハンバーガーメニュー
 */
const Header = ({ currentPage }: HeaderProps) => {
    // ハンバーガーメニューの開閉状態
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // メニュー項目の定義
    const menuItems = [
        {
            label: 'レシピ',
            href: route('recipes.index'),
            icon: CookingPot,
            page: 'recipe',
        },
        {
            label: '冷蔵庫',
            href: route('ingredients.index'),
            icon: Refrigerator,
            page: 'refrigerators',
        },
        {
            label: '買い物リスト',
            href: route('shopping-lists.index'),
            icon: ShoppingCart,
            page: 'shoppingLists',
        },
        {
            label: 'ユーザー',
            href: route('mobile.profile'),
            icon: User,
            page: 'profile',
        },
    ];

    return (
        <>
            <header
                className="bg-white shadow-sm border-b sticky top-0 z-30"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between py-3">
                        {/* 左: アプリロゴ */}
                        <div className="flex-shrink-0">
                            <img
                                src="/images/gohandoki_moji.png"
                                alt="ごはんどき"
                                className="h-8 object-contain"
                            />
                        </div>

                        {/* 右: ハンバーガーメニューボタン */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-1 rounded-lg transition-colors"
                                style={{ color: 'var(--black)' }}
                                aria-label="メニューを開く"
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ハンバーガーメニューのオーバーレイ */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-20"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* ハンバーガーメニューの中身 */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* メニューヘッダー */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: 'var(--gray)' }}
                >
                    <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--main-color)' }}
                    >
                        メニュー
                    </span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: 'var(--black)' }}
                        aria-label="メニューを閉じる"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* メニュー項目 */}
                <nav className="py-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.page;
                        return (
                            <Link
                                key={item.page}
                                href={item.href}
                                className={`flex items-center gap-3 px-6 py-4 transition-colors ${
                                    isActive ? 'font-bold' : ''
                                }`}
                                style={{
                                    backgroundColor: isActive ? 'var(--base-color)' : 'transparent',
                                    color: isActive ? 'var(--main-color)' : 'var(--black)',
                                    borderLeft: isActive ? '4px solid var(--main-color)' : '4px solid transparent',
                                }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Icon
                                    className="w-5 h-5"
                                    style={{
                                        color: isActive ? 'var(--main-color)' : 'var(--dark-gray)',
                                    }}
                                />
                                <span className="text-base">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
};

export default Header;
