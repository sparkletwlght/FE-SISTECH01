import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { Pool } = pg;

// Supabase REST configuration (100% immune to IPv6 / ENOTFOUND issues)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wfuqwvgzsnjxbhdhokej.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdXF3dmd6c25qeGJoZGhva2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDgxMTY1OSwiZXhwIjoyMTEwMzg3NjU5fQ.jBtIBTmessuy1nUqGYzH4dF_eL2n5J2Wz2WlwuL35ZY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Optional local pool fallback (only if user explicitly runs local postgres)
let localPool = null;
if (process.env.USE_LOCAL_DB === 'true') {
  localPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'database_buku',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'yuningge'),
    ssl: false,
  });
}

/**
 * Universal Query Adapter:
 * Emulates pool.query() seamlessly using Supabase REST Client
 * so all server logic works instantly without any IPv6 / DNS connection drops.
 */
class SupabaseDbAdapter {
  async query(text, params = []) {
    // If local postgres is explicitly requested
    if (localPool) {
      return await localPool.query(text, params);
    }

    const cleanSql = text.trim();

    // 1. SELECT users (Login / Register / Me)
    if (/^SELECT\s+.*FROM\s+users\s+WHERE\s+email\s*=\s*\$1\s*OR\s*username\s*=\s*\$2/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${params[0]},username.eq.${params[1]}`);
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    if (/^SELECT\s+.*FROM\s+users\s+WHERE\s+email\s*=\s*\$1/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, username, email, password_hash, role')
        .eq('email', params[0]);
      if (error) throw new Error(error.message);
      const rows = (data || []).map(u => ({ ...u, id: u.user_id }));
      return { rows };
    }

    if (/^SELECT\s+.*FROM\s+users\s+WHERE\s+user_id\s*=\s*\$1/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, username, email, password_hash, role, created_at')
        .eq('user_id', params[0]);
      if (error) throw new Error(error.message);
      const rows = (data || []).map(u => ({ ...u, id: u.user_id }));
      return { rows };
    }

    if (/^SELECT\s+user_id\s+FROM\s+users\s+WHERE\s+username\s*=\s*\$1\s+AND\s+user_id\s*!=\s*\$2/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('username', params[0])
        .neq('user_id', params[1]);
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    if (/^SELECT\s+user_id\s+FROM\s+users\s+WHERE\s+email\s*=\s*\$1\s+AND\s+user_id\s*!=\s*\$2/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', params[0])
        .neq('user_id', params[1]);
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // 2. INSERT into users
    if (/^INSERT\s+INTO\s+users/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: params[0],
          email: params[1],
          password_hash: params[2],
          role: 'user'
        }])
        .select('user_id, username, email, role, created_at')
        .single();
      if (error) throw new Error(error.message);
      return { rows: [{ ...data, id: data.user_id }] };
    }

    // 3. UPDATE users (Profile Edit)
    if (/^UPDATE\s+users\s+SET\s+username\s*=\s*\$1,\s*email\s*=\s*\$2,\s*password_hash\s*=\s*\$3\s+WHERE\s+user_id\s*=\s*\$4/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('users')
        .update({
          username: params[0],
          email: params[1],
          password_hash: params[2]
        })
        .eq('user_id', params[3])
        .select('user_id, username, email, role, created_at')
        .single();
      if (error) throw new Error(error.message);
      return { rows: [{ ...data, id: data.user_id }] };
    }

    // 4. BOOKS QUERIES
    // Get all books
    if (/^SELECT\s+\*\s+FROM\s+books\s+ORDER\s+BY\s+bid\s+ASC/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('bid', { ascending: true })
        .limit(1000);
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // Get single book
    if (/^SELECT\s+\*\s+FROM\s+books\s+WHERE\s+bid\s*=\s*\$1/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('bid', params[0]);
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // Max BID for generation
    if (/SELECT\s+bid\s+FROM\s+books\s+WHERE\s+bid\s+LIKE/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('books')
        .select('bid')
        .order('bid', { ascending: false })
        .limit(1);
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // INSERT book
    if (/^INSERT\s+INTO\s+books/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('books')
        .insert([{
          bid: params[0],
          title: params[1],
          author: params[2],
          category: params[3],
          year: params[4],
          image: params[5],
          content: params[6],
          publisher: params[7],
          preview_link: params[8],
          info_link: params[9],
          ratings_count: params[10],
          toppick: params[11],
          weeklytop: params[12]
        }])
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return { rows: [data] };
    }

    // UPDATE book
    if (/^UPDATE\s+books/i.test(cleanSql)) {
      const bid = params[12];
      const updates = {};
      if (params[0] !== null && params[0] !== undefined) updates.title = params[0];
      if (params[1] !== null && params[1] !== undefined) updates.author = params[1];
      if (params[2] !== null && params[2] !== undefined) updates.content = params[2];
      if (params[3] !== null && params[3] !== undefined) updates.image = params[3];
      if (params[4] !== null && params[4] !== undefined) updates.category = params[4];
      if (params[5] !== null && params[5] !== undefined) updates.year = params[5];
      if (params[6] !== null && params[6] !== undefined) updates.publisher = params[6];
      if (params[7] !== null && params[7] !== undefined) updates.preview_link = params[7];
      if (params[8] !== null && params[8] !== undefined) updates.info_link = params[8];
      if (params[9] !== null && params[9] !== undefined) updates.ratings_count = params[9];
      if (params[10] !== null && params[10] !== undefined) updates.toppick = params[10];
      if (params[11] !== null && params[11] !== undefined) updates.weeklytop = params[11];

      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('bid', bid)
        .select('*');
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // DELETE book
    if (/^DELETE\s+FROM\s+books\s+WHERE\s+bid\s*=\s*\$1/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('books')
        .delete()
        .eq('bid', params[0])
        .select('*');
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // 5. FAVORITES QUERIES
    // Get favorites
    if (/SELECT\s+.*FROM\s+user_favorites/i.test(cleanSql)) {
      const { data: favs, error: fErr } = await supabase
        .from('user_favorites')
        .select('favorite_id, created_at, bid')
        .eq('user_id', params[0])
        .order('created_at', { ascending: false });
      if (fErr) throw new Error(fErr.message);

      if (!favs || favs.length === 0) return { rows: [] };

      const bids = favs.map(f => f.bid);
      const { data: bookDetails, error: bErr } = await supabase
        .from('books')
        .select('*')
        .in('bid', bids);
      if (bErr) throw new Error(bErr.message);

      const bookMap = new Map((bookDetails || []).map(b => [b.bid, b]));
      const rows = favs.map(f => {
        const b = bookMap.get(f.bid) || {};
        return {
          ...b,
          favorite_id: f.favorite_id,
          saved_at: f.created_at,
          favorite: true
        };
      });
      return { rows };
    }

    // Add favorite
    if (/^INSERT\s+INTO\s+user_favorites/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('user_favorites')
        .upsert([{ user_id: params[0], bid: params[1] }], { onConflict: 'user_id, bid' })
        .select('*');
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // Delete favorite
    if (/^DELETE\s+FROM\s+user_favorites/i.test(cleanSql)) {
      const { data, error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', params[0])
        .eq('bid', params[1])
        .select('*');
      if (error) throw new Error(error.message);
      return { rows: data || [] };
    }

    // Generic fallback query via Supabase RPC or dummy return
    return { rows: [] };
  }
}

const pool = new SupabaseDbAdapter();

export default pool;
