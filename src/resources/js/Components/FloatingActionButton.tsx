import { Plus } from 'lucide-react';

interface Props {
    label: string;
    onClick: () => void;
    // trueのとき非表示（フィルターポップアップ表示中など）
    hidden?: boolean;
    // 追加のクラス（md:hiddenやmd:bottom-20などページ固有の調整）
    className?: string;
}

/**
 * 画面右下に固定表示される浮動アクションボタン
 * 白いボーダーと強めの影で背景に埋もれないデザイン
 */
const FloatingActionButton = ({ label, onClick, hidden = false, className = '' }: Props) => {
    if (hidden) return null;

    return (
        <button
            onClick={onClick}
            className={`fixed bottom-24 right-4 px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-200 active:scale-95 z-20 border-2 border-white ${className}`}
            style={{
                backgroundColor: 'var(--main-color)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
        >
            <span className="text-white font-bold text-sm">{label}</span>
            <Plus className="w-4 h-4 text-white" />
        </button>
    );
};

export default FloatingActionButton;
