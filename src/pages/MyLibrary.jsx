import BookCard from "../components/BookCard";
import books from "../data/books.js";

const shuffled = [...books].sort(()=> Math.random()-0.5);
const readingBooks = shuffled.slice(0, 6);
const finishedBooks = shuffled.slice(6, 12);

function MyLibrary({ favorites, setFavorites }) {
    //const readingBooks = books.filter(book => book.status === "reading");
    //const finishedBooks = books.filter(book => book.status === "finished");
    return( 
        <>
            <h2 className="text4"> Continue Reading </h2>
            <div className="still-reading"> 
                <div className="library-grid">
                    {readingBooks.map(book =>(
                        <BookCard key={book.id} {...book}
                        favorites={favorites} 
                        setFavorites={setFavorites} />
                    ))}
                </div>
            </div>
            <div className="finished-reading">
                <h2 className="text4"> Finished Reading </h2>
                <div className="library-grid">
                    {finishedBooks.map(book =>(
                        <BookCard key={book.id} {...book}
                        favorites={favorites}
                        setFavorites={setFavorites} />
                    ))}
                </div>
            </div>
        </>
    );
}

export default MyLibrary;