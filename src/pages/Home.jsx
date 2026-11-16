import "../App.css";
import BookCard from "../components/BookCard";
import Banner2 from "../images/Banner2.png";
import Banner1 from "../images/Banner1.png";
import Banner3 from "../images/Banner3.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useBooks } from "../context/BookContext";
import { Link } from "react-router-dom";

function Home() {
  const { books, loading } = useBooks();

  // ── Top Picks dari DB (kolom toppick = true) ──
  const topPickBooks = books.filter((b) => b.toppick === true).slice(0, 3);

  // ── Weekly Top dari DB (kolom weeklytop = true) ──
  const weeklyTopBooks = books.filter((b) => b.weeklytop === true).slice(0, 3);

  // ── For You: filter berdasarkan kategori relevan ──
  const matchedBooks = books.filter((book) =>
    ["Programming", "Computer Science", "Computers", "Fiction", "Business & Economics"].some((cat) =>
      book.categories?.toLowerCase().includes(cat.toLowerCase())
    )
  );
  const forYouBooks = (matchedBooks.length > 0 ? matchedBooks : books).slice(0, 12);

  return (
    <div className="main">
      <h1 className="text1">Welcome to Bibliotheca!</h1>
      <p className="text2">Welcome Bi-readers, enjoy your time at this site</p>

      {/* Banner Swiper */}
      <div className="promotion">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
        >
          <SwiperSlide><img src={Banner1} alt="banner1" className="banner-1" /></SwiperSlide>
          <SwiperSlide><img src={Banner2} alt="banner2" className="banner-2" /></SwiperSlide>
          <SwiperSlide><img src={Banner3} alt="banner3" className="banner-3" /></SwiperSlide>
        </Swiper>
      </div>

      <p className="text-desc">
        Welcome to Bibliotheca — a modern digital library built for readers,
        learners, and book enthusiasts who are passionate about discovering
        knowledge through books. Our mission is to create a simple, accessible,
        and enjoyable reading platform where everyone can explore a diverse
        collection of books across various genres, including fiction, fantasy,
        programming, finance, self-improvement, science, history, and many more.
        <br /><br />
        Bibliotheca is designed with a clean and user-friendly interface, making
        it easy for users to search for books, browse curated collections, save
        their favorite titles, and build a personalized reading library.
        <br /><br />
        At Bibliotheca, we believe that every book has the power to inspire new
        ideas, broaden perspectives, and transform lives. Start exploring today
        and discover a world where knowledge, imagination, and inspiration come
        together in one digital library.
      </p>

      {/* ── Top Picks ── */}
      <div className="toppick">
        <h2 className="text3">Top Picks</h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#718096' }}>Loading...</p>
        ) : topPickBooks.length > 0 ? (
          <div className="home-book-row">
            {topPickBooks.map((book) => (
              <Link to={`/book/${book.id}`} key={book.id} className="home-book-cover-link">
                <div className="home-book-cover">
                  {book.image ? (
                    <img src={book.image} alt={book.title} />
                  ) : (
                    <div className="home-book-cover-placeholder">{book.title?.[0]}</div>
                  )}
                  <div className="home-book-cover-label">
                    <span>{book.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#718096' }}>
            Belum ada Top Picks di database.
          </p>
        )}
      </div>

      {/* ── Weekly Top ── */}
      <div className="topweekly">
        <h2 className="text3">Weekly Top</h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#718096' }}>Loading...</p>
        ) : weeklyTopBooks.length > 0 ? (
          <div className="home-book-row">
            {weeklyTopBooks.map((book) => (
              <Link to={`/book/${book.id}`} key={book.id} className="home-book-cover-link">
                <div className="home-book-cover">
                  {book.image ? (
                    <img src={book.image} alt={book.title} />
                  ) : (
                    <div className="home-book-cover-placeholder">{book.title?.[0]}</div>
                  )}
                  <div className="home-book-cover-label">
                    <span>{book.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#718096' }}>
            Belum ada Weekly Top di database.
          </p>
        )}
      </div>

      {/* ── For You ── */}
      <div className="foryou">
        <h2 className="text3">For You</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading...</p>
        ) : (
          <div className="for-you-list">
            {forYouBooks.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
