import DesktopHeader from '@/Components/Desktop/Header';
import { PropsWithChildren } from 'react';

/** ページタイプの定義 */
type PageType = 'recipe' | 'refrigerators' | 'shoppingLists' | 'profile';

interface DesktopLayoutProps {
    /** 現在のページ（ヘッダーの表示切替に使用） */
    currentPage?: PageType;
    /** 検索ボックスの現在の値 */
    searchValue?: string;
    /** 検索値が変更された時のコールバック */
    onSearchChange?: (value: string) => void;
    /** 検索フォームが送信された時のコールバック */
    onSearchSubmit?: (value: string) => void;
    /** 作成ボタンがクリックされた時のコールバック */
    onCreateClick?: () => void;
}

/**
 * PC用共通レイアウト
 * DesktopHeaderを含む共通レイアウトを提供する
 *
 * 使用例:
 * <DesktopLayout
 *     currentPage="recipe"
 *     searchValue={searchQuery}
 *     onSearchChange={setSearchQuery}
 *     onSearchSubmit={handleSearch}
 * >
 *     {children}
 * </DesktopLayout>
 */
export default function DesktopLayout({
    children,
    currentPage,
    searchValue,
    onSearchChange,
    onSearchSubmit,
    onCreateClick,
}: PropsWithChildren<DesktopLayoutProps>) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--light-gray)' }}>
            {/* PC用ヘッダー */}
            <DesktopHeader
                currentPage={currentPage}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                onSearchSubmit={onSearchSubmit}
                onCreateClick={onCreateClick}
            />
            {/* メインコンテンツ */}
            <main>{children}</main>
        </div>
    );
}
