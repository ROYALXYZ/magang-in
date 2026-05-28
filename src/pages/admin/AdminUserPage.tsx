import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminUser } from '../../types';
import styles from './AdminUserPage.module.css';

function RoleDropdown({ currentRole, onRoleChange }: { currentRole: string, onRoleChange: (role: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { value: 'pengguna', label: 'Pengguna' },
    { value: 'mitra', label: 'Mitra' },
    { value: 'admin', label: 'Admin' }
  ];

  const selectedRole = roles.find(r => r.value === currentRole) || roles[0];

  return (
    <div className={styles.customDropdown} ref={dropdownRef}>
      <button 
        type="button" 
        className={styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedRole.label}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {roles.map(role => (
            <button
              key={role.value}
              type="button"
              className={`${styles.dropdownItem} ${currentRole === role.value ? styles.dropdownItemActive : ''}`}
              onClick={() => {
                onRoleChange(role.value);
                setIsOpen(false);
              }}
            >
              {role.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminUserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getAllUsers();
      setUsers(res.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Pengguna') return u.role === 'pengguna';
    if (activeTab === 'Mitra') return u.role === 'mitra';
    if (activeTab === 'Admin') return u.role === 'admin';
    return true;
  });

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUser(userId, { role: newRole });
      fetchUsers();
      setEditingUser(null);
    } catch {
      alert('Gagal mengubah role user.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini? Aksi ini tidak bisa dibatalkan.')) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
    } catch {
      alert('Gagal menghapus user.');
    }
  };

  const stats = {
    total: users.length,
    pengguna: users.filter(u => u.role === 'pengguna').length,
    mitra: users.filter(u => u.role === 'mitra').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageInfo}>
        <div>
          <h1 className={styles.pageTitle}>Manajemen User</h1>
          <p className={styles.pageSub}>Kelola akses, role, dan status keanggotaan seluruh pengguna platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>TOTAL USERS</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>PENGGUNA</span>
          <span className={styles.statValue}>{stats.pengguna}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>MITRA</span>
          <span className={styles.statValue}>{stats.mitra}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>ADMIN</span>
          <span className={styles.statValue}>{stats.admin}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tableControls}>
        <div className={styles.tabs}>
          {['Semua', 'Pengguna', 'Mitra', 'Admin'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data user...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama & Email</th>
                <th>Role</th>
                <th>Tanggal Daftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar} style={{ background: user.role === 'admin' ? '#475569' : user.role === 'mitra' ? '#0ea5e9' : '#6366f1', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className={styles.userName}>{user.name || 'Tanpa Nama'}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.roleBadge} ${user.role === 'mitra' ? styles.roleMitra : user.role === 'admin' ? styles.roleAdmin : styles.roleStudent}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      <RoleDropdown 
                        currentRole={user.role} 
                        onRoleChange={(newRole) => handleChangeRole(user.id, newRole)} 
                      />
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={styles.deleteBtn}
                        title="Hapus User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={styles.deleteIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
