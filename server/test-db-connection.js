import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

console.log('🔍 Testing PostgreSQL connection...\n');
console.log('Configuration:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log(`  Password: ${'*'.repeat(process.env.DB_PASSWORD.length)}\n`);

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Test if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No tables found!');
      console.log('Please run the initialization script:');
      console.log('  psql -U postgres -d database_buku -f server/init-db.sql\n');
    } else {
      console.log('📊 Tables found:');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      console.log();

      // Check book count
      const bookCount = await client.query('SELECT COUNT(*) FROM books');
      console.log(`📚 Books in database: ${bookCount.rows[0].count}`);

      // Check user count
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Users in database: ${userCount.rows[0].count}`);
    }

    client.release();
    await pool.end();
    
    console.log('\n✨ Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    
    if (error.code === '3D000') {
      console.log('\n💡 Database does not exist. Please create it:');
      console.log('  psql -U postgres -c "CREATE DATABASE database_buku;"');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Check your password in server/.env');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL is not running. Please start the PostgreSQL service.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
