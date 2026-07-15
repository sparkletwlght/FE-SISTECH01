import { useParams } from "react-router-dom";
import books from "../data/books.js";

function BookDetail(){ 
    const { id } = useParams();
    const book = books.find(
        (book) => book.id === Number(id)
    );
    if (!book) {
        return <h2> Book not found </h2>;
    }
    let srcToUse = book.image;

    if (
        !srcToUse || (typeof srcToUse === 'string' && 
            srcToUse.includes("picsum.photos")))
        { 
            srcToUse = `https://placehold.co/300x400/e0e0e0/333333?text=${encodeURIComponent(book.title)}`;
        }
    
    return(
        <div className="book-detail">
            <img src={srcToUse} alt={book.title} className="book-image" />

            <h2>{book.title}</h2>
            <p> <strong> Writer:</strong> {book.author}</p>
            <p> <strong> Year:</strong> {book.year}</p>
            <p> <strong> Category:</strong> {book.category}</p>
            <p> <strong> Sneak Peak:</strong> {book.content}</p>

            <button className="read-more"> Read More </button>
        </div>
    )
}

export default BookDetail;