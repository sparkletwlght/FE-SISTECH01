import '../App.css';
import profile from '../images/profile.png'
import logo from '../images/logo.png'
import { Link } from "react-router-dom";

function Navbar() {
    return(
        <nav className="navbar">
            <div className='logo'>
                <img src={logo} alt='logo' className='logo-img' />
                <h1> Bibliotheca </h1>
            </div>

            <ul className='nav-links'> 
                <li> 
                    <Link to="/">Home</Link> 
                </li>
                <li> 
                    <Link to="/list">Book List</Link> 
                </li>
                <li>
                    <Link to='/library'>My Library</Link>
                </li>
                <li> 
                    <Link to="/favorite">My Favorite</Link>
                </li>
                <li>
                    <Link to="/profile">
                        <img src={profile} alt='profile' className='profile-img'/>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;