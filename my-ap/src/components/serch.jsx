import { useEffect, useRef} from "react";
import { useProvider } from '../context/provider';
import { useNavigate } from "react-router-dom";
import { FaSearch } from 'react-icons/fa';
function Search() {
    const { query, setQuery } = useProvider();
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function callback(e) {
            // Check if the search input is already focused
            if (document.activeElement === searchInputRef.current) {
                return; // If already focused, return early
            }
            // If the Enter key is pressed
            if (e.code === "Enter") {
                searchInputRef.current.focus(); // Focus on the search input
                setQuery(""); // Clear the query
            }
        }

        // Add event listener to the document for keydown events
        document.addEventListener("keydown", callback);

        // Cleanup function: Remove event listener when component unmounts or re-renders
        return () => {
            document.removeEventListener("keydown", callback); // Remove the event listener
        };
    }, [setQuery]);

    const handleSearchClick = () => {
        // Navigate to the product page
        navigate('/product');
    };

    return (
        <div className="relative">
            <input
                className="bg-transparent border border-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Search ..."
                value={query}
                ref={searchInputRef}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button 
                onClick={handleSearchClick} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
            >
            <FaSearch className="text-xl cursor-pointer text-gray-600 hover:text-gray-800" />

            </button>
        </div>
    );
}
  export default Search;