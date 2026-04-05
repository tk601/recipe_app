import MobileHeader from '@/Layouts/MobileHeader';
import MobileFooter from '@/Layouts/MobileFooter';
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
            <MobileHeader currentPage={currentPage} />
            {children}
            <MobileFooter currentPage={currentPage} />
        </div>
    );
}
