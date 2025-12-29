import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import { useDisplay } from '../context/DisplayContext';
import { FaUser, FaSignOutAlt, FaCog, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { pathname } = location;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debug user role and profile data
  console.log('Navbar - Current user:', user);
  console.log('Navbar - User role:', user?.role);
  console.log('Navbar - User role type:', user?.role ? typeof user.role : 'undefined');
  console.log('Navbar - Is admin?', user?.role === 'admin');
  console.log('Navbar - User avatar:', user?.avatar);
  console.log('Navbar - User displayName:', user?.displayName);

  // Function to check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    if (typeof user.role !== 'string') return false;
    return user.role === 'admin';
  };

  console.log('Navbar - isAdmin() result:', isAdmin());
  const { resetDisplayCount } = useDisplay();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="macos-toolbar fixed top-0 left-0 right-0 w-full z-[1000] shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-bold text-[var(--macos-primary)] tracking-tight"
            onClick={(e) => {
              if (pathname === '/') {
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
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md transition-colors text-base font-medium ${pathname === '/'
                ? 'bg-[var(--macos-primary)] text-white'
                : 'text-[var(--macos-text)] hover:text-white hover:bg-[var(--macos-primary-hover)]'}`}
              onClick={() => {
                if (pathname === '/') {
                  // Scroll to top of page when clicking Home on home page
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-md transition-colors text-base font-medium ${pathname === '/dashboard'
                    ? 'bg-[var(--macos-primary)] text-white'
                    : 'text-[var(--macos-text)] hover:text-white hover:bg-[var(--macos-primary-hover)]'}`}
                >
                  My Airdrops
                </Link>
                {/* Use the isAdmin function for more reliable checking */}
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-md transition-colors text-base font-medium ${pathname === '/admin'
                      ? 'bg-[var(--macos-primary)] text-white'
                      : 'text-[var(--macos-text)] hover:text-white hover:bg-[var(--macos-primary-hover)]'}`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            <div className="flex items-center space-x-3 ml-4">
              {user ? (
                <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName || user.username}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/32?text=User';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <FaUserCircle size={20} />
                      </div>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathname === '/profile' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="mr-2 text-gray-500 dark:text-gray-400" />
                        Profile
                      </Link>

                      <Link
                        to="/dashboard"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathname === '/dashboard' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaCog className="mr-2 text-gray-500 dark:text-gray-400" />
                        My Airdrops
                      </Link>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout(true);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaSignOutAlt className="mr-2 text-gray-500 dark:text-gray-400" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="macos-button text-base px-5 py-2 secondary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="macos-button text-base px-5 py-2 bg-[var(--macos-success)]"
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
                className={`py-2 ${pathname === '/'
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'}`}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (pathname === '/') {
                    // Scroll to top of page when clicking Home on home page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`py-2 ${pathname === '/dashboard'
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Airdrops
                  </Link>
                  <Link
                    to="/profile"
                    className={`py-2 ${pathname === '/profile'
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  {/* Use the isAdmin function for more reliable checking */}
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className={`py-2 ${pathname === '/admin'
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'}`}
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
                    <div className="flex items-center space-x-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName || user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/32?text=User';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <FaUserCircle size={20} />
                        </div>
                      )}
                      <span className="text-sm font-medium text-black dark:text-white">
                        {user.displayName || user.username}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout(true);
                        setIsMenuOpen(false);
                      }}
                      className="macos-button text-sm bg-[var(--macos-danger)]"
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
