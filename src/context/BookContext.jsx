import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BookContext = createContext();

export function BookProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("bibliotheca_saved_books");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { token } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem("bibliotheca_saved_books", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // ── READ ──────────────────────────────────────────────
  async function fetchBooks() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/books`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error("Fetch books error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch favorites
  async function fetchFavorites() {
    if (!token) {
      try {
        const saved = localStorage.getItem("bibliotheca_saved_books");
        if (saved) setFavorites(JSON.parse(saved));
      } catch {}
      return;
    }

    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Fetch favorites error:", error);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  // ── CREATE ────────────────────────────────────────────
  async function addBook(bookData) {
    if (!token) {
      return { data: null, error: "Authentication required" };
    }

    try {
      const response = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data.error || "Failed to add book" };
      }

      setBooks((prev) => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ── UPDATE ────────────────────────────────────────────
  async function updateBook(id, bookData) {
    if (!token) {
      return { data: null, error: "Authentication required" };
    }

    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: data.error || "Failed to update book" };
      }

      setBooks((prev) => prev.map((b) => (b.id === id ? data : b)));
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // ── DELETE ────────────────────────────────────────────
  async function deleteBook(id) {
    if (!token) {
      return { error: "Authentication required" };
    }

    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || "Failed to delete book" };
      }

      setBooks((prev) => prev.filter((b) => b.id !== id));
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ── FAVORITES ─────────────────────────────────────────
  async function addToFavorites(bookId) {
    if (!token) {
      return { error: "Authentication required" };
    }

    try {
      const response = await fetch(`${API_URL}/favorites/${bookId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || "Failed to add to favorites" };
      }

      await fetchFavorites();
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  async function removeFromFavorites(bookId) {
    if (!token) {
      return { error: "Authentication required" };
    }

    try {
      const response = await fetch(`${API_URL}/favorites/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || "Failed to remove from favorites" };
      }

      await fetchFavorites();
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  return (
    <BookContext.Provider
      value={{
        books,
        loading,
        favorites,
        setFavorites,
        addBook,
        updateBook,
        deleteBook,
        fetchBooks,
        addToFavorites,
        removeFromFavorites,
        fetchFavorites,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  return useContext(BookContext);
}
