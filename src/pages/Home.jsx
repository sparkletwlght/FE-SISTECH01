//import { useState } from "react";
import "../App.css";

import books from "../data/books.js";
import BookCard from "../components/BookCard";
import Banner2 from "../images/Banner2.png";
import Banner1 from "../images/Banner1.png";
import Banner3 from "../images/Banner3.png";

import t2 from "../images/t2.png";
import t1 from "../images/t1.png";
import t3 from "../images/t3.png";

import w3 from "../images/w3.png";
import w1 from "../images/w1.png";
import w2 from "../images/w2.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

//import { Link } from "react-router-dom";


function Home({ favorites, setFavorites }) {
  const forYouBooks = books
    .filter(book =>
        ["Programming","Computer Science"].includes(book.category))
    .slice(0,12);

  return (
    <>
      <div className="main">
        <h1 className="text1"> Welcome to Bibliotheca! </h1>
        <p className="text2">Welcome Bi-readers, enjoy your time at this site</p>
        
          <div className="promotion">
              <Swiper modules={[Autoplay]} 
                autoplay={{
                  delay: 3000, 
                  disableOnInteraction: false,
                  }} 
                loop={true}>
                <SwiperSlide>
                  <img src={Banner1} alt="banner1" className="banner-1" />
                </SwiperSlide>
                <SwiperSlide>
                  <img src={Banner2} alt="banner2" className="banner-2" />
                </SwiperSlide>
                <SwiperSlide>
                  <img src={Banner3} alt="banner3" className="banner-3" />
                </SwiperSlide>
              </Swiper>
          </div>

          <p className="text-desc"> 
            Welcome to Bibliotheca — a modern digital library built for readers, learners, 
            and book enthusiasts who are passionate about discovering knowledge through books. 
            Our mission is to create a simple, accessible, 
            and enjoyable reading platform where everyone can explore a diverse collection of books across various genres, 
            including fiction, fantasy, programming, finance, self-improvement, science, history, and many more.
            
            <br /> 
            <br />
            Bibliotheca is designed with a clean and user-friendly interface, making it easy for users to search for books, 
            browse curated collections, save their favorite titles, and build a personalized reading library. 
            Whether you're looking for timeless literary classics, bestselling novels, educational references, or books that inspire personal growth, 
            Bibliotheca provides a seamless experience to help you find your next great read.

            <br /> 
            <br />
            Beyond being a digital bookshelf, Bibliotheca aims to encourage a lifelong reading habit by making knowledge more organized, 
            engaging, and accessible. Through carefully curated recommendations such as Top Picks, Weekly Favorites, and Featured Collections, 
            readers can easily discover books loved by the community and uncover hidden gems across different categories.

            <br />
            <br /> 
            At Bibliotheca, we believe that every book has the power to inspire new ideas, broaden perspectives, and transform lives. 
            Whether you are a student searching for academic resources, a professional expanding your expertise, 
            or simply someone who enjoys getting lost in a great story, Bibliotheca is your trusted companion on every reading journey. 
            Start exploring today and discover a world where knowledge, imagination, and inspiration come together in one digital library.
          </p>

          <div className="toppick">
            <h2 className="text3"> Top Picks </h2>
              <ul className="top">
                <img src={t2} alt="t2" className="t2" />
                <img src={t1} alt="t1" className="t1" />
                <img src={t3} alt="t3" className="t3" />
              </ul>
          </div>

          <div className="topweekly">
            <h2 className="text3"> Weekly Top </h2>
              <ul className="top">
                <img src={w2} alt="w2" className="w2" />
                <img src={w1} alt="w1" className="w1" />
                <img src={w3} alt="w3" className="w3" />
              </ul>
          </div>

          <div className="foryou">
            <h2 className="text3"> For You </h2>
              <ul className="pick">
                <div className="for-you-list">
                  {forYouBooks.map((book) => (
                    <BookCard key={book.id} {...book}
                      favorites={favorites} 
                      setFavorites={setFavorites} />
                  ))}
                </div>
              </ul>
          </div>
      </div>
    </>
  );
}

export default Home;