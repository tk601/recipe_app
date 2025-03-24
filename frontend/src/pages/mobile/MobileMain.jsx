import React, { useState } from 'react';
import Header from '../../components/mobile/Header';
import Footer from '../../components/mobile/Footer';
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
            <main className="flex-1 overflow-auto p-4">
                {renderPage()}
            </main>
            <Footer currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
    );
};

export default MobileMain;
