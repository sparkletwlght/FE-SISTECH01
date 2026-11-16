# Quick Start Guide 🚀

## Langkah Cepat untuk Memulai

### 1. Setup Database (Hanya Sekali)

#### Buat Database
```bash
psql -U postgres
```

Di dalam psql:
```sql
CREATE DATABASE database_buku;
\q
```

#### Jalankan Init Script
```bash
psql -U postgres -d database_buku -f server/init-db.sql
```

✅ Database sekarang sudah siap dengan sample books!

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
cd ..
```

#### Frontend (di root folder)
```bash
npm install
```

### 3. Jalankan Aplikasi

#### Opsi A: Manual (2 Terminal)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Opsi B: Otomatis (PowerShell Script)

```powershell
.\start-dev.ps1
```

Script ini akan membuka 2 window baru untuk backend dan frontend.

### 4. Test Aplikasi

1. Buka browser: **http://localhost:5173**
2. Klik **"Register"** di navbar
3. Buat akun baru:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
4. Login dengan akun tersebut
5. Selamat! Anda sudah bisa menggunakan aplikasi 🎉

## Fitur yang Tersedia

### Tanpa Login:
- ✅ Browse Home Page
- ✅ Lihat daftar buku (Book List)
- ✅ Lihat detail buku

### Dengan Login:
- ✅ Semua fitur di atas
- ✅ Add books to favorites
- ✅ My Library (koleksi pribadi)
- ✅ My Favorites
- ✅ Profile page
- ✅ Admin Dashboard (CRUD books)

## Default Credentials Database

- **Host:** localhost
- **Port:** 5432
- **Database:** database_buku
- **User:** postgres
- **Password:** yuningge

## Troubleshooting

### Backend tidak bisa start:
```bash
# Cek apakah PostgreSQL running
psql -U postgres -l

# Cek password di server/.env
# Pastikan DB_PASSWORD=yuningge
```

### Frontend tidak connect ke backend:
```bash
# Cek apakah backend sudah running di http://localhost:3001
curl http://localhost:3001/api/health

# Response harus: {"status":"ok","message":"Server is running"}
```

### Port sudah digunakan:
```bash
# Cari proses yang menggunakan port 3001
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <PID_NUMBER> /F
```

## Sample Data

Database sudah include 5 sample books:
1. To Kill a Mockingbird - Harper Lee
2. 1984 - George Orwell
3. The Great Gatsby - F. Scott Fitzgerald
4. Pride and Prejudice - Jane Austen
5. The Catcher in the Rye - J.D. Salinger

## Next Steps

- Tambah lebih banyak buku via Admin Dashboard
- Customize UI di `src/styles/`
- Tambah fitur baru sesuai kebutuhan
- Deploy ke production (lihat README-SETUP.md)

---

📚 **Happy Reading!**
