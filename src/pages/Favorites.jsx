import BookCard from "../components/BookCard";
import { useBooks } from "../context/BookContext";

function Favorite() {
  const { books, favorites } = useBooks();

  const favoriteIds = Array.isArray(favorites)
    ? favorites.map((f) => String(f?.id || f?.bid || f))
    : [];

  const favoriteBooks = books.filter((book) =>
    favoriteIds.includes(String(book.id || book.bid))
  );

  return (
    <div className="main">
      <h1 className="text4">My Favorite</h1>

      {favoriteBooks.length > 0 ? (
        <div className="books">
          {favoriteBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      ) : (
        <h2 className="no-books">You don&apos;t have any favorite books yet.</h2>
      )}
    </div>
  );
}

export default Favorite;
