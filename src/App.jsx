import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import Favorite from "./pages/Favorites";
import BookDetail from "./pages/BookDetail";
import MyLibrary from "./pages/MyLibrary";

import { useState } from "react";
import Profile from "./pages/Profile";

function App() {
  const [favorite, setFavorites] = useState([]);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<BookList favorite={favorite} setFavorites={setFavorites} />} />
        <Route path="/favorite" element={<Favorite favorite={favorite} setFavorites={setFavorites} />} />
        <Route path="/library" element={<MyLibrary />} /> 

        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      <div className="footer-space"></div>

      <Footer />
    </>
  );
}

export default App;