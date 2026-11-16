from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime

# User models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str] = "user"
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

# Book models
class BookCreate(BaseModel):
    title: str
    authors: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    categories: Optional[str] = None
    category: Optional[str] = None
    published_date: Optional[str] = None
    year: Optional[int] = None
    publisher: Optional[str] = None
    preview_link: Optional[str] = None
    info_link: Optional[str] = None
    ratings_count: Optional[int] = None

class BookUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    categories: Optional[str] = None
    category: Optional[str] = None
    published_date: Optional[str] = None
    year: Optional[int] = None
    publisher: Optional[str] = None
    preview_link: Optional[str] = None
    info_link: Optional[str] = None
    ratings_count: Optional[int] = None

class BookResponse(BaseModel):
    id: str
    bid: Optional[str] = None
    title: str
    authors: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    categories: Optional[str] = None
    category: Optional[str] = None
    published_date: Optional[str] = None
    year: Optional[int] = None
    publisher: Optional[str] = None
    preview_link: Optional[str] = None
    info_link: Optional[str] = None
    ratings_count: Optional[int] = None
    favorite: Optional[bool] = False
    toppick: Optional[bool] = False
    weeklytop: Optional[bool] = False

# Response models
class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
