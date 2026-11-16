-- ==========================================================
-- SKEMA LENGKAP BIBLIOTHECA UNTUK SUPABASE
-- Jalankan script ini di SQL Editor dashboard Supabase Anda
-- ==========================================================

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel books
CREATE TABLE IF NOT EXISTS books (
    bid VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    category VARCHAR(100),
    year INT,
    image VARCHAR(500),
    content TEXT,
    favorite BOOLEAN DEFAULT FALSE,
    toppick BOOLEAN DEFAULT FALSE,
    weeklytop BOOLEAN DEFAULT FALSE,
    publisher VARCHAR(255),
    preview_link VARCHAR(500),
    info_link VARCHAR(500),
    ratings_count INT DEFAULT NULL
);

-- 3. Tabel user_favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bid VARCHAR(20) NOT NULL REFERENCES books(bid) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, bid)
);

-- Index agar performa cepat
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_toppick ON books(toppick);
CREATE INDEX IF NOT EXISTS idx_books_weeklytop ON books(weeklytop);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
