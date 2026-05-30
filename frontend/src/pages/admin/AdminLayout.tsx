import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import styles from '../../components/DashboardLayout.module.css'; // Reuse basic layout styles

const adminMenuItems = [
  { path: '/admin', label: 'Beranda', icon: 'grid' },
  { path: '/admin/users', label: 'Manajemen User', icon: 'users' },
  { path: '/admin/verifikasi', label: 'Verifikasi Mitra', icon: 'shield' },
  { path: '/admin/lowongan', label: 'Kelola Lowongan', icon: 'briefcase' },
  { path: '/admin/laporan', label: 'Laporan & Data', icon: 'bar-chart' },
];

function MenuIcon({ name }: { name: string }) {
  switch (name) {
    case 'grid':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'users':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'shield':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'briefcase':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
    case 'bar-chart':
      return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    default:
      return null;
  }
}

export function AdminLayout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Magang-in</span>
          <span className={styles.brandSub}>ADMIN PANEL</span>
        </div>

        <nav className={styles.nav}>
          {adminMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? styles.navItemActive : styles.navItem}
            >
              <MenuIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo} style={{ background: 'var(--bg-light)' }}>
            <img 
              src="https://ui-avatars.com/api/?name=Super+Admin&background=1e293b&color=fff" 
              alt="Admin" 
              style={{ width: '36px', height: '36px', borderRadius: '50%' }} 
            />
            <div className={styles.userMeta}>
              <span className={styles.userName}>Super Admin</span>
              <span className={styles.userEmail}>admin@magangin.id</span>
            </div>
          </div>
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
