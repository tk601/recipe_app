import { PropsWithChildren } from 'react';

// デスクトップレイアウトのProps
interface DesktopLayoutProps {
    currentPage?: string;
}

/**
 * デスクトップ用共通レイアウト
 * サイドバーやトップナビゲーションを提供する（実装予定）
 */
export default function DesktopLayout({ children }: PropsWithChildren<DesktopLayoutProps>) {
    return (
        <div className="min-h-screen flex">
            {/* TODO: Components/Desktop/TopNav や Sidebar をここに追加 */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
