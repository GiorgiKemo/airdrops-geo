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
  const { resetDisplayCount } = useDisplay();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileMenuId = 'mobile-navigation';
  const userMenuId = 'user-navigation-menu';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (isMenuOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const getNavLinkClass = (isActive) => (
    `px-4 py-2 rounded-md transition-colors text-base font-medium ${isActive
      ? 'bg-[var(--macos-primary)] text-white'
      : 'text-[var(--macos-text)] hover:text-white hover:bg-[var(--macos-primary-hover)]'}`
  );

  const getMobileLinkClass = (isActive) => (
    `block rounded-md px-3 py-3 text-base font-medium transition-colors ${isActive
      ? 'bg-[var(--macos-selection)] text-[var(--macos-primary)]'
      : 'text-[var(--macos-text)] hover:bg-[var(--macos-hover)]'}`
  );

  return (
    <nav
      ref={navRef}
      className="macos-toolbar fixed top-0 left-0 right-0 w-full z-[1000] shadow-md transition-colors duration-200"
      aria-label="Primary navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-bold text-[var(--macos-primary)]"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                resetDisplayCount();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                closeMobileMenu();
              }
            }}
          >
            Airdrops.geo
          </Link>

          <button
            type="button"
            className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--macos-text)] hover:bg-[var(--macos-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--macos-primary)] transition-colors"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls={mobileMenuId}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={getNavLinkClass(pathname === '/')}
              aria-current={pathname === '/' ? 'page' : undefined}
              onClick={() => {
                if (pathname === '/') {
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
                  className={getNavLinkClass(pathname === '/dashboard')}
                  aria-current={pathname === '/dashboard' ? 'page' : undefined}
                >
                  My Airdrops
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={getNavLinkClass(pathname === '/admin')}
                    aria-current={pathname === '/admin' ? 'page' : undefined}
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
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                    aria-label={isDropdownOpen ? 'Close user menu' : 'Open user menu'}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                    aria-controls={userMenuId}
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

                  {isDropdownOpen && (
                    <div
                      id={userMenuId}
                      className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                    >
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
                        type="button"
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

        {isMenuOpen && (
          <div
            id={mobileMenuId}
            className="md:hidden mt-3 border-t border-[var(--macos-divider)] pt-3"
            aria-label="Mobile navigation"
          >
            <div className="flex max-h-[calc(100vh-5rem)] flex-col gap-2 overflow-y-auto pb-1">
              <Link
                to="/"
                className={getMobileLinkClass(pathname === '/')}
                aria-current={pathname === '/' ? 'page' : undefined}
                onClick={() => {
                  closeMobileMenu();
                  if (pathname === '/') {
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
                    className={getMobileLinkClass(pathname === '/dashboard')}
                    aria-current={pathname === '/dashboard' ? 'page' : undefined}
                    onClick={closeMobileMenu}
                  >
                    My Airdrops
                  </Link>
                  <Link
                    to="/profile"
                    className={getMobileLinkClass(pathname === '/profile')}
                    aria-current={pathname === '/profile' ? 'page' : undefined}
                    onClick={closeMobileMenu}
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={getMobileLinkClass(pathname === '/admin')}
                      aria-current={pathname === '/admin' ? 'page' : undefined}
                      onClick={closeMobileMenu}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}

              <div className="flex flex-col gap-3 py-2">
                {user ? (
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
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
                      <span className="min-w-0 truncate text-sm font-medium text-[var(--macos-text)]">
                        {user.displayName || user.username}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout(true);
                        closeMobileMenu();
                      }}
                      className="macos-button shrink-0 text-sm bg-[var(--macos-danger)]"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="macos-button w-full min-w-0 text-center text-sm"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="macos-button w-full min-w-0 bg-[var(--macos-success)] text-center text-sm"
                      onClick={closeMobileMenu}
                    >
                      Register
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-md bg-[var(--macos-hover)] px-3 py-2">
                  <span className="text-sm font-medium text-[var(--macos-text)]">Theme</span>
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
