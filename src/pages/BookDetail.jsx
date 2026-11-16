import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "../context/BookContext";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, loading } = useBooks();

  if (loading) return <p className="no-books">Loading...</p>;

  const book = books.find((b) => String(b.id) === String(id));
  if (!book) return <h2 className="no-books">Book not found</h2>;

  let srcToUse = book.image;
  if (!srcToUse || srcToUse.includes("picsum.photos")) {
    srcToUse = `https://placehold.co/300x400/e0e0e0/333333?text=${encodeURIComponent(book.title)}`;
  }

  return (
    <div className="book-detail">
      <img src={srcToUse} alt={book.title} className="book-image" />

      <h2>{book.title}</h2>
      <p><strong>Author:</strong> {book.authors}</p>
      <p><strong>Publisher:</strong> {book.publisher}</p>
      <p><strong>Year:</strong> {book.published_date}</p>
      <p><strong>Category:</strong> {book.categories}</p>
      {book.ratings_count && (
        <p><strong>Ratings:</strong> {book.ratings_count.toLocaleString()} ratings</p>
      )}
      <p><strong>Description:</strong> {book.description}</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        {book.preview_link && (
          <a href={book.preview_link} target="_blank" rel="noreferrer">
            <button className="read-more">Preview Book</button>
          </a>
        )}
        {book.info_link && (
          <a href={book.info_link} target="_blank" rel="noreferrer">
            <button className="read-more">More Info</button>
          </a>
        )}
        <button className="read-more" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
}

export default BookDetail;
