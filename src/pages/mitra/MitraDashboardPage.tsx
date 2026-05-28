import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { internshipService } from '../../services/internship.service';
import type { Internship } from '../../types';
import styles from './MitraDashboardPage.module.css';

export function MitraDashboardPage() {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await internshipService.getMyInternships();
        setInternships(res.data);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const activeCount = internships.filter(i => !i.isClosed).length;

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>Halo, {user?.name || 'Mitra'}!</h1>
          <p className={styles.welcomeSub}>Berikut ringkasan lowongan dan pelamar Anda.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eef2ff', color: '#6366f1' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <span className={styles.statLabel}>LOWONGAN AKTIF</span>
          <div className={styles.statValue}>{activeCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <span className={styles.statLabel}>TOTAL LOWONGAN</span>
          <div className={styles.statValue}>{internships.length}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.contentGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lowongan Terbaru</h2>
            <Link to="/mitra/lowongan" className={styles.seeAll}>Lihat Semua</Link>
          </div>
          {isLoading ? (
            <p style={{ color: '#64748b' }}>Memuat...</p>
          ) : internships.length === 0 ? (
            <p style={{ color: '#64748b' }}>Belum ada lowongan. Klik "Pasang Lowongan" di sidebar.</p>
          ) : (
            <div className={styles.activityList}>
              {internships.slice(0, 5).map(job => (
                <div key={job.id} className={styles.activityItem}>
                  <div className={styles.activityInfo}>
                    <div>
                      <div className={styles.activityText}>
                        <span className={styles.applicantName}>{job.title}</span>
                      </div>
                      <div className={styles.activityMeta}>{job.location} • {job.isClosed ? 'Ditutup' : 'Aktif'}</div>
                    </div>
                  </div>
                  <Link to={`/mitra/pelamar?internship=${job.id}`} className={styles.reviewBtn}>Lihat Pelamar</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
