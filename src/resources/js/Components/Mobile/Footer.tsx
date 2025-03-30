const Footer = ({
    currentPage, setCurrentPage
}: {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}) => {
    return (
        <footer className="bg-white border-t">
            <div className="flex justify-around items-center">
                <button
                    onClick={() => setCurrentPage("recipe")}
                    className={`flex flex-col items-center p-3 w-full ${
                        currentPage === "recipe" ? "text-blue-500" : "text-gray-500"
                    }`}
                    >
                    <span className="text-2xl">🏠</span>
                    <span className="text-xs mt-1">レシピ</span>
                </button>

                <button
                    onClick={() => setCurrentPage("refrigerators")}
                    className={`flex flex-col items-center p-3 w-full ${
                        currentPage === "refrigerators" ? "text-blue-500" : "text-gray-500"
                    }`}
                    >
                    <span className="text-2xl">🔍</span>
                    <span className="text-xs mt-1">冷蔵庫</span>
                </button>

                <button
                    onClick={() => setCurrentPage("shoppingLists")}
                    className={`flex flex-col items-center p-3 w-full ${
                        currentPage === "shoppingLists" ? "text-blue-500" : "text-gray-500"
                    }`}
                    >
                    <span className="text-2xl">🔔</span>
                    <span className="text-xs mt-1">買い物リスト</span>
                </button>

                <button
                    onClick={() => setCurrentPage("profile")}
                    className={`flex flex-col items-center p-3 w-full ${
                        currentPage === "profile" ? "text-blue-500" : "text-gray-500"
                    }`}
                    >
                    <span className="text-2xl">👤</span>
                    <span className="text-xs mt-1">ユーザー</span>
                </button>
            </div>
        </footer>
    );
};

export default Footer;
