import books from "../data/books.js";
import BookCard from "../components/BookCard";

function Favorite({ favorites = [], setFavorites = () => {} }) {
  const favoriteBooks = Array.isArray(favorites)
    ? books.filter(book => favorites && favorites.includes(book.id))
    : [];

  return (
    <div className="main">
      <h1 className="text4"> My Favorite </h1>
      {
        favoriteBooks.length > 0 ? (
          <div className="books">
            {favoriteBooks.map(book => (
              <BookCard
                key={book.id}
                {...book}
                favorites={favorites}
                setFavorites={setFavorites}
              />
            ))}
          </div>
        ) : (
          <h2 className="no-books">
            You don't have any favorite books yet.
          </h2>
        )
      }
    </div>
  );
}

export default Favorite;