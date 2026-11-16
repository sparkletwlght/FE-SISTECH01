import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, fallback to root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// Support both DATABASE_URL (for Vercel / Supabase / Cloud DB) and individual credentials (localhost)
const DEFAULT_SUPABASE_URL = 'postgresql://postgres:Liuyuning12@db.wfuqwvgzsnjxbhdhokej.supabase.co:5432/postgres';

const dbUrl = process.env.DATABASE_URL || (process.env.USE_LOCAL_DB === 'true' ? null : DEFAULT_SUPABASE_URL);

const poolConfig = dbUrl
  ? {
      connectionString: dbUrl,
      // Supabase & cloud PostgreSQL require SSL
      ssl: dbUrl.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'database_buku',
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || 'yuningge'),
      ssl: false,
    };

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  // Connected successfully
});

pool.on('error', (err) => {
  console.error('❌ Database idle client error:', err.message);
});

export default pool;
