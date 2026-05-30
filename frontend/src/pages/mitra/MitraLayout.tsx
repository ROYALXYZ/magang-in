import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PostInternshipModal } from '../../components/mitra/PostInternshipModal';
import styles from '../../components/DashboardLayout.module.css';

const mitraMenuItems = [
  { path: '/mitra', label: 'Beranda', icon: 'grid' },
  { path: '/mitra/lowongan', label: 'Lowongan Saya', icon: 'briefcase' },
  { path: '/mitra/pelamar', label: 'Daftar Pelamar', icon: 'user' },
  { path: '/mitra/profil', label: 'Profil Perusahaan', icon: 'document' },
];

function MenuIcon({ name }: { name: string }) {
  switch (name) {
    case 'grid':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'briefcase':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
    case 'user':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'document':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/></svg>;
    default:
      return null;
  }
}

export function MitraLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
          <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Mitra'}&background=1e293b&color=fff`} alt="Profile" className={styles.miniAvatar} />
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
          <span className={styles.brandSub}>MITRA DASHBOARD</span>
        </div>

        <nav className={styles.nav}>
          {mitraMenuItems.map((item) => (
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
          <div style={{ marginBottom: '16px' }}>
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={() => { setIsPostModalOpen(true); setIsSidebarOpen(false); }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Pasang Lowongan
            </button>
          </div>

          <Link to="/mitra/profil" className={styles.userInfo} onClick={() => setIsSidebarOpen(false)}>
            <div className={styles.userAvatar} style={{ background: '#1e293b' }}>
              {user?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.name || 'Mitra Magang-in'}</span>
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

      <PostInternshipModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
}
