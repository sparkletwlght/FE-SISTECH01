-- Create database (run this separately in psql or pgAdmin)
-- CREATE DATABASE database_buku;

-- Connect to database_buku and run the following:

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  authors VARCHAR(255),
  description TEXT,
  image VARCHAR(500),
  categories VARCHAR(255),
  published_date VARCHAR(50),
  publisher VARCHAR(255),
  preview_link VARCHAR(500),
  info_link VARCHAR(500),
  ratings_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User favorites table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Insert sample books
INSERT INTO books (title, authors, description, image, categories, published_date, publisher) VALUES
('To Kill a Mockingbird', 'Harper Lee', 'A classic novel of a lawyer defending a black man accused of a crime in the American South.', 'https://covers.openlibrary.org/b/id/8228691-L.jpg', 'Fiction', '1960', 'J. B. Lippincott & Co.'),
('1984', 'George Orwell', 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', 'Fiction', '1949', 'Secker & Warburg'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.', 'https://covers.openlibrary.org/b/id/7222278-L.jpg', 'Fiction', '1925', 'Charles Scribner''s Sons'),
('Pride and Prejudice', 'Jane Austen', 'A romantic novel following the character development of Elizabeth Bennet.', 'https://covers.openlibrary.org/b/id/8235657-L.jpg', 'Romance', '1813', 'T. Egerton'),
('The Catcher in the Rye', 'J.D. Salinger', 'A story about teenage rebellion and alienation told by Holden Caulfield.', 'https://covers.openlibrary.org/b/id/8494731-L.jpg', 'Fiction', '1951', 'Little, Brown and Company');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_categories ON books(categories);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
