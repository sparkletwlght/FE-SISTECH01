# Python Backend - FastAPI + PostgreSQL

Backend API untuk Bibliotheca Book Management System menggunakan Python FastAPI dan PostgreSQL.

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **psycopg2** - PostgreSQL adapter
- **python-jose** - JWT token handling
- **passlib** - Password hashing
- **Pydantic** - Data validation

## 📦 Setup

### 1. Install Python Dependencies

```bash
# Pastikan Python 3.8+ terinstall
python --version

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Database

Jalankan SQL script untuk membuat tables:

```bash
# Via psql
psql -U postgres -d database_buku -f init_db.sql

# Atau via pgAdmin:
# 1. Buka pgAdmin
# 2. Buat database "database_buku"
# 3. Query Tool → Load file init_db.sql → Execute
```

### 3. Configure Environment

File `.env` sudah dikonfigurasi:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_buku
DB_USER=postgres
DB_PASSWORD=yuningge

JWT_SECRET=your-secret-key-change-this-in-production
```

### 4. Run Server

```bash
# Development mode (auto-reload)
uvicorn main:app --reload --port 3001

# Production mode
python main.py
```

Server akan berjalan di: **http://localhost:3001**

## 📚 API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Books

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/books` | Get all books | ❌ |
| GET | `/api/books/{id}` | Get single book | ❌ |
| POST | `/api/books` | Create book | ✅ |
| PUT | `/api/books/{id}` | Update book | ✅ |
| DELETE | `/api/books/{id}` | Delete book | ✅ |

### Favorites

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/favorites` | Get user favorites | ✅ |
| POST | `/api/favorites/{book_id}` | Add to favorites | ✅ |
| DELETE | `/api/favorites/{book_id}` | Remove from favorites | ✅ |

## 🧪 Testing API

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get books
curl http://localhost:3001/api/books

# Get books with auth (replace TOKEN with actual token)
curl http://localhost:3001/api/favorites \
  -H "Authorization: Bearer TOKEN"
```

### Using Python requests

```python
import requests

# Register
response = requests.post(
    'http://localhost:3001/api/auth/register',
    json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    }
)
token = response.json()['token']

# Get books with auth
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:3001/api/favorites', headers=headers)
print(response.json())
```

## 🏗️ Project Structure

```
backend/
├── main.py           # Main FastAPI application & routes
├── database.py       # Database connection & pool
├── auth.py           # Authentication & JWT handling
├── models.py         # Pydantic models
├── init_db.sql       # Database initialization
├── .env              # Environment variables
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected routes with dependency injection
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configured for frontend
- ✅ Input validation with Pydantic

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
# Windows (PowerShell)
Get-Service postgresql*

# Check database exists
psql -U postgres -l | findstr database_buku
```

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Port Already in Use

```bash
# Change port in command
uvicorn main:app --reload --port 3002

# Or kill process using port 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

## 📝 Development Tips

### Auto-reload on code changes

```bash
uvicorn main:app --reload --port 3001
```

### View SQL queries (debug mode)

Add to `database.py`:

```python
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Test database connection

```python
python -c "from database import init_db_pool, get_db_connection; init_db_pool(); conn = get_db_connection(); print('✅ Connected!')"
```

## 🚀 Production Deployment

### Using Gunicorn (recommended)

```bash
pip install gunicorn

gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:3001
```

### Environment Variables

Update `.env` for production:

```env
JWT_SECRET=<generate-strong-secret-key>
DB_HOST=<production-db-host>
DB_PASSWORD=<secure-password>
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]
```

Build and run:

```bash
docker build -t bibliotheca-api .
docker run -p 3001:3001 --env-file .env bibliotheca-api
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [python-jose JWT Guide](https://python-jose.readthedocs.io/)

---

Made with ❤️ using Python & FastAPI
