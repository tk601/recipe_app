import Header from '@/Components/Mobile/Header';
import Footer from '@/Components/Mobile/Footer';
import { PropsWithChildren } from 'react';

// モバイルレイアウトのProps
interface MobileLayoutProps {
    currentPage?: string;
}

/**
 * モバイル用共通レイアウト
 * Header（ハンバーガーメニュー）と Footer（タブナビゲーション）を提供する
 */
export default function MobileLayout({ children, currentPage }: PropsWithChildren<MobileLayoutProps>) {
    return (
        <div>
            <Header currentPage={currentPage} />
            {children}
            <Footer currentPage={currentPage} />
        </div>
    );
}
