import { Link } from '@inertiajs/react';
import { CookingPot, Refrigerator, ShoppingCart, User } from 'lucide-react';

interface TopNavProps {
    /** 現在のページ（アクティブ表示に使用） */
    currentPage?: string;
}

/**
 * デスクトップ用トップナビゲーションコンポーネント（実装予定）
 */
const TopNav = ({ currentPage }: TopNavProps) => {
    // ナビゲーション項目の定義
    const navItems = [
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
        <header
            className="bg-white shadow-sm border-b sticky top-0 z-30"
            style={{ borderColor: 'var(--gray)' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 左: アプリロゴ */}
                    <div className="flex-shrink-0">
                        <img
                            src="/images/gohandoki_moji.png"
                            alt="ごはんどき"
                            className="h-8 object-contain"
                        />
                    </div>

                    {/* 右: ナビゲーションリンク */}
                    <nav className="flex items-center gap-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.page;
                            return (
                                <Link
                                    key={item.page}
                                    href={item.href}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                    style={{
                                        backgroundColor: isActive ? 'var(--base-color)' : 'transparent',
                                        color: isActive ? 'var(--main-color)' : 'var(--black)',
                                        fontWeight: isActive ? 'bold' : 'normal',
                                    }}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: isActive ? 'var(--main-color)' : 'var(--dark-gray)' }}
                                    />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
