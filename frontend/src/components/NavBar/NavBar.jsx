import { useEffect } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext.jsx'; // ✅ Add this

export const NavBar = ({ menuOpen, setMenuOpen }) => {
  const { isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <img
              className="h-8 w-auto"
              src="/maxx-energy-logo.png"
              alt="Maxx Energy Logo"
            />
          </div>

          <div
            className="w-7 h-5 relative cursor-pointer z-40 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            &#9776;
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Homepage
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="#projects" className="text-gray-300 hover:text-white transition-colors">
              Projects
            </Link>
            <Link to="/data" className="text-gray-300 hover:text-white transition-colors">
                Data
            </Link>

            <a href="mailto:info@maxxpotential.com" className="text-gray-300 hover:text-white transition-colors">
              Contact Us
            </a>


            {/* 🔓 Login/Logout Button */}
            <button
              onClick={isAuthenticated ? logout : login}
              className="ml-4 px-4 py-1 bg-white text-black rounded hover:bg-gray-200 transition"
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
