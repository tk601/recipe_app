import React, { useEffect,useState } from 'react';
import axios from "axios";
import Header from './components/Header';
import Footer from './components/Footer';
import Recipe from './pages/Recipe';
import Refrigerators from './pages/Refrigerators';
import ShoppingLists from './pages/ShoppingLists';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
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

  const [items, setItems] = useState([]);

    useEffect(() => {
        axios.get('/api/items')
            .then(response => {
                console.log('デバッグ内容');
                console.log(response.data);
                setItems(response.data);
            })
            .catch(error => {
                console.error("データの取得に失敗しました:", error);
            });
    }, []);
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <main className="flex-1 overflow-auto p-4">
        {renderPage()}
      </main>
      
      <Footer currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
