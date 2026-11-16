import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useBooks } from "../context/BookContext";

function BookCard({ id, title, authors, categories, published_date, image }) {
  const { favorites, setFavorites, addToFavorites, removeFromFavorites } = useBooks();

  let srcToUse = image;
  if (!srcToUse || srcToUse.includes("picsum.photos")) {
    srcToUse = `https://placehold.co/300x400/e0e0e0/333333?text=${encodeURIComponent(title)}`;
  }

  const isFavorite = Array.isArray(favorites) && favorites.some((fav) => String(fav?.id || fav?.bid || fav) === String(id));

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      if (removeFromFavorites) await removeFromFavorites(id);
      if (setFavorites) {
        setFavorites((prev) => prev.filter((fav) => String(fav?.id || fav?.bid || fav) !== String(id)));
      }
    } else {
      if (addToFavorites) await addToFavorites(id);
      if (setFavorites) {
        setFavorites((prev) => [...prev, id]);
      }
    }
  };

  return (
    <div className="book-card">
      <button className="favorite-btn" onClick={toggleFavorite}>
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>

      <Link to={`/book/${id}`} className="book-link">
        <h3 className="book-title">{title}</h3>

        <img src={srcToUse} alt={title} className="book-image" />

        <p>Author: {authors}</p>
        <p>Category: {categories}</p>
        <p>Year: {published_date}</p>
      </Link>
    </div>
  );
}

export default BookCard;
