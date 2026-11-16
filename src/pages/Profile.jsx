import "../App.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Profile() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Mode edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect ke login kalau belum login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Sync form data with current user
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, isEditing]);

  if (!user) return null;

  // 2 huruf pertama username untuk avatar besar
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi basic
    if (!formData.username.trim() || !formData.email.trim()) {
      setError("Username dan Email tidak boleh kosong.");
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Password baru dan konfirmasi password tidak cocok!");
        return;
      }
      if (!formData.currentPassword) {
        setError("Masukkan password saat ini untuk verifikasi penggantian password.");
        return;
      }
      if (formData.newPassword.length < 8) {
        setError("Password baru minimal 8 karakter.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateProfile({
        username: formData.username.trim(),
        email: formData.email.trim(),
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
      });

      if (res.success) {
        setSuccess(res.message || "Profil berhasil diperbarui!");
        setTimeout(() => {
          setIsEditing(false);
          setSuccess("");
        }, 1500);
      } else {
        setError(res.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <h1>My Profile</h1>

      <div className="profile-card">
        {/* Avatar lingkaran amber besar */}
        <div className="profile-avatar-large">{initials}</div>

        {!isEditing ? (
          /* View Mode */
          <>
            <h2>{user.username}</h2>

            <p className="email">
              <b>Email :</b> {user.email}
            </p>
            <p className="role">
              <b>Role :</b>{" "}
              {user.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : "Reader"}
            </p>

            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: "16px", cursor: "pointer" }}
            >
              Edit Profile
            </button>

            <button
              className="logout-btn"
              onClick={handleLogout}
              style={{ marginTop: "10px" }}
            >
              Logout
            </button>
          </>
        ) : (
          /* Edit Form Mode */
          <form onSubmit={handleSave} className="profile-edit-form">
            <h3 style={{ margin: "0 0 16px 0", color: "#1A365D", fontSize: "1.2rem" }}>
              Edit Your Details
            </h3>

            {error && <div className="profile-alert profile-alert-error">{error}</div>}
            {success && <div className="profile-alert profile-alert-success">{success}</div>}

            <div className="profile-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username baru"
                required
              />
            </div>

            <div className="profile-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email baru"
                required
              />
            </div>

            <div style={{ margin: "16px 0 8px", borderTop: "1px dashed #CBD5E0", paddingTop: "12px", width: "100%" }}>
              <span style={{ fontSize: "12px", color: "#718096", fontWeight: "600" }}>
                Ganti Password (Opsional)
              </span>
            </div>

            <div className="profile-field">
              <label>Password Saat Ini</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Wajib jika ganti password"
              />
            </div>

            <div className="profile-field">
              <label>Password Baru</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Min. 8 karakter (huruf besar, angka, simbol)"
              />
            </div>

            <div className="profile-field">
              <label>Konfirmasi Password Baru</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password baru"
              />
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
