from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from contextlib import asynccontextmanager
import psycopg2.extras
import psycopg2

from database import init_db_pool, close_db_pool, DatabaseConnection
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user
)
from models import (
    UserRegister, 
    UserLogin, 
    UserResponse, 
    TokenResponse,
    BookCreate, 
    BookUpdate, 
    BookResponse,
    MessageResponse,
    ErrorResponse
)

# Helper to normalize book data for frontend
def map_book_dict(row: dict) -> BookResponse:
    cat = (row.get("category") or "").strip("'")
    auth = (row.get("author") or "").strip("'")
    year = row.get("year")
    desc = row.get("content") or row.get("description") or ""
    bid = str(row.get("bid") or row.get("id") or "")
    return BookResponse(
        id=bid,
        bid=bid,
        title=row.get("title") or "",
        authors=auth,
        author=auth,
        categories=cat,
        category=cat,
        published_date=str(year) if year else "",
        year=year,
        image=row.get("image") or "",
        description=desc,
        content=desc,
        publisher=row.get("publisher") or "",
        preview_link=row.get("preview_link") or "",
        info_link=row.get("info_link") or "",
        ratings_count=row.get("ratings_count"),
        favorite=bool(row.get("favorite")),
        toppick=bool(row.get("toppick")),
        weeklytop=bool(row.get("weeklytop")),
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db_pool()
    print("🚀 FastAPI server started")
    yield
    close_db_pool()
    print("👋 FastAPI server stopped")

# Initialize FastAPI app
app = FastAPI(
    title="Bibliotheca API",
    description="Book management API with PostgreSQL",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Server is running", "database": "database_buku"}

@app.get("/")
async def root():
    return {"status": "ok", "message": "Bibliotheca FastAPI Backend"}

# ============= AUTH ROUTES =============

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister):
    """Register a new user"""
    try:
        with DatabaseConnection() as cursor:
            cursor.execute(
                "SELECT user_id FROM users WHERE email = %s OR username = %s",
                (user.email, user.username)
            )
            existing_user = cursor.fetchone()
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User already exists"
                )
            
            hashed_password = get_password_hash(user.password)
            
            cursor.execute(
                """
                INSERT INTO users (username, email, password_hash, role) 
                VALUES (%s, %s, %s, 'user') 
                RETURNING user_id, username, email, role, created_at
                """,
                (user.username, user.email, hashed_password)
            )
            
            new_user = cursor.fetchone()
            
            token_data = {
                "id": new_user[0],
                "username": new_user[1],
                "email": new_user[2],
                "role": new_user[3]
            }
            token = create_access_token(token_data)
            
            user_response = UserResponse(
                id=new_user[0],
                username=new_user[1],
                email=new_user[2],
                role=new_user[3],
                created_at=new_user[4]
            )
            
            return TokenResponse(token=token, user=user_response)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        with DatabaseConnection() as cursor:
            cursor.execute(
                "SELECT user_id, username, email, password_hash, role, created_at FROM users WHERE email = %s",
                (credentials.email,)
            )
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            if not verify_password(credentials.password, user[3]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            token_data = {
                "id": user[0],
                "username": user[1],
                "email": user[2],
                "role": user[4]
            }
            token = create_access_token(token_data)
            
            user_response = UserResponse(
                id=user[0],
                username=user[1],
                email=user[2],
                role=user[4],
                created_at=user[5]
            )
            
            return TokenResponse(token=token, user=user_response)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user"""
    try:
        with DatabaseConnection() as cursor:
            cursor.execute(
                "SELECT user_id, username, email, role, created_at FROM users WHERE user_id = %s",
                (current_user["id"],)
            )
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return UserResponse(
                id=user[0],
                username=user[1],
                email=user[2],
                role=user[3],
                created_at=user[4]
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============= BOOKS ROUTES =============

@app.get("/api/books", response_model=List[BookResponse])
async def get_books():
    """Get all books"""
    try:
        with DatabaseConnection() as cursor:
            dict_cursor = cursor.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            dict_cursor.execute("SELECT * FROM books ORDER BY bid ASC")
            books = dict_cursor.fetchall()
            dict_cursor.close()
            return [map_book_dict(book) for book in books]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    """Get a single book by ID or bid"""
    try:
        with DatabaseConnection() as cursor:
            dict_cursor = cursor.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            dict_cursor.execute("SELECT * FROM books WHERE bid = %s", (book_id,))
            book = dict_cursor.fetchone()
            dict_cursor.close()
            
            if not book:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Book not found"
                )
            
            return map_book_dict(book)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    book: BookCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new book (protected)"""
    try:
        with DatabaseConnection() as cursor:
            # Generate next bid
            cursor.execute("SELECT bid FROM books WHERE bid LIKE 'B%' ORDER BY bid DESC LIMIT 1")
            last = cursor.fetchone()
            next_bid = "B0001"
            if last and last[0]:
                digits = "".join(filter(str.isdigit, last[0]))
                if digits:
                    next_bid = f"B{(int(digits) + 1):04d}"
            
            author_val = book.authors or book.author or "Unknown Author"
            category_val = book.categories or book.category or "General"
            desc_val = book.description or book.content or ""
            year_val = book.year or (int(book.published_date) if book.published_date and book.published_date.isdigit() else None)
            
            dict_cursor = cursor.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            dict_cursor.execute(
                """
                INSERT INTO books (bid, title, author, category, year, image, content, publisher, preview_link, info_link, ratings_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    next_bid,
                    book.title,
                    author_val,
                    category_val,
                    year_val,
                    book.image or "",
                    desc_val,
                    book.publisher or "",
                    book.preview_link or "",
                    book.info_link or "",
                    book.ratings_count
                )
            )
            created = dict_cursor.fetchone()
            dict_cursor.close()
            return map_book_dict(created)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/api/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    book: BookUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a book (protected)"""
    try:
        with DatabaseConnection() as cursor:
            author_val = book.authors or book.author
            category_val = book.categories or book.category
            desc_val = book.description or book.content
            year_val = book.year or (int(book.published_date) if book.published_date and book.published_date.isdigit() else None)
            
            dict_cursor = cursor.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            dict_cursor.execute(
                """
                UPDATE books
                SET title = COALESCE(%s, title),
                    author = COALESCE(%s, author),
                    content = COALESCE(%s, content),
                    image = COALESCE(%s, image),
                    category = COALESCE(%s, category),
                    year = COALESCE(%s, year),
                    publisher = COALESCE(%s, publisher),
                    preview_link = COALESCE(%s, preview_link),
                    info_link = COALESCE(%s, info_link),
                    ratings_count = COALESCE(%s, ratings_count)
                WHERE bid = %s
                RETURNING *
                """,
                (
                    book.title,
                    author_val,
                    desc_val,
                    book.image,
                    category_val,
                    year_val,
                    book.publisher,
                    book.preview_link,
                    book.info_link,
                    book.ratings_count,
                    book_id
                )
            )
            updated = dict_cursor.fetchone()
            dict_cursor.close()
            
            if not updated:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Book not found"
                )
            
            return map_book_dict(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/api/books/{book_id}", response_model=MessageResponse)
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a book (protected)"""
    try:
        with DatabaseConnection() as cursor:
            cursor.execute("DELETE FROM books WHERE bid = %s RETURNING bid", (book_id,))
            deleted = cursor.fetchone()
            
            if not deleted:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Book not found"
                )
            
            return MessageResponse(message="Book deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============= FAVORITES ROUTES =============

@app.get("/api/favorites", response_model=List[BookResponse])
async def get_favorites(current_user: dict = Depends(get_current_user)):
    """Get user's favorite books (protected)"""
    try:
        with DatabaseConnection() as cursor:
            dict_cursor = cursor.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            dict_cursor.execute(
                """
                SELECT 
                    uf.favorite_id,
                    uf.created_at AS saved_at,
                    b.*
                FROM user_favorites uf
                JOIN books b ON uf.bid = b.bid
                WHERE uf.user_id = %s
                ORDER BY uf.created_at DESC
                """,
                (current_user["id"],)
            )
            books = dict_cursor.fetchall()
            dict_cursor.close()
            return [map_book_dict(book) for book in books]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/favorites/{book_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    book_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Add book to favorites (protected)"""
    try:
        with DatabaseConnection() as cursor:
            cursor.execute(
                """
                INSERT INTO user_favorites (user_id, bid) 
                VALUES (%s, %s) 
                ON CONFLICT (user_id, bid) DO NOTHING
                """,
                (current_user["id"], book_id)
            )
            return MessageResponse(message="Added to favorites")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.delete("/api/favorites/{book_id}", response_model=MessageResponse)
async def remove_favorite(
    book_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove book from favorites (protected)"""
    try:
        with DatabaseConnection() as cursor:
            cursor.execute(
                "DELETE FROM user_favorites WHERE user_id = %s AND bid = %s RETURNING favorite_id",
                (current_user["id"], book_id)
            )
            deleted = cursor.fetchone()
            
            if not deleted:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Favorite not found"
                )
            
            return MessageResponse(message="Removed from favorites")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
