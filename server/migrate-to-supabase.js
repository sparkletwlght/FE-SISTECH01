/**
 * SCRIPT MIGRASI OTOMATIS: DARI LOCAL POSTGRES KE SUPABASE
 * 
 * Cara Penggunaan:
 * 1. Jalankan dulu skema tabel di Supabase SQL Editor (lihat: server/supabase-schema.sql)
 * 2. Jalankan perintah di terminal:
 *    node server/migrate-to-supabase.js "postgresql://postgres:PASSWORD_ANDA@db.wfuqwvgzsnjxbhdhokej.supabase.co:5432/postgres"
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { Pool } = pg;

// Ambil URL supabase dari argumen CLI atau environment variable DATABASE_URL / SUPABASE_DATABASE_URL
const supabaseUrl = process.argv[2] || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

if (!supabaseUrl || supabaseUrl.includes('[YOUR-PASSWORD]')) {
  console.error('\n❌ ERROR: URL Supabase belum lengkap!');
  console.error('Silakan jalankan dengan menyertakan password Supabase Anda, contoh:');
  console.error('node server/migrate-to-supabase.js "postgresql://postgres:Liuyuning12@db.wfuqwvgzsnjxbhdhokej.supabase.co:5432/postgres"\n');
  process.exit(1);
}

// Pool ke Database Lokal
const localPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'database_buku',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'yuningge'),
  ssl: false,
});

// Pool ke Database Supabase
const supabasePool = new Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('🔄 Memulai proses migrasi data dari Local Postgres ke Supabase...\n');

  try {
    // 1. Tes koneksi Supabase
    console.log('📡 Menghubungkan ke Supabase...');
    await supabasePool.query('SELECT 1');
    console.log('✅ Berhasil terhubung ke Supabase!\n');

    // 2. Migrasi Users
    console.log('👤 Mengambil data users dari database lokal...');
    const usersRes = await localPool.query('SELECT * FROM users ORDER BY user_id ASC');
    console.log(`Ditemukan ${usersRes.rows.length} user.`);

    let userCount = 0;
    for (const u of usersRes.rows) {
      await supabasePool.query(
        `INSERT INTO users (user_id, username, email, password_hash, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE 
         SET username = EXCLUDED.username,
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role`,
        [u.user_id, u.username, u.email, u.password_hash, u.role, u.created_at]
      );
      userCount++;
    }
    // Update serial sequence users
    await supabasePool.query(`SELECT setval('users_user_id_seq', (SELECT COALESCE(MAX(user_id), 1) FROM users))`);
    console.log(`✅ Sukses migrasi ${userCount} users.\n`);

    // 3. Migrasi Books
    console.log('📚 Mengambil data buku dari database lokal...');
    const booksRes = await localPool.query('SELECT * FROM books ORDER BY bid ASC');
    console.log(`Ditemukan ${booksRes.rows.length} buku.`);

    let bookCount = 0;
    for (const b of booksRes.rows) {
      await supabasePool.query(
        `INSERT INTO books (bid, title, author, category, year, image, content, favorite, toppick, weeklytop, publisher, preview_link, info_link, ratings_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (bid) DO UPDATE
         SET title = EXCLUDED.title,
             author = EXCLUDED.author,
             category = EXCLUDED.category,
             year = EXCLUDED.year,
             image = EXCLUDED.image,
             content = EXCLUDED.content,
             favorite = EXCLUDED.favorite,
             toppick = EXCLUDED.toppick,
             weeklytop = EXCLUDED.weeklytop,
             publisher = EXCLUDED.publisher,
             preview_link = EXCLUDED.preview_link,
             info_link = EXCLUDED.info_link,
             ratings_count = EXCLUDED.ratings_count`,
        [
          b.bid, b.title, b.author, b.category, b.year, b.image,
          b.content, b.favorite, b.toppick, b.weeklytop,
          b.publisher, b.preview_link, b.info_link, b.ratings_count
        ]
      );
      bookCount++;
      if (bookCount % 100 === 0) {
        console.log(`... sudah migrasi ${bookCount} / ${booksRes.rows.length} buku`);
      }
    }
    console.log(`✅ Sukses migrasi ${bookCount} buku.\n`);

    // 4. Migrasi User Favorites
    console.log('⭐ Mengambil data favorit dari database lokal...');
    const favsRes = await localPool.query('SELECT * FROM user_favorites ORDER BY favorite_id ASC');
    console.log(`Ditemukan ${favsRes.rows.length} data favorit.`);

    let favCount = 0;
    for (const f of favsRes.rows) {
      await supabasePool.query(
        `INSERT INTO user_favorites (favorite_id, user_id, bid, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, bid) DO NOTHING`,
        [f.favorite_id, f.user_id, f.bid, f.created_at]
      );
      favCount++;
    }
    if (favCount > 0) {
      await supabasePool.query(`SELECT setval('user_favorites_favorite_id_seq', (SELECT COALESCE(MAX(favorite_id), 1) FROM user_favorites))`);
    }
    console.log(`✅ Sukses migrasi ${favCount} data favorit.\n`);

    console.log('🎉 SELURUH DATA BERHASIL DIMIGRASIKAN KE SUPABASE!');
    console.log('Langkah berikutnya: masukkan DATABASE_URL ke server/.env atau Vercel Environment Variables.');

  } catch (err) {
    console.error('❌ Gagal saat migrasi:', err.message);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

runMigration();
