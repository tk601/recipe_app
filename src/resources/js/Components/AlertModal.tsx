import React from 'react';
import { AlertTriangle } from 'lucide-react';

// バリデーションエラーや警告メッセージを表示する共通ポップアップ
interface AlertModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    // ボタンのラベル（デフォルト: 「OK」）
    buttonLabel?: string;
}

export default function AlertModal({
    isOpen,
    message,
    onClose,
    buttonLabel = 'OK',
}: AlertModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* アイコン */}
                <div className="flex justify-center mb-4">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--base-color)' }}
                    >
                        <AlertTriangle
                            className="w-7 h-7"
                            style={{ color: 'var(--main-color)' }}
                        />
                    </div>
                </div>

                {/* メッセージ */}
                <p
                    className="text-center text-base font-medium mb-6 leading-relaxed"
                    style={{ color: 'var(--black)' }}
                >
                    {message}
                </p>

                {/* OKボタン */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: 'var(--main-color)' }}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
}
