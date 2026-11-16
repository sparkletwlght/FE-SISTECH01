import { useState } from "react";
import "../App.css";
import SearchBar from "../components/SearchBar";
import BookCard from "../components/BookCard";
import { useBooks } from "../context/BookContext";

function BookList() {
  const { books, loading } = useBooks();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const booksPerPage = 12;

  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.authors?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  if (loading) return <p className="no-books">Loading books...</p>;

  return (
    <div className="main">
      <h1>Bibliotheca List 👀</h1>
      <p>Enjoy your reading ⋅˚₊‧ ୨🕮୧ ‧₊˚ ⋅⚯ ͛</p>

      <SearchBar
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
      />

      <div className="books">
        {currentBooks.length > 0 ? (
          currentBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))
        ) : (
          <h2 className="no-books">No books found.</h2>
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ◀ Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

export default BookList;
