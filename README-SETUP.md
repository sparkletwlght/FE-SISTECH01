# Setup Guide - Bibliotheca dengan PostgreSQL

## Prerequisites
1. **PostgreSQL** harus sudah terinstall
2. **Node.js** (v18 atau lebih baru)

## Langkah-langkah Setup

### 1. Setup Database PostgreSQL

#### Opsi A: Menggunakan psql (Command Line)
```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE database_buku;

# Keluar dan jalankan script init
\q

# Jalankan init script
psql -U postgres -d database_buku -f server/init-db.sql
```

#### Opsi B: Menggunakan pgAdmin
1. Buka pgAdmin
2. Klik kanan pada "Databases" → Create → Database
3. Nama database: `database_buku`
4. Klik Save
5. Klik kanan pada database `database_buku` → Query Tool
6. Buka file `server/init-db.sql` dan copy-paste isinya
7. Tekan F5 atau klik tombol Execute

### 2. Setup Backend Server

```bash
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Cek file .env sudah benar (password: yuningge)
# DB_PASSWORD=yuningge
# DB_NAME=database_buku

# Jalankan server
npm start
```

Server akan berjalan di `http://localhost:3001`

### 3. Setup Frontend

```bash
# Buka terminal baru, kembali ke root folder
cd ..

# Install dependencies (jika belum)
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Testing

### Test Backend API
```bash
# Test health check
curl http://localhost:3001/api/health

# Test get books
curl http://localhost:3001/api/books
```

### Test Frontend
1. Buka browser: `http://localhost:5173`
2. Klik "Register" untuk membuat akun baru
3. Login dengan akun yang dibuat
4. Coba fitur-fitur:
   - Browse books di Book List
   - Add to favorites
   - Admin dashboard (CRUD books)

## Struktur Database

### Tabel Users
- id (SERIAL)
- username (VARCHAR)
- email (VARCHAR)
- password (VARCHAR - hashed)
- created_at (TIMESTAMP)

### Tabel Books
- id (SERIAL)
- title (VARCHAR)
- authors (VARCHAR)
- description (TEXT)
- image (VARCHAR)
- categories (VARCHAR)
- published_date (VARCHAR)
- publisher (VARCHAR)
- preview_link (VARCHAR)
- info_link (VARCHAR)
- ratings_count (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Tabel User_Favorites
- id (SERIAL)
- user_id (INTEGER FK)
- book_id (INTEGER FK)
- created_at (TIMESTAMP)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (protected)
- `PUT /api/books/:id` - Update book (protected)
- `DELETE /api/books/:id` - Delete book (protected)

### Favorites
- `GET /api/favorites` - Get user favorites (protected)
- `POST /api/favorites/:bookId` - Add to favorites (protected)
- `DELETE /api/favorites/:bookId` - Remove from favorites (protected)

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL service sudah running
- Cek password di `server/.env` (yuningge)
- Cek nama database: `database_buku`

### Port Already in Use
- Backend: Ubah PORT di `server/.env`
- Frontend: Ubah port di `vite.config.js`

### CORS Error
- Pastikan backend server sudah running
- Cek URL di frontend: `http://localhost:3001/api`

## Production Deployment

Untuk deploy ke production:

1. Ubah `JWT_SECRET` di `server/.env` dengan value yang kuat
2. Update `VITE_API_URL` di `.env` dengan URL production API
3. Setup PostgreSQL di hosting (misalnya Railway, Supabase, atau Heroku)
4. Deploy backend ke service seperti Railway, Render, atau Heroku
5. Deploy frontend ke Vercel atau Netlify
6. Update environment variables di masing-masing platform

## Catatan Keamanan

⚠️ **PENTING untuk Production:**
- Ganti `JWT_SECRET` dengan string random yang kuat
- Jangan commit file `.env` ke git
- Gunakan HTTPS untuk production
- Implementasi rate limiting untuk API
- Validasi input di backend
- Gunakan prepared statements (sudah implemented dengan pg)
