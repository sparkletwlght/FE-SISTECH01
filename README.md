# 📚 Bibliotheca - Modern Library & Book Management System

A full-stack, responsive web application for exploring, managing, reviewing, and bookmarking books. Built with **React (Vite)**, **Express / Serverless Node.js**, and powered by **PostgreSQL on Supabase Cloud**, ready for one-click deployment on **Vercel**.

🌐 **Live Demo:** [https://fe-sistech01.vercel.app](https://fe-sistech01.vercel.app)

---

## ✨ Features

### 👤 User & Authentication
- **Secure Authentication**: Register and Login using JWT (JSON Web Tokens) with password hashing via `bcryptjs`.
- **Broken Access Control Prevention**:
  - Server-side rate limiter for login attempts (protection against brute-force attacks).
  - Strong password policy enforcement (minimum 8 characters, uppercase, numbers, and special symbols).
  - Role-based permissions ensuring users can only read/edit their own data.
- **Dynamic Profile Management**:
  - View user profile with personalized avatar initials.
  - In-place profile editor: change username, email, and password with real-time feedback.
- **Role System**: Supports regular `user` and privileged `admin`.

### 📖 Book Browsing & Personal Library
- **Explore & Search**: Real-time search across hundreds of cataloged books by title, author, and category.
- **Curated Sections**: Dynamic "Top Pick" and "Weekly Top" highlights powered directly from cloud database flags.
- **Saved / Favorites**: Add or remove books from personal reading wishlist with instant sync to Supabase.
- **Reviews & Ratings**: Access to community reviews and ratings for each book.

### 🛡️ Admin Dashboard (CRUD Management)
- Accessible only to authorized `admin` accounts.
- **Interactive Overview**: Quick statistics (total books, categories, active top picks, and weekly highlights).
- **Full Book Management**:
  - Add new books with custom metadata.
  - Edit existing titles, descriptions, categories, and cover images.
  - Delete books with custom modal confirmation.
  - Real-time toggle switches for *Top Pick* and *Weekly Top* status.

### 🎨 Modern UI / UX
- Sticky full-width navigation bar with subtle shadow on scroll.
- Floating animated background gradient with glowing ambient orbs on Auth pages.
- Responsive design tailored for desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, React Icons, Swiper |
| **Backend / API** | Node.js, Express, Vercel Serverless Functions (`api/index.js`) |
| **Database** | PostgreSQL on **Supabase Cloud** (5 tables: `books`, `users`, `book_reviews`, `user_favorites`, `raw_books`) |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Deployment** | Vercel (Frontend & Serverless API Monorepo) |

---

## 📂 Project Architecture

```text
sistech-hands-on-01/
├── api/
│   └── index.js                 # Vercel Serverless entry point routing Express
├── backend/                     # Optional Python FastAPI reference backend
├── public/                      # Static assets & icons
├── server/
│   ├── middleware/              # Auth middleware (JWT verification)
│   ├── db.js                    # Universal Supabase cloud & local PostgreSQL adapter
│   └── server.js                # Express REST API routes (Auth, Books, Favorites)
├── src/
│   ├── components/              # Reusable UI (Navbar, BookCard, etc.)
│   ├── context/                 # Global state (AuthContext, BookContext)
│   ├── pages/                   # Views (Home, BookList, BookDetail, Favorites, Profile, Login)
│   │   └── admin/               # Admin Dashboard & BookForm components
│   ├── styles/                  # Modular component stylesheets
│   ├── App.jsx                  # Route definitions & protected route wrappers
│   └── main.jsx                 # Client entry point
├── vercel.json                  # Serverless routing configuration
└── vite.config.js               # Vite build config with local dev proxy
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sparkletwlght/FE-SISTECH01.git
cd FE-SISTECH01
npm install
```

### 2. Environment Variables Setup
Create a `.env` file in the root directory (or in `server/.env`):
```env
# Supabase Cloud Database Connection
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.wfuqwvgzsnjxbhdhokej.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key
PORT=3001

# Set to true only if you wish to fallback to local PostgreSQL (localhost:5432)
USE_LOCAL_DB=false
```

### 3. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
npm run server
# Server running on http://localhost:3001
```

**Terminal 2 (Frontend React):**
```bash
npm run dev
# Vite client running on http://localhost:5173
```

---

## ☁️ Deployment on Vercel

This project is configured as a zero-config monorepo for Vercel:

1. Import the repository in your [Vercel Dashboard](https://vercel.com/new).
2. Set **Root Directory** to `./` (root).
3. Under **Environment Variables**, add:
   - `DATABASE_URL` = Your Supabase Connection String URI
   - `JWT_SECRET` = Your secure token secret
4. Click **Deploy**. Vercel will automatically build the React frontend and deploy the Express API as Serverless Functions via `vercel.json`.

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@books.com` | `admin123` |
| **Reader** | `rin@books.com` | *(Created via register)* |

---

## 📄 License
This project was developed for educational and hands-on portfolio purposes.
