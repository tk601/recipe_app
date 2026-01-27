import { useState } from 'react';
import Header from '../../Components/Mobile/Header';
import Footer from '../../Components/Mobile/Footer';
import Recipe from './Recipe';
import Refrigerators from './Refrigerators';
import ProfilePage from './ProfilePage';

const MobileMain = () => {
    // Footerボタンの画面遷移
    const [currentPage, setCurrentPage] = useState('refrigerators');
    const renderPage = () => {
        switch(currentPage) {
            case 'recipe':
                return <Recipe />;
            case 'refrigerators':
                return <Refrigerators />;
            case 'shoppingLists':
                // ShoppingListsはInertia.jsページコンポーネントなので、ここでは表示しない
                return <div>買い物リストページへ遷移してください</div>;
            case 'profile':
                return <ProfilePage />;
            default:
                return <Recipe />;
        }
    };

    return (
        <div>
            <Header />
            <h1>テストですねカンナムスタイル</h1>
            <main className="flex-1 overflow-auto p-4">
                {renderPage()}
            </main>
            <Footer currentPage={currentPage} />
        </div>
    );
};

export default MobileMain;
