import { Link } from '@inertiajs/react';
import { CookingPot, Refrigerator, ShoppingCart, User } from 'lucide-react';

interface FooterProps {
    currentPage?: string;
}

const Footer = ({ currentPage = 'refrigerators' }: FooterProps) => {
    // 各ページのアクティブ判定
    const isActive = (page: string) => currentPage === page;

    return (
        <footer
            className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-lg"
            style={{ borderColor: 'var(--gray)' }}
        >
            <div className="flex justify-around items-center max-w-7xl mx-auto">
                {/* レシピ */}
                <Link
                    href={route('recipes.index')}
                    className={`flex flex-col items-center p-3 w-full transition-colors ${
                        isActive('recipe') ? '' : 'opacity-60'
                    }`}
                >
                    <CookingPot
                        className="w-6 h-6 mb-1"
                        style={{ color: isActive('recipe') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: isActive('recipe') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    >
                        レシピ
                    </span>
                </Link>

                {/* 冷蔵庫 */}
                <Link
                    href={route('ingredients.index')}
                    className={`flex flex-col items-center p-3 w-full transition-colors ${
                        isActive('refrigerators') ? '' : 'opacity-60'
                    }`}
                >
                    <Refrigerator
                        className="w-6 h-6 mb-1"
                        style={{ color: isActive('refrigerators') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: isActive('refrigerators') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    >
                        冷蔵庫
                    </span>
                </Link>

                {/* 買い物リスト */}
                <Link
                    href={route('shopping-lists.index')}
                    className={`flex flex-col items-center p-3 w-full transition-colors ${
                        isActive('shoppingLists') ? '' : 'opacity-60'
                    }`}
                >
                    <ShoppingCart
                        className="w-6 h-6 mb-1"
                        style={{ color: isActive('shoppingLists') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: isActive('shoppingLists') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    >
                        買い物リスト
                    </span>
                </Link>

                {/* ユーザー */}
                <Link
                    href={route('profile.edit')}
                    className={`flex flex-col items-center p-3 w-full transition-colors ${
                        isActive('profile') ? '' : 'opacity-60'
                    }`}
                >
                    <User
                        className="w-6 h-6 mb-1"
                        style={{ color: isActive('profile') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: isActive('profile') ? 'var(--main-color)' : 'var(--dark-gray)' }}
                    >
                        ユーザー
                    </span>
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
