import { useState } from "react";
import { useBooks } from "../../context/BookContext";

const EMPTY_FORM = {
  title: "",
  authors: "",
  description: "",
  image: "",
  categories: "",
  published_date: "",
  publisher: "",
  preview_link: "",
  info_link: "",
  ratings_count: "",
  toppick: false,
  weeklytop: false,
};

function BookForm({ book, onClose }) {
  const { addBook, updateBook } = useBooks();
  const isEdit = Boolean(book);

  const [form, setForm] = useState(
    isEdit
      ? {
          title: book.title ?? "",
          authors: book.authors ?? "",
          description: book.description ?? "",
          image: book.image ?? "",
          categories: book.categories ?? "",
          published_date: book.published_date ?? "",
          publisher: book.publisher ?? "",
          preview_link: book.preview_link ?? "",
          info_link: book.info_link ?? "",
          ratings_count: book.ratings_count ?? "",
          toppick: Boolean(book.toppick),
          weeklytop: Boolean(book.weeklytop),
        }
      : EMPTY_FORM
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      ratings_count: form.ratings_count === "" ? null : Number(form.ratings_count),
    };

    const { error: err } = isEdit
      ? await updateBook(book.id, payload)
      : await addBook(payload);

    setLoading(false);
    if (err) setError(typeof err === "string" ? err : err.message || "Terjadi kesalahan");
    else onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1A365D' }}>
            {isEdit ? "✏️ Edit Book" : "➕ Add New Book"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#718096' }}
          >✕</button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="book-form">
          {/* ── Wajib ── */}
          <div className="form-row">
            <label>Title <span style={{ color: '#E53E3E' }}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Judul buku" />
          </div>
          <div className="form-row">
            <label>Authors <span style={{ color: '#E53E3E' }}>*</span></label>
            <input name="authors" value={form.authors} onChange={handleChange} required placeholder="Nama penulis" />
          </div>

          {/* ── 2 kolom ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-row">
              <label>Categories</label>
              <input name="categories" value={form.categories} onChange={handleChange} placeholder="Fiction, Technology..." />
            </div>
            <div className="form-row">
              <label>Published Year</label>
              <input name="published_date" value={form.published_date} onChange={handleChange} placeholder="e.g. 2021" />
            </div>
            <div className="form-row">
              <label>Publisher</label>
              <input name="publisher" value={form.publisher} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Ratings Count</label>
              <input name="ratings_count" type="number" value={form.ratings_count} onChange={handleChange} min={0} />
            </div>
          </div>

          <div className="form-row">
            <label>Cover Image URL</label>
            <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            {form.image && (
              <img src={form.image} alt="preview" style={{ marginTop: '8px', height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
            )}
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Deskripsi singkat buku..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-row">
              <label>Preview Link</label>
              <input name="preview_link" value={form.preview_link} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="form-row">
              <label>Info Link</label>
              <input name="info_link" value={form.info_link} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          {/* ── Toggle Top Pick & Weekly Top ── */}
          <div className="form-toggles">
            <label className="toggle-label">
              <input
                type="checkbox"
                name="toppick"
                checked={form.toppick}
                onChange={handleChange}
                className="toggle-checkbox"
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span>⭐ Top Pick</span>
              <small>Tampil di section Top Picks di Home</small>
            </label>

            <label className="toggle-label">
              <input
                type="checkbox"
                name="weeklytop"
                checked={form.weeklytop}
                onChange={handleChange}
                className="toggle-checkbox"
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span>📈 Weekly Top</span>
              <small>Tampil di section Weekly Top di Home</small>
            </label>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Book" : "Add Book"}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookForm;
