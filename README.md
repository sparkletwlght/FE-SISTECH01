# 📚 Bibliotheca - Book Management System

A modern full-stack book management application dengan Python FastAPI backend dan React frontend.

## ✨ Features

- 🔐 User Authentication (Register/Login dengan JWT)
- 📖 Browse dan search books
- ⭐ Add books to favorites
- 📚 Personal library management
- 👤 User profile
- 🛠️ Admin dashboard untuk CRUD operations
- 🎨 Modern, responsive UI
- 🔒 Secure authentication & authorization

## 🛠️ Tech Stack

**Backend:**
- **Python 3.8+**
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Uvicorn** - ASGI server

**Frontend:**
- **React 19**
- **React Router v7**
- **Context API**
- **Vite**

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Node.js 18+

### Setup dalam 5 Langkah

#### 1️⃣ Create Database

**Via pgAdmin (Recommended):**
1. Buka pgAdmin
2. Create database: `database_buku`
3. Klik kanan database → Query Tool
4. Load file `backend/init_db.sql`
5. Execute (F5)

**Via psql (Command Line):**
```bash
psql -U postgres -c "CREATE DATABASE database_buku;"
psql -U postgres -d database_buku -f backend/init_db.sql
```

#### 2️⃣ Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 3️⃣ Install Frontend Dependencies

```bash
cd ..
npm install
```

#### 4️⃣ Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 3001
```

Backend running di:
- **API**: http://localhost:3001
- **Docs**: http://localhost:3001/docs (Interactive API docs!)

#### 5️⃣ Start Frontend Server

**Terminal baru:**

```bash
npm run dev
```

Frontend running di: **http://localhost:5173**

## 🎉 Test Aplikasi

1. Buka http://localhost:5173
2. Klik **Register** → Buat account baru
3. Login dengan account
4. Explore! 📚

## 📖 Documentation

- **[SETUP-PYTHON.md](SETUP-PYTHON.md)** - Complete setup guide
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **API Docs**: http://localhost:3001/docs (FastAPI auto-generated docs)

## 🔑 Default Configuration

**Database:**
- Host: localhost
- Port: 5432
- Database: database_buku
- User: postgres
- Password: yuningge

**Servers:**
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 📁 Project Structure

```
sistech-hands-on-01/
├── backend/                # Python FastAPI Backend
│   ├── main.py            # Main API + routes
│   ├── database.py        # PostgreSQL connection
│   ├── auth.py            # JWT authentication
│   ├── models.py          # Pydantic models
│   ├── init_db.sql        # Database schema
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend config
├── src/                   # React Frontend
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── BookContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ...
│   ├── components/
│   └── styles/
├── .env                   # Frontend config
└── ...
```

## 🎯 Available Scripts

**Backend:**
```bash
cd backend
uvicorn main:app --reload --port 3001  # Development
python main.py                          # Production
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get single book
- `POST /api/books` - Create book (protected)
- `PUT /api/books/{id}` - Update book (protected)
- `DELETE /api/books/{id}` - Delete book (protected)

### Favorites
- `GET /api/favorites` - Get user favorites (protected)
- `POST /api/favorites/{book_id}` - Add to favorites (protected)
- `DELETE /api/favorites/{book_id}` - Remove from favorites (protected)

**💡 Tip**: Lihat interactive API documentation di http://localhost:3001/docs

## 🔒 Security Features

- ✅ Password hashing dengan bcrypt
- ✅ JWT token-based authentication (7 hari expiry)
- ✅ Protected API routes
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Input validation dengan Pydantic

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
cd backend
pip install -r requirements.txt
```

### Database errors

```bash
# Check PostgreSQL is running
Get-Service postgresql*

# Verify database exists
# Open pgAdmin atau psql dan check database_buku
```

### Frontend can't connect

1. Check backend is running: http://localhost:3001/api/health
2. Check browser console for errors
3. Verify `.env` has `VITE_API_URL=http://localhost:3001/api`

### Port already in use

```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID_NUMBER> /F
```

## 📦 Dependencies

### Python (Backend)
- fastapi - Web framework
- uvicorn - ASGI server
- psycopg2-binary - PostgreSQL adapter
- python-jose - JWT handling
- passlib - Password hashing
- pydantic - Data validation
- email-validator - Email validation

### Node.js (Frontend)
- react - UI library
- react-router-dom - Routing
- vite - Build tool

## 🚀 Production Deployment

### Backend Options
- **Railway.app** - Easy Python deployment
- **Render.com** - Free tier available
- **Heroku** - Classic choice
- **DigitalOcean** - VPS option

### Frontend Options
- **Vercel** - Recommended for React
- **Netlify** - Great for static sites
- **GitHub Pages** - Free hosting

### Database Options
- **Supabase** - PostgreSQL hosted (free tier)
- **Railway** - PostgreSQL plugin
- **ElephantSQL** - Managed PostgreSQL

Lihat [SETUP-PYTHON.md](SETUP-PYTHON.md) untuk detail deployment.

## ✨ Features

### Public (No Auth)
✅ Browse home page  
✅ View book list  
✅ View book details

### Protected (Login Required)
✅ User registration & login  
✅ Add/remove favorites  
✅ My Favorites page  
✅ My Library  
✅ User profile  
✅ Admin dashboard (CRUD books)

## 📝 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions, issues, and feature requests are welcome!

---

**Made with ❤️ using Python FastAPI 🐍 + React ⚛️**

**Backend**: Python FastAPI  
**Frontend**: React  
**Database**: PostgreSQL
