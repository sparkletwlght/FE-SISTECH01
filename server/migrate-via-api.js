/**
 * MIGRASI KE SUPABASE VIA REST API (HTTP)
 * Tidak butuh koneksi langsung ke database — works 100% tanpa masalah IPv6/port
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

const SUPABASE_URL = 'https://wfuqwvgzsnjxbhdhokej.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdXF3dmd6c25qeGJoZGhva2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDgxMTY1OSwiZXhwIjoyMTEwMzg3NjU5fQ.jBtIBTmessuy1nUqGYzH4dF_eL2n5J2Wz2WlwuL35ZY';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'apikey': SUPABASE_SERVICE_KEY,
  'Prefer': 'resolution=merge-duplicates',
};

// Pool ke Database Lokal
const localPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'database_buku',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'yuningge'),
  ssl: false,
});

async function upsertBatch(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal insert ke ${table}: ${err}`);
  }
  return rows.length;
}

async function runMigration() {
  console.log('🔄 Migrasi via Supabase REST API...\n');

  try {
    // 1. TEST koneksi Supabase
    console.log('📡 Tes koneksi ke Supabase...');
    const test = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1`, { headers });
    if (!test.ok) throw new Error(`Supabase tidak merespons: ${test.status} ${test.statusText}`);
    console.log('✅ Supabase terhubung!\n');

    // 2. USERS
    console.log('👤 Mengambil data users dari local DB...');
    const usersRes = await localPool.query('SELECT * FROM users ORDER BY user_id ASC');
    const users = usersRes.rows.map(u => ({
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      password_hash: u.password_hash,
      role: u.role,
      created_at: u.created_at,
    }));
    console.log(`Ditemukan ${users.length} user. Memindahkan...`);
    await upsertBatch('users', users);
    console.log(`✅ ${users.length} users berhasil dimigrasikan!\n`);

    // 3. BOOKS (dalam batch 50 agar tidak timeout)
    console.log('📚 Mengambil data buku dari local DB...');
    const booksRes = await localPool.query('SELECT * FROM books ORDER BY bid ASC');
    const books = booksRes.rows.map(b => ({
      bid: b.bid,
      title: b.title,
      author: b.author,
      category: b.category,
      year: b.year,
      image: b.image,
      content: b.content,
      favorite: b.favorite,
      toppick: b.toppick,
      weeklytop: b.weeklytop,
      publisher: b.publisher,
      preview_link: b.preview_link,
      info_link: b.info_link,
      ratings_count: b.ratings_count,
    }));
    console.log(`Ditemukan ${books.length} buku. Memindahkan dalam batch...`);

    const BATCH_SIZE = 50;
    let done = 0;
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE);
      await upsertBatch('books', batch);
      done += batch.length;
      console.log(`  ... ${done} / ${books.length} buku`);
    }
    console.log(`✅ ${books.length} buku berhasil dimigrasikan!\n`);

    // 4. USER_FAVORITES
    console.log('⭐ Mengambil data favorit dari local DB...');
    const favsRes = await localPool.query('SELECT * FROM user_favorites ORDER BY favorite_id ASC');
    const favs = favsRes.rows.map(f => ({
      favorite_id: f.favorite_id,
      user_id: f.user_id,
      bid: f.bid,
      created_at: f.created_at,
    }));
    console.log(`Ditemukan ${favs.length} data favorit.`);
    if (favs.length > 0) await upsertBatch('user_favorites', favs);
    console.log(`✅ ${favs.length} favorit berhasil dimigrasikan!\n`);

    console.log('🎉 SELESAI! Semua data sudah ada di Supabase!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    await localPool.end();
  }
}

runMigration();
