import BookCard from "../components/BookCard";
import { useBooks } from "../context/BookContext";
import { useMemo } from "react";

function MyLibrary() {
  const { books, loading } = useBooks();

  // Shuffle once per mount so it stays stable during the session
  const shuffled = useMemo(
    () => [...books].sort(() => Math.random() - 0.5),
    [books]
  );

  const readingBooks = shuffled.slice(0, 6);
  const finishedBooks = shuffled.slice(6, 12);

  if (loading) return <p className="no-books">Loading...</p>;

  return (
    <>
      <h2 className="text4">Continue Reading</h2>
      <div className="still-reading">
        <div className="library-grid">
          {readingBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>

      <div className="finished-reading">
        <h2 className="text4">Finished Reading</h2>
        <div className="library-grid">
          {finishedBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>
    </>
  );
}

export default MyLibrary;
