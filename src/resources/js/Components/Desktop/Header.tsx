import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, Search, Plus, CookingPot, Refrigerator, ShoppingCart, User } from 'lucide-react';

/** ページタイプの定義 */
type PageType = 'recipe' | 'refrigerators' | 'shoppingLists' | 'profile';

interface DesktopHeaderProps {
    /** 現在のページ（表示内容の切り替えに使用） */
    currentPage?: PageType;
    /** 検索ボックスの現在の値 */
    searchValue?: string;
    /** 検索値が変更された時のコールバック */
    onSearchChange?: (value: string) => void;
    /** 検索フォームが送信された時のコールバック */
    onSearchSubmit?: (value: string) => void;
    /** 作成ボタンがクリックされた時のコールバック（href未指定時に使用） */
    onCreateClick?: () => void;
}

/** ページごとのヘッダー表示設定を返す */
const getPageConfig = (page?: PageType) => {
    switch (page) {
        case 'recipe':
            return {
                showSearch: true,
                searchPlaceholder: 'レシピを検索...',
                showCreate: true,
                createLabel: 'レシピ作成',
                createHref: route('recipes.create'),
            };
        case 'refrigerators':
            return {
                showSearch: true,
                searchPlaceholder: '材料を検索...',
                showCreate: true,
                createLabel: '材料作成',
                createHref: undefined,
            };
        case 'shoppingLists':
            return {
                showSearch: false,
                searchPlaceholder: undefined,
                showCreate: true,
                createLabel: '材料作成',
                createHref: undefined,
            };
        default:
            return {
                showSearch: false,
                searchPlaceholder: undefined,
                showCreate: false,
                createLabel: '',
                createHref: undefined,
            };
    }
};

/**
 * PC用共通ヘッダーコンポーネント
 * 左: ハンバーガーメニュー + アプリロゴ
 * 中央: 検索ボックス（ページによって表示切替）
 * 右: 作成ボタン（ページによって表示切替）
 *
 * ページごとの表示:
 * - recipe:       レシピ検索ボックス + レシピ作成ボタン
 * - refrigerators: 材料検索ボックス + 材料作成ボタン
 * - shoppingLists: 検索ボックスなし + 材料作成ボタン
 */
const DesktopHeader = ({
    currentPage,
    searchValue = '',
    onSearchChange,
    onSearchSubmit,
    onCreateClick,
}: DesktopHeaderProps) => {
    // ハンバーガーメニューの開閉状態
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ページ設定の取得
    const config = getPageConfig(currentPage);

    // ナビゲーション項目の定義
    const navItems = [
        {
            label: 'レシピ',
            href: route('recipes.index'),
            icon: CookingPot,
            page: 'recipe' as PageType,
        },
        {
            label: '冷蔵庫',
            href: route('ingredients.index'),
            icon: Refrigerator,
            page: 'refrigerators' as PageType,
        },
        {
            label: '買い物リスト',
            href: route('shopping-lists.index'),
            icon: ShoppingCart,
            page: 'shoppingLists' as PageType,
        },
        {
            label: 'ユーザー',
            href: route('mobile.profile'),
            icon: User,
            page: 'profile' as PageType,
        },
    ];

    // 検索フォームの送信処理
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearchSubmit?.(searchValue);
    };

    return (
        <>
            <header
                className="bg-white shadow-sm border-b sticky top-0 z-30"
                style={{ borderColor: 'var(--gray)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">

                        {/* 左: ハンバーガーメニューボタン + アプリロゴ */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                style={{ color: 'var(--black)' }}
                                aria-label="メニューを開く"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <Link href={route('recipes.index')} className="flex items-center gap-2">
                                {/* 丸いアイコン画像 */}
                                <img
                                    src="/images/gohandoki_logo3.png"
                                    alt="ごはんどきアイコン"
                                    className="h-8 w-8 object-cover rounded-full"
                                />
                                {/* テキストロゴ */}
                                <img
                                    src="/images/gohandoki_moji.png"
                                    alt="ごはんどき"
                                    className="h-8 object-contain"
                                />
                            </Link>
                        </div>

                        {/* 中央: 検索ボックス（ページによって表示切替） */}
                        <div className="flex-1 flex justify-center">
                            {config.showSearch && (
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="w-full max-w-xl"
                                >
                                    <div className="relative">
                                        {/* 検索アイコン */}
                                        <Search
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                            style={{ color: 'var(--dark-gray)' }}
                                        />
                                        <input
                                            type="text"
                                            value={searchValue}
                                            onChange={(e) => onSearchChange?.(e.target.value)}
                                            placeholder={config.searchPlaceholder}
                                            className="w-full pl-10 pr-4 py-2 rounded-full border text-sm outline-none focus:ring-2 focus:ring-[#D9800B] focus:border-[#D9800B] transition-all"
                                            style={{
                                                borderColor: 'var(--gray)',
                                                backgroundColor: 'var(--light-gray)',
                                                color: 'var(--black)',
                                            }}
                                        />
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* 右: 作成ボタン（ページによって表示切替） */}
                        <div className="flex-shrink-0">
                            {config.showCreate && (
                                config.createHref ? (
                                    /* hrefがある場合はLinkコンポーネントで遷移 */
                                    <Link
                                        href={config.createHref}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: 'var(--main-color)' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        {config.createLabel}
                                    </Link>
                                ) : (
                                    /* hrefがない場合はonCreateClickコールバックを使用（機能は後で実装） */
                                    <button
                                        onClick={onCreateClick}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: 'var(--main-color)' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        {config.createLabel}
                                    </button>
                                )
                            )}
                        </div>

                    </div>
                </div>
            </header>

            {/* ハンバーガーメニューのオーバーレイ（クリックで閉じる） */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* ハンバーガーメニューの中身（左サイドドロワー） */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* ドロワーヘッダー */}
                <div
                    className="flex items-center justify-between px-4 py-4 border-b"
                    style={{ borderColor: 'var(--gray)' }}
                >
                    {/* 丸いアイコン画像 + テキストロゴ */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/gohandoki_logo3.png"
                            alt="ごはんどきアイコン"
                            className="h-8 w-8 object-cover rounded-full"
                        />
                        <img
                            src="/images/gohandoki_moji.png"
                            alt="ごはんどき"
                            className="h-8 object-contain"
                        />
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--black)' }}
                        aria-label="メニューを閉じる"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ナビゲーション項目 */}
                <nav className="py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.page;
                        return (
                            <Link
                                key={item.page}
                                href={item.href}
                                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                                    isActive ? 'font-bold' : ''
                                }`}
                                style={{
                                    backgroundColor: isActive ? 'var(--base-color)' : 'transparent',
                                    color: isActive ? 'var(--main-color)' : 'var(--black)',
                                    borderLeft: isActive
                                        ? '4px solid var(--main-color)'
                                        : '4px solid transparent',
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

export default DesktopHeader;
