import { useEffect, useState } from 'react';
import MobileMain from './Mobile/MobileMain';
import DesktopMain from './Desktop/DesktopMain';

const RecipeMain = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
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
}

export default RecipeMain;
