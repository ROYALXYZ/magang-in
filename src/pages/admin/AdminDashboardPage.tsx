import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, type AdminStats } from '../../services/admin.service';
import styles from './AdminDashboardPage.module.css';

interface Activity {
  type: string;
  text: string;
  time: string;
}

interface TrendData {
  day: string;
  count: number;
  date: string;
}

interface PendingMitra {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDate(date: Date) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = days[date.getDay()];
  const dd = date.getDate();
  const mm = months[date.getMonth()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mn = String(date.getMinutes()).padStart(2, '0');
  return `${day}, ${dd} ${mm} | ${hh}:${mn} WIB`;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [pendingMitras, setPendingMitras] = useState<PendingMitra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, trendRes, mitraRes] = await Promise.allSettled([
          adminService.getStats(),
          adminService.getActivity(),
          adminService.getUserTrend(),
          adminService.getPendingMitra(),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (activityRes.status === 'fulfilled') setActivities(activityRes.value.data);
        if (trendRes.status === 'fulfilled') setTrend(trendRes.value.data);
        if (mitraRes.status === 'fulfilled') setPendingMitras(mitraRes.value.data.slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxTrend = Math.max(...trend.map(t => t.count), 1);
  const todayIndex = trend.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.topNav}>
        <div className={styles.breadcrumb}>
          <span>Dashboard</span>
          <span className={styles.sep}>&gt;</span>
          <span className={styles.breadcrumbActive}>Beranda</span>
        </div>
        <div className={styles.topRight}>
          <div className={styles.timeBox} style={{ background: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {formatDate(now)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>Memuat statistik...</div>
      ) : stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TOTAL PENGGUNA</span>
              <span className={styles.statValue}>{stats.totalUsers}</span>
            </div>
            <div className={styles.statIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>MITRA AKTIF</span>
              <span className={styles.statValue}>{stats.totalMitra}</span>
              {stats.pendingMitraRequests ? (
                <span className={`${styles.statTrend} ${styles.statTrendWarn}`}>! {stats.pendingMitraRequests} menunggu</span>
              ) : null}
            </div>
            <div className={styles.statIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TOTAL LOWONGAN</span>
              <span className={styles.statValue}>{stats.totalInternships}</span>
            </div>
            <div className={styles.statIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TOTAL LAMARAN</span>
              <span className={styles.statValue}>{stats.totalApplications}</span>
              {stats.pendingApplications > 0 && (
                <span className={`${styles.statTrend} ${styles.statTrendWarn}`}>! {stats.pendingApplications} pending</span>
              )}
            </div>
            <div className={styles.statIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <span className={styles.quickActionLabel}>Aksi Cepat:</span>
        <Link to="/admin/users" className={styles.actionPill}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Kelola User
        </Link>
        <Link to="/admin/verifikasi" className={styles.actionPill}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Verifikasi Mitra
        </Link>
        <Link to="/admin/lowongan" className={styles.actionPill}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          Kelola Lowongan
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Pending Mitra Verification */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Daftar Tunggu Verifikasi Mitra</h2>
            <Link to="/admin/verifikasi" className={styles.seeAll}>Lihat Semua</Link>
          </div>
          {pendingMitras.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text)' }}>
              Tidak ada request mitra yang menunggu verifikasi.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Perusahaan</th>
                  <th>Tanggal Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingMitras.map((m) => {
                  const initial = (m.companyName || m.name || '?').charAt(0).toUpperCase();
                  return (
                    <tr key={m.id}>
                      <td data-label="Nama Perusahaan">
                        <div className={styles.companyInfo}>
                          <div className={styles.companyLogo} style={{ color: '#4f46e5', background: '#e0e7ff' }}>{initial}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{m.companyName || m.name}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Tanggal Daftar">
                        {new Date(m.updatedAt || m.createdAt || '').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td data-label="Aksi">
                        <Link to="/admin/verifikasi" className={styles.cekBtn}>Cek Dokumen</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* User Registration Trend */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Tren Registrasi User</h2>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Statistik 7 hari terakhir</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {trend.map((t, i) => (
              <div
                key={t.date}
                className={`${styles.chartBar} ${i === todayIndex ? styles.chartBarActive : ''}`}
                style={{ height: `${Math.max((t.count / maxTrend) * 90, 8)}%` }}
                title={`${t.day}: ${t.count} user`}
              >
                <span className={styles.dayLabel}>{t.day}</span>
                {t.count > 0 && (
                  <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {t.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Activity Log */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="22" height="22" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <h2 className={styles.sectionTitle}>Log Aktivitas Sistem</h2>
          </div>
        </div>
        {activities.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text)' }}>Belum ada aktivitas.</div>
        ) : (
          <div className={styles.logList}>
            {activities.map((act, i) => {
              const iconColors: Record<string, { bg: string; color: string }> = {
                user_register: { bg: '#eef2ff', color: '#4f46e5' },
                application: { bg: '#f0f9ff', color: '#0ea5e9' },
                internship: { bg: '#ecfdf5', color: '#059669' },
                mitra_request: { bg: '#fef3c7', color: '#d97706' },
              };
              const c = iconColors[act.type] || { bg: '#eef2ff', color: '#4f46e5' };
              return (
                <div key={i} className={styles.logItem}>
                  <div className={styles.logIcon} style={{ background: c.bg, color: c.color }}>
                    {act.type === 'user_register' && (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                    {act.type === 'application' && (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    )}
                    {act.type === 'internship' && (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    )}
                    {act.type === 'mitra_request' && (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                  </div>
                  <div>
                    <div className={styles.logContent}>{act.text}</div>
                    <span className={styles.logTime}>{timeAgo(act.time)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
