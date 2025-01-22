import { useState } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import { useDisplay } from '../context/DisplayContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  // Debug user role
  console.log('Navbar - Current user:', user);
  console.log('Navbar - Is admin?', user?.role === 'admin');
  const { resetDisplayCount } = useDisplay();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="macos-toolbar sticky top-0 z-50 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-[var(--macos-text)] tracking-tight"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                // Reset display count to initial value
                resetDisplayCount();
                // Scroll to top of page
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Airdrops.geo
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center p-1 rounded-full hover:bg-[var(--macos-hover)] transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[var(--macos-text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-[var(--macos-text)] hover:text-[var(--macos-primary)] px-2 py-1 rounded-md hover:bg-[var(--macos-hover)] transition-colors text-sm">
              Home
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-[var(--macos-text)] hover:text-[var(--macos-primary)] px-2 py-1 rounded-md hover:bg-[var(--macos-hover)] transition-colors text-sm">
                  My Airdrops
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-[var(--macos-text)] hover:text-[var(--macos-primary)] px-2 py-1 rounded-md hover:bg-[var(--macos-hover)] transition-colors text-sm">
                    Admin
                  </Link>
                )}
              </>
            )}

            <div className="flex items-center space-x-3 ml-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-[var(--macos-text)]">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="macos-button text-sm bg-[var(--macos-danger)]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="macos-button text-sm secondary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="macos-button text-sm bg-[var(--macos-success)]"
                  >
                    Register
                  </Link>
                </div>
              )}
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Airdrops
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}

              <div className="flex items-center justify-between py-2">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {user.username}
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="macos-button text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="macos-button text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md transition-colors shadow-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
                <DarkModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
