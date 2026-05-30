import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import styles from './DashboardLayout.module.css';

function MenuIcon({ name }: { name: string }) {
  switch (name) {
    case 'grid':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'briefcase':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
    case 'sparkle':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>;
    case 'document':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case 'code':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    case 'user':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    default:
      return null;
  }
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Define menu items based on role
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Beranda', icon: 'grid' },
        { path: '/admin/users', label: 'Manajemen User', icon: 'user' },
        { path: '/admin/verifikasi', label: 'Verifikasi Mitra', icon: 'document' },
        { path: '/admin/lowongan', label: 'Kelola Lowongan', icon: 'briefcase' },
        { path: '/admin/laporan', label: 'Laporan & Data', icon: 'sparkle' },
      ];
    }
    if (user?.role === 'mitra') {
      return [
        { path: '/mitra/dashboard', label: 'Beranda', icon: 'grid' },
        { path: '/mitra/lowongan', label: 'Lowongan Saya', icon: 'briefcase' },
        { path: '/mitra/pelamar', label: 'Kelola Pelamar', icon: 'user' },
      ];
    }
    // Default Student
    return [
      { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { path: '/dashboard/lamaran', label: 'Lamaran Saya', icon: 'document' },
      { path: '/dashboard/lowongan', label: 'Lowongan', icon: 'briefcase' },
      { path: '/dashboard/rekomendasi', label: 'Rekomendasi AI', icon: 'sparkle' },
      { path: '/dashboard/roadmap', label: 'Roadmap', icon: 'code' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className={styles.layout}>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <button 
          className={styles.menuToggle}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className={styles.mobileBrand}>Magang-in</div>
        <div className={styles.mobileActions}>
           <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt="Profile" className={styles.miniAvatar} />
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Magang-in</span>
          <span className={styles.brandSub}>AI INTERNSHIP PLATFORM</span>
        </div>
      
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? styles.navItemActive : styles.navItem}
              onClick={() => setIsSidebarOpen(false)}
            >
              <MenuIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link to={user?.role === 'pengguna' ? "/dashboard/profil" : "#"} className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.name || 'User'}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </Link>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '10px 14px', background: 'none', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 500, color: 'var(--text)', cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            aria-label="Toggle theme"
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
            {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
          </button>
          <button className={styles.logoutBtn} onClick={logout}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
