import '../App.css';
import logo from '../images/logo.png';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FaBookmark, FaHome, FaListUl, FaSignInAlt, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className='logo'>
                <img src={logo} alt='logo' className='logo-img' />
                <h1>Bibliotheca</h1>
            </div>

            <ul className='nav-links'>
                <li>
                    <Link to="/" className={isActive('/') ? 'nav-active' : ''}>
                        <FaHome className="nav-icon" /> Home
                    </Link>
                </li>
                <li>
                    <Link to="/list" className={isActive('/list') ? 'nav-active' : ''}>
                        <FaListUl className="nav-icon" /> Book List
                    </Link>
                </li>
                <li>
                    <Link to="/favorite" className={`saved-link ${isActive('/favorite') ? 'nav-active' : ''}`}>
                        <FaBookmark className="nav-icon" /> Saved
                    </Link>
                </li>

                {/* Link Admin — hanya muncul kalau role = admin */}
                {isAuthenticated && isAdmin && (
                    <li>
                        <Link to="/admin" className={`admin-nav-link ${isActive('/admin') ? 'nav-active' : ''}`}>
                            <FaShieldAlt className="nav-icon" /> Admin
                        </Link>
                    </li>
                )}

                {isAuthenticated ? (
                    <>
                        <li>
                            <Link to="/profile" className={`profile-nav-link ${isActive('/profile') ? 'nav-active' : ''}`}>
                                <div className="profile-avatar">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="profile-nav-name">{user?.username}</span>
                            </Link>
                        </li>
                        <li>
                            <button onClick={logout} className="logout-btn">
                                <FaSignOutAlt className="nav-icon" /> Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link to="/login" className="register-link">
                            <FaSignInAlt className="nav-icon" /> Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
