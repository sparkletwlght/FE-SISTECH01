import { FaInstagram, FaTiktok, FaGithub } from "react-icons/fa";
import { FaCopyright } from "react-icons/fa";

function Footer() {
    return(
        <div className="footer">
            <ul className="insta"> 
                <a href="https://instagram.com/corinthia_angie"> 
                    <FaInstagram className="insta-icon" />
                    <space> corinthia_angie </space>
                </a>
            </ul>
            <ul className="tiktok">
                <a href="https://www.tiktok.com/@yliacathia">
                    <FaTiktok className="tiktok-icon" />
                    <space> yliacathia </space>
                </a>
            </ul>
            <ul className="github">
                <a href="https://github.com/sparkletwlght">
                    <FaGithub className="github-icon" />
                    <space> sparkletwlght </space>
                </a>
            </ul>
            <ul className="copyright">
                <FaCopyright className="copyright-icon" />
                <space> Create for Sistech Hands On 1 and Revised for Python Framework by Corinthia Angie </space>
            </ul>
        </div>
    );
}

export default Footer;