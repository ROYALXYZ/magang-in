import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Tentukan link aktif
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Dashboard URL berdasarkan role
  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'mitra': return '/mitra/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/dashboard';
    }
  };

  // Profile URL berdasarkan role
  const getProfileUrl = () => {
    if (!user) return '/dashboard/profil';
    switch (user.role) {
      case 'mitra': return '/mitra/profil';
      case 'admin': return '/admin/dashboard'; // Admin tidak ada halaman profil khusus
      default: return '/dashboard/profil';
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Magang</span>
          <span className={styles.logoAccent}>-in</span>
        </Link>

        {/* Hamburger toggle button (visible on mobile/tablet, hidden on desktop) */}
        <button
          className={styles.hamburger}
          data-testid="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Nav Links (desktop only) */}
        <ul className={styles.navLinks}>
          <li>
            <Link to="/lowongan" className={isActive('/lowongan') ? styles.navLinkActive : styles.navLink}>
              Lowongan
            </Link>
          </li>
          <li>
            <Link to="/perusahaan" className={isActive('/perusahaan') ? styles.navLinkActive : styles.navLink}>
              Perusahaan
            </Link>
          </li>  
        </ul>

        {/* Right side */}
        <div className={styles.navRight}>
          {isAuthenticated && user ? (
            <>
              <button
                onClick={toggleTheme}
                className={styles.themeToggle}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </button>
              <button className={styles.iconBtn} aria-label="Notifications">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {/* User avatar + dropdown */}
              <div className={styles.userMenu}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name || ''} className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div className={styles.dropdownOverlay} onClick={() => setDropdownOpen(false)} />
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownName}>{user.name || 'User'}</span>
                        <span className={styles.dropdownEmail}>{user.email}</span>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link to={getDashboardUrl()} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        Dashboard
                      </Link>
                      {user.role !== 'admin' && (
                        <Link to={getProfileUrl()} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Profile
                        </Link>
                      )}
                      <div className={styles.dropdownDivider} />
                      <button className={styles.dropdownItemDanger} onClick={logout}>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={toggleTheme}
                className={styles.themeToggle}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </button>
              <Link to="/login" className={styles.loginBtn}>Masuk</Link>
              <Link to="/register" className={styles.registerBtn}>Daftar</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <Link
          to="/lowongan"
          className={styles.mobileNavLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Lowongan
        </Link>
        <Link
          to="/perusahaan"
          className={styles.mobileNavLink}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Perusahaan
        </Link>
        {isAuthenticated && user && (
          <>
            <Link
              to={getDashboardUrl()}
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user.role !== 'admin' && (
              <Link
                to={getProfileUrl()}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link
              to="/login"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Daftar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
