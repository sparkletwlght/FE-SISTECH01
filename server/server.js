import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10kb' })); // limit body size

// ── Simple in-memory rate limiter (Broken Access Control Prevention) ──
// Max 10 login attempts per IP per 15 minutes
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };

  // Reset window jika sudah lewat 15 menit
  if (now - record.firstAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  record.count++;
  loginAttempts.set(ip, record);

  if (record.count > maxAttempts) {
    const retryAfter = Math.ceil((windowMs - (now - record.firstAttempt)) / 1000);
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`,
    });
  }
  next();
}

// ── Password validator (server-side) ──
function validatePasswordStrength(password) {
  if (!password || password.length < 8)
    return 'Password minimal 8 karakter.';
  if (!/[A-Z]/.test(password))
    return 'Password harus mengandung huruf kapital (A-Z).';
  if (!/[0-9]/.test(password))
    return 'Password harus mengandung angka (0-9).';
  if (!/[^A-Za-z0-9]/.test(password))
    return 'Password harus mengandung karakter spesial (!@#$...).';
  return null; // valid
}

// ── Username validator ──
function validateUsername(username) {
  if (!username || username.trim().length < 3)
    return 'Username minimal 3 karakter.';
  if (username.length > 30)
    return 'Username maksimal 30 karakter.';
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return 'Username hanya boleh huruf, angka, dan underscore (_).';
  return null;
}

// Helper to normalize book data for frontend
function mapBookRow(row) {
  if (!row) return null;
  const cleanCategory = (row.category || '').replace(/^'|'$/g, '');
  const cleanAuthor = (row.author || '').replace(/^'|'$/g, '');
  return {
    id: row.bid,
    bid: row.bid,
    title: row.title,
    authors: cleanAuthor,
    author: cleanAuthor,
    categories: cleanCategory,
    category: cleanCategory,
    published_date: row.year ? String(row.year) : (row.published_date || ''),
    year: row.year,
    image: row.image,
    description: row.content || row.description || '',
    content: row.content || row.description || '',
    publisher: row.publisher || '',
    preview_link: row.preview_link || '',
    info_link: row.info_link || '',
    ratings_count: row.ratings_count ?? null,
    favorite: Boolean(row.favorite),
    toppick: Boolean(row.toppick),
    weeklytop: Boolean(row.weeklytop),
  };
}

// ============= AUTH ROUTES =============

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }

  // Validasi username
  const usernameErr = validateUsername(username);
  if (usernameErr) return res.status(400).json({ error: usernameErr });

  // Validasi email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid.' });
  }

  // Validasi password strength
  const pwErr = validatePasswordStrength(password);
  if (pwErr) return res.status(400).json({ error: pwErr });

  try {
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user matching database_buku schema
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING user_id AS id, username, email, role, created_at`,
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'bibliotheca_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Login — dilindungi rate limiter
app.post('/api/auth/login', rateLimitLogin, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  // Validasi format dasar (cegah brute force dengan input aneh)
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Input tidak valid.' });
  }

  if (password.length < 8) {
    // Langsung tolak tanpa hit DB
    return res.status(401).json({ error: 'Kredensial tidak valid.' });
  }

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT user_id AS id, username, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'bibliotheca_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id AS id, username, email, role, created_at FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile (current authenticated user only - Broken Access Control safe)
app.put('/api/auth/me', authenticateToken, async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;

  if (!username && !email && !newPassword) {
    return res.status(400).json({ error: 'Tidak ada data yang diubah.' });
  }

  try {
    // 1. Get current user data from database
    const userResult = await pool.query(
      'SELECT user_id, username, email, password_hash, role FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const currentUser = userResult.rows[0];

    // 2. Validate username if provided
    let updatedUsername = currentUser.username;
    if (username && username !== currentUser.username) {
      const uErr = validateUsername(username);
      if (uErr) return res.status(400).json({ error: uErr });

      // Check username collision
      const checkU = await pool.query(
        'SELECT user_id FROM users WHERE username = $1 AND user_id != $2',
        [username, req.user.id]
      );
      if (checkU.rows.length > 0) {
        return res.status(409).json({ error: 'Username sudah digunakan orang lain.' });
      }
      updatedUsername = username;
    }

    // 3. Validate email if provided
    let updatedEmail = currentUser.email;
    if (email && email !== currentUser.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Format email tidak valid.' });
      }

      // Check email collision
      const checkE = await pool.query(
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
        [email, req.user.id]
      );
      if (checkE.rows.length > 0) {
        return res.status(409).json({ error: 'Email sudah terdaftar pada akun lain.' });
      }
      updatedEmail = email;
    }

    // 4. Handle password change if requested
    let updatedPasswordHash = currentUser.password_hash;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Password saat ini harus diisi untuk mengubah password.' });
      }

      const isCurrentPwValid = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!isCurrentPwValid) {
        return res.status(401).json({ error: 'Password saat ini salah.' });
      }

      const pwErr = validatePasswordStrength(newPassword);
      if (pwErr) return res.status(400).json({ error: pwErr });

      updatedPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    // 5. Update user in DB
    const updateRes = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, password_hash = $3
       WHERE user_id = $4
       RETURNING user_id AS id, username, email, role, created_at`,
      [updatedUsername, updatedEmail, updatedPasswordHash, req.user.id]
    );

    const updatedUser = updateRes.rows[0];

    // 6. Generate refreshed JWT token with updated info
    const newToken = jwt.sign(
      { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET || 'bibliotheca_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
      token: newToken,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// ============= BOOKS ROUTES =============

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY bid ASC');
    res.json(result.rows.map(mapBookRow));
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE bid = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(mapBookRow(result.rows[0]));
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Create book (protected — admin only)
app.post('/api/books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const {
    title, authors, author, description, content, image,
    categories, category, published_date, year,
    publisher, preview_link, info_link, ratings_count,
    toppick, weeklytop,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const bookAuthor = authors || author || 'Unknown Author';
  const bookCategory = categories || category || 'General';
  const bookDesc = description || content || '';
  const parsedYear = parseInt(year || published_date) || new Date().getFullYear();

  try {
    // Generate new bid (e.g. B0501)
    const countResult = await pool.query(
      "SELECT bid FROM books WHERE bid LIKE 'B%' ORDER BY bid DESC LIMIT 1"
    );
    let nextBid = 'B0001';
    if (countResult.rows.length > 0) {
      const lastBid = countResult.rows[0].bid;
      const num = (parseInt(lastBid.replace(/\D/g, '')) || 0) + 1;
      nextBid = 'B' + String(num).padStart(4, '0');
    }

    const result = await pool.query(
      `INSERT INTO books (bid, title, author, category, year, image, content, publisher, preview_link, info_link, ratings_count, toppick, weeklytop)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        nextBid, title, bookAuthor, bookCategory, parsedYear,
        image || '', bookDesc, publisher || '', preview_link || '', info_link || '',
        ratings_count || null,
        Boolean(toppick),
        Boolean(weeklytop),
      ]
    );

    res.status(201).json(mapBookRow(result.rows[0]));
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Update book (protected — admin only)
app.put('/api/books/:id', authenticateToken, async (req, res) => {
  // Role check
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  const {
    title, authors, author, description, content,
    image, categories, category, published_date, year,
    publisher, preview_link, info_link, ratings_count,
    toppick, weeklytop,
  } = req.body;

  const bookAuthor   = authors || author || '';
  const bookCategory = categories || category || '';
  const bookDesc     = description || content || '';
  const parsedYear   = parseInt(year || published_date) || null;

  // toppick / weeklytop: bisa true/false dikirim dari form
  const topPickVal   = toppick   !== undefined ? Boolean(toppick)   : null;
  const weeklyTopVal = weeklytop !== undefined ? Boolean(weeklytop) : null;

  try {
    const result = await pool.query(
      `UPDATE books 
       SET title        = COALESCE($1, title),
           author       = COALESCE($2, author),
           content      = COALESCE($3, content),
           image        = COALESCE($4, image),
           category     = COALESCE($5, category),
           year         = COALESCE($6, year),
           publisher    = COALESCE($7, publisher),
           preview_link = COALESCE($8, preview_link),
           info_link    = COALESCE($9, info_link),
           ratings_count= COALESCE($10, ratings_count),
           toppick      = COALESCE($11, toppick),
           weeklytop    = COALESCE($12, weeklytop)
       WHERE bid = $13
       RETURNING *`,
      [
        title, bookAuthor, bookDesc, image, bookCategory,
        parsedYear, publisher, preview_link, info_link,
        ratings_count ?? null,
        topPickVal, weeklyTopVal,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(mapBookRow(result.rows[0]));
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Delete book (protected — admin only)
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  try {
    const result = await pool.query('DELETE FROM books WHERE bid = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// ============= FAVORITES ROUTES =============

// Get user favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         uf.favorite_id,
         uf.created_at AS saved_at,
         b.* 
       FROM user_favorites uf
       JOIN books b ON uf.bid = b.bid
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows.map(mapBookRow));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Add to favorites
app.post('/api/favorites/:bookId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO user_favorites (user_id, bid) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, bid) DO NOTHING 
       RETURNING *`,
      [req.user.id, req.params.bookId]
    );

    res.status(201).json({ message: 'Added to favorites', favorite: result.rows[0] });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Remove from favorites
app.delete('/api/favorites/:bookId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND bid = $2 RETURNING *',
      [req.user.id, req.params.bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', database: 'database_buku' });
});

// Root check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Bibliotheca API running' });
});

// Start server if not running in serverless / test mode
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
