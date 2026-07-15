import { FaSearch } from "react-icons/fa";
import "../App.css";

function SearchBar({ search, setSearch }) {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />

      <input
        type="text"
        placeholder="Search book..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;