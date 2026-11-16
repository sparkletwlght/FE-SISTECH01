# 🚀 Deployment Guide: Bibliotheca ke Vercel & Koneksi Database

Panduan ini menjelaskan arsitektur dan langkah agar saat project di-deploy ke **Vercel**, API dan Database PostgreSQL **tetap terhubung langsung tanpa putus**.

---

## 1. Arsitektur Vercel + Backend Serverless

Project ini sudah dirancang dengan struktur monorepo / serverless Vercel:

```text
sistech-hands-on-01/
├── api/
│   └── index.js       <-- Entry point Serverless Function Vercel (me-route Express app)
├── server/
│   ├── db.js          <-- Menghandle Pool koneksi PostgreSQL (SSL / non-SSL otomatis)
│   ├── server.js      <-- Express App (Auth, Books CRUD, Favorites, Profile Edit)
│   └── middleware/
├── vercel.json        <-- Rule routing Vercel: /api/* -> api/index.js, sisanya ke React SPA
└── src/               <-- React Frontend
```

---

## 2. Kenapa Database di Vercel Bisa Putus / Gagal Konek? (Dan Solusinya)

1. **Localhost vs Public Cloud DB**:
   - Jika DB Anda masih di `localhost:5432` laptop Anda, server Vercel (yang ada di cloud internet) tentu **tidak bisa** mengakses `localhost` laptop Anda.
   - **Solusi**: Gunakan database PostgreSQL online gratis / cloud seperti **Supabase**, **Neon.tech**, **Aiven**, atau **Railway**.
2. **Koneksi SSL**:
   - Provider database online (seperti Neon / Supabase / Aiven) mewajibkan koneksi terenkripsi (SSL).
   - `server/db.js` sudah diset otomatis: jika mendeteksi `DATABASE_URL` atau lingkungan production di Vercel, SSL otomatis diaktifkan dengan `{ rejectUnauthorized: false }`.

---

## 3. Langkah Setup Database Cloud (Contoh: Supabase / Neon)

1. Buat database baru di [Neon.tech](https://neon.tech) atau [Supabase](https://supabase.com) (Gratis).
2. Jalankan query SQL database buku Anda di SQL Editor (tabel `books`, `users`, `user_favorites`).
3. Dapatkan **Connection String (URI)**, bentuknya seperti:
   ```text
   postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## 4. Setting Environment Variables di Vercel Dashboard

Saat Anda menghubungkan repo GitHub Anda ke Vercel:

1. Buka project Anda di dashboard **Vercel** -> Masuk ke tab **Settings** -> **Environment Variables**.
2. Tambahkan variabel berikut:

| Key | Value (Contoh) | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgres://user:pass@host:5432/dbname?sslmode=require` | Connection string PostgreSQL cloud Anda |
| `JWT_SECRET` | `bibliotheca_secret_key_2026_super_secure` | Secret token untuk auth JWT |
| `NODE_ENV` | `production` | Otomatis mengaktifkan mode serverless |

> 💡 **Penting:** Tidak perlu mengubah apa pun di kode React! Frontend memanggil `/api/*` secara relatif, dan `vercel.json` otomatis mengarahkan panggilan tersebut ke serverless function tanpa masalah CORS ataupun putus koneksi.
