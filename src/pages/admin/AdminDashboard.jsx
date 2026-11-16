import { useState } from "react";
import { useBooks } from "../../context/BookContext";
import { useAuth } from "../../context/AuthContext";
import BookForm from "./BookForm";
import "../../App.css";

function AdminDashboard() {
  const { books, loading, deleteBook } = useBooks();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, title }

  // ── Stats ──
  const totalBooks = books.length;
  const topPicks = books.filter((b) => b.toppick).length;
  const weeklyTops = books.filter((b) => b.weeklytop).length;

  // ── Unique categories ──
  const categories = ["all", ...new Set(
    books.map((b) => b.categories).filter(Boolean)
  )].slice(0, 20);

  // ── Filter ──
  const filtered = books.filter((b) => {
    const matchSearch =
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.authors?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "all" || b.categories === categoryFilter;
    return matchSearch && matchCat;
  });

  function handleEdit(book) {
    setEditingBook(book);
    setShowForm(true);
  }

  async function handleDeleteConfirmed() {
    if (!deleteConfirm) return;
    const { error } = await deleteBook(deleteConfirm.id);
    if (error) alert("Gagal hapus: " + error);
    setDeleteConfirm(null);
  }

  function handleClose() {
    setShowForm(false);
    setEditingBook(null);
  }

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <p>Loading books...</p>
    </div>
  );

  return (
    <div className="main">
      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0, color: '#1A365D' }}>Admin Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '14px' }}>
            Logged in as <strong>{user?.username}</strong>
            <span className="admin-role-badge">Admin</span>
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setEditingBook(null); setShowForm(true); }}
        >
          + Add Book
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-num">{totalBooks}</span>
          <span className="admin-stat-label">Total Books</span>
        </div>
        <div className="admin-stat-card amber">
          <span className="admin-stat-num">{topPicks}</span>
          <span className="admin-stat-label">Top Picks</span>
        </div>
        <div className="admin-stat-card blue">
          <span className="admin-stat-num">{weeklyTops}</span>
          <span className="admin-stat-label">Weekly Top</span>
        </div>
        <div className="admin-stat-card green">
          <span className="admin-stat-num">{filtered.length}</span>
          <span className="admin-stat-label">Showing</span>
        </div>
      </div>

      {/* ── Search + filter ── */}
      <div className="admin-filter-row">
        <input
          className="admin-search"
          type="text"
          placeholder="🔍  Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, margin: 0 }}
        />
        <select
          className="admin-search"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ width: '200px', margin: 0, cursor: 'pointer' }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* ── Book Form modal ── */}
      {showForm && <BookForm book={editingBook} onClose={handleClose} />}

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
            <h2 style={{ color: '#1A365D', margin: '0 0 8px' }}>Hapus Buku?</h2>
            <p style={{ color: '#718096', marginBottom: '24px' }}>
              <strong>"{deleteConfirm.title}"</strong> akan dihapus permanen dari database.
            </p>
            <div className="form-buttons" style={{ justifyContent: 'center' }}>
              <button className="btn-delete" onClick={handleDeleteConfirmed}>Ya, Hapus</button>
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="admin-table-wrapper">
        {filtered.length === 0 ? (
          <div className="no-books">
            <p>Tidak ada buku yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Cover</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Category</th>
                <th>Year</th>
                <th>Badges</th>
                <th style={{ width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id}>
                  <td>
                    <img
                      src={book.image || `https://placehold.co/45x60/1A365D/white?text=${encodeURIComponent(book.title?.[0] || '?')}`}
                      alt={book.title}
                      className="admin-cover"
                    />
                  </td>
                  <td style={{ fontWeight: '600', color: '#1A365D', maxWidth: '200px' }}>
                    {book.title}
                  </td>
                  <td style={{ color: '#4A5568' }}>{book.authors || '—'}</td>
                  <td>
                    {book.categories && (
                      <span className="admin-cat-badge">{book.categories}</span>
                    )}
                  </td>
                  <td style={{ color: '#718096' }}>{book.published_date || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {book.toppick && <span className="badge-amber">⭐ Top</span>}
                      {book.weeklytop && <span className="badge-blue">📈 Weekly</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn-edit" onClick={() => handleEdit(book)}>Edit</button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm({ id: book.id, title: book.title })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
