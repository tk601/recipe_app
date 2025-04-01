import { useState } from 'react';
import Header from '../../Components/Mobile/Header';
import Footer from '../../Components/Mobile/Footer';
import Recipe from './Recipe';
import Refrigerators from './Refrigerators';
import ShoppingLists from './ShoppingLists';
import ProfilePage from './ProfilePage';

const MobileMain = () => {
    // Footerボタンの画面繊維
    const [currentPage, setCurrentPage] = useState('refrigerators');
    const renderPage = () => {
        switch(currentPage) {
            case 'recipe':
                return <Recipe />;
            case 'refrigerators':
                return <Refrigerators />;
            case 'shoppingLists':
                return <ShoppingLists />;
            case 'profile':
                return <ProfilePage />;
            default:
                return <Recipe />;
        }
    };

    return (
        <div>
            <Header />
            <h1>テストですね</h1>
            <main className="flex-1 overflow-auto p-4">
                {renderPage()}
            </main>
            <Footer currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    );
};

export default MobileMain;
