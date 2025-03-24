import React, { useEffect,useState } from 'react';
import axios from "axios";
import MobileMain from './pages/mobile/MobileMain';
import DesktopMain from './pages/desktop/DesktopMain';

const App = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        // LaravelにAPIテスト
        axios.get('/api/test')
        .then(response => {
            console.log('デバッグ内容');
            console.log(response.data);
        })
        .catch(error => {
            console.error("データの取得に失敗しました:");
            console.log('エラー内容:', error.response);
        });

        // ウインドウサイズの検知
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return (
        <div>
            {isMobile ? (
                <MobileMain />
            ) : (
                <DesktopMain />
            )}
        </div>
    );
};

export default App;
