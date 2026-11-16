# Setup Guide - Python Backend Edition 🐍

Complete setup guide untuk Bibliotheca dengan Python FastAPI backend dan React frontend.

## Prerequisites

✅ Python 3.8 atau lebih baru  
✅ PostgreSQL 12+  
✅ Node.js 18+ (untuk frontend)  
✅ pip (Python package manager)

## Quick Start - 5 Langkah

### 1️⃣ Create Database

```bash
# Via psql
psql -U postgres -c "CREATE DATABASE database_buku;"

# Import tables & sample data
psql -U postgres -d database_buku -f backend/init_db.sql
```

**Atau via pgAdmin:**
1. Buat database `database_buku`
2. Open Query Tool
3. Load file `backend/init_db.sql`
4. Execute (F5)

### 2️⃣ Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Install Frontend Dependencies

```bash
# Kembali ke root folder
cd ..
npm install
```

### 4️⃣ Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 3001
```

Server running di: **http://localhost:3001**  
API Docs: **http://localhost:3001/docs**

### 5️⃣ Start Frontend Server

**Terminal baru:**

```bash
npm run dev
```

Frontend running di: **http://localhost:5173**

## 🎉 Test Aplikasi

1. Buka browser: http://localhost:5173
2. Klik **Register** → Create account
3. Login dengan account baru
4. Explore fitur-fitur! 📚

## 📁 Project Structure

```
sistech-hands-on-01/
├── backend/              # Python FastAPI Backend
│   ├── main.py          # Main API + routes
│   ├── database.py      # PostgreSQL connection
│   ├── auth.py          # JWT authentication
│   ├── models.py        # Pydantic models
│   ├── init_db.sql      # Database schema
│   ├── requirements.txt # Python dependencies
│   └── .env            # Backend config
├── src/                 # React Frontend
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── BookContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ...
│   └── components/
└── .env                # Frontend config
```

## 🔧 Configuration

### Backend (.env)

File `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_buku
DB_USER=postgres
DB_PASSWORD=yuningge

JWT_SECRET=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
```

### Frontend (.env)

File root `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:3001/api/health

# Get books
curl http://localhost:3001/api/books

# Register (PowerShell)
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Test Frontend

1. Open http://localhost:5173
2. Try register/login
3. Browse books
4. Add to favorites
5. Test admin dashboard

## 📚 API Documentation

FastAPI provides **automatic interactive API documentation**:

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

Sangat berguna untuk testing dan development!

## 🔐 Default Credentials

**Database:**
- Host: localhost
- Port: 5432
- Database: database_buku
- User: postgres
- Password: yuningge

**Sample User (create via Register page):**
- Email: admin@books.com
- Password: (pilih sendiri saat register)

## 🚀 Scripts Helper

### Windows PowerShell Script

Buat file `start-both.ps1`:

```powershell
# Start backend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; uvicorn main:app --reload --port 3001"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start frontend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✨ Both servers started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
```

Run:

```powershell
.\start-both.ps1
```

## 🐛 Troubleshooting

### Backend Won't Start

**Error: Database connection failed**

```bash
# Check PostgreSQL service
Get-Service postgresql*

# Test database connection
psql -U postgres -d database_buku -c "SELECT 1;"
```

**Error: Module not found**

```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

**Error: Port 3001 already in use**

```bash
# Find process
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID_NUMBER> /F

# Or change port
uvicorn main:app --reload --port 3002
```

### Frontend Won't Connect

**Error: Failed to fetch**

1. Check backend is running: http://localhost:3001/api/health
2. Check CORS settings in `backend/main.py`
3. Check `.env` file has correct API URL

**Error: Cannot find module**

```bash
npm install
```

### Database Errors

**Table doesn't exist**

```bash
# Re-run init script
psql -U postgres -d database_buku -f backend/init_db.sql
```

**Wrong password**

Update `backend/.env`:

```env
DB_PASSWORD=your_actual_password
```

## 📦 Dependencies

### Python (Backend)

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **psycopg2-binary** - PostgreSQL adapter
- **python-jose** - JWT handling
- **passlib** - Password hashing
- **pydantic** - Data validation

### Node.js (Frontend)

- **react** - UI library
- **react-router-dom** - Routing
- **vite** - Build tool

## 🎯 Features

### Public (No Auth Required)
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

## 🚀 Production Deployment

### Backend (Python)

**Option 1: Railway.app**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
railway login
railway init
railway up
```

**Option 2: Render.com**

1. Connect GitHub repo
2. Select "Python" environment
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (React)

**Vercel:**

```bash
npm install -g vercel
vercel
```

**Netlify:**

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Database

**Supabase** (PostgreSQL hosted):
1. Create project
2. Get connection string
3. Update `backend/.env`

**Railway PostgreSQL**:
1. Add PostgreSQL plugin
2. Copy credentials
3. Update `backend/.env`

## 📝 Next Steps

- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add user roles (admin/user)
- [ ] Upload book covers
- [ ] Advanced search & filters
- [ ] Rate & review books
- [ ] Reading progress tracking
- [ ] Book recommendations

## 🆘 Need Help?

1. Check API documentation: http://localhost:3001/docs
2. Check backend logs in terminal
3. Check browser console for frontend errors
4. Review `backend/README.md` for detailed backend docs

---

**🎊 Selamat! Aplikasi siap digunakan!**

Backend: Python FastAPI 🐍  
Frontend: React ⚛️  
Database: PostgreSQL 🐘
