import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function BookCard({
  id,
  title,
  author,
  category,
  year,
  image,
  favorites = [],
  setFavorites = () => {},
}) {
  let srcToUse = image;

  if (
    !srcToUse ||
    (typeof srcToUse === "string" &&
      srcToUse.includes("picsum.photos"))
  ) {
    srcToUse = `https://placehold.co/300x400/e0e0e0/333333?text=${encodeURIComponent(
      title
    )}`;
  }

  const isFavorite = favorites.includes(id);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="book-card">
      <button className="favorite-btn" onClick={toggleFavorite}>
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>

      <Link to={`/book/${id}`} className="book-link">
        <h3 className="book-title">{title}</h3>

        <img
          src={srcToUse}
          alt={title}
          className="book-image"
        />

        <p>Writer: {author}</p>
        <p>Category: {category}</p>
        <p>Year: {year}</p>
      </Link>
    </div>
  );
}

export default BookCard;