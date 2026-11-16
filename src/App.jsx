import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import Favorite from "./pages/Favorites";
import BookDetail from "./pages/BookDetail";
import MyLibrary from "./pages/MyLibrary";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/Login";

import { useAuth } from "./context/AuthContext";

// Hanya user login
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Hanya admin — redirect ke home kalau bukan admin
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/list" element={<BookList />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                {/* Admin-only route */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              </Routes>
              <div className="footer-space"></div>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
