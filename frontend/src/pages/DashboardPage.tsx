import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/application.service';

import { aiService } from '../services/ai.service';
import { authService } from '../services/auth.service';
import type { MatchResult, User } from '../types';
import { EditProfilModal } from '../components/EditProfilModal';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { user } = useAuth();

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [profile, setProfile] = useState<User | null>(user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, profileRes] = await Promise.allSettled([
          applicationService.getMyApplications(),
          authService.getProfile(),
        ]);
        if (appRes.status === 'fulfilled') {
          setApplications(appRes.value.data);
        }

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
        }

        // Try to get AI matches (backend will use DB skills if no cached skills)
        const cached = sessionStorage.getItem('user_skills_for_match');
        try {
          const matchRes = await aiService.matchInternship(cached ? JSON.parse(cached) : undefined);
          const rawMatches = matchRes.data.matches || [];
          setMatches(rawMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3));
        } catch { /* ignore */ }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const stats = {
    total: applications.length,
    accepted: applications.filter(a => (a.status === 'accepted' || a.status === 'diterima')).length,
    pending: applications.filter(a => (a.status === 'pending' || a.status === 'menunggu')).length,
  };

  const statusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'diterima': return <span className={styles.badgeGreen}>Diterima</span>;
      case 'rejected':
      case 'ditolak': return <span className={styles.badgeRed}>Ditolak</span>;
      default: return <span className={styles.badgeGray}>Pending</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Selamat datang, {user?.name || 'User'}!</h1>
          <p className={styles.subtitle}>Berikut ringkasan aktivitas kamu hari ini.</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eef2ff' }}>
            <svg width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <span className={styles.statLabel}>TOTAL LAMARAN</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe' }}>
            <svg width="22" height="22" fill="none" stroke="#0ea5e9" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 16 14"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <span className={styles.statLabel}>DITERIMA</span>
            <span className={styles.statValue}>{stats.accepted}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff7ed' }}>
            <svg width="22" height="22" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div>
            <span className={styles.statLabel}>MENUNGGU REVIEW</span>
            <span className={styles.statValue}>{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.grid}>
        {/* Rekomendasi Teratas */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rekomendasi Teratas</h2>
            <Link to="/dashboard/rekomendasi" className={styles.seeAll}>Lihat Semua</Link>
          </div>
          {matches.length > 0 ? (
            <div className={styles.matchCards}>
              {matches.map((m) => (
                <Link to={`/dashboard/lowongan/${m.internshipId}`} key={m.internshipId} className={styles.matchCard}>
                  <div className={styles.matchCardHeader}>
                    <div className={styles.matchIcon}>
                      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </div>
                    <span className={styles.matchScoreBadge}>{Math.round(m.matchScore)}% Match</span>
                  </div>
                  <h4 className={styles.matchTitle}>{m.title}</h4>
                  <p className={styles.matchCompany}>{m.company}</p>
                  <div className={styles.matchTags}>
                    <span className={styles.matchTag}>Remote</span>
                    <span className={styles.matchTag}>ReactJS</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum ada rekomendasi. Lengkapi skill kamu dulu.</p>
          )}
        </div>

        {/* Lamaran Terbaru */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lamaran Terbaru</h2>
            <Link to="/dashboard/lamaran" className={styles.seeAll}>Lihat Semua</Link>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Posisi</th>
                  <th>Perusahaan</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.slice(0, 5).map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className={styles.posTitle}>{app.internship.title}</div>
                        <div className={styles.posSub}>{app.internship.type || 'Intern'}</div>
                      </td>
                      <td>{app.internship.company}</td>
                      <td>{new Date(app.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>{statusBadge(app.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.emptyTable}>Belum ada lamaran.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Banner Promo */}
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <h4 className={styles.promoTitle}>Tingkatkan Peluang Kamu!</h4>
              <p className={styles.promoDesc}>Lengkapi skill data science untuk mendapatkan skor match 100% pada 15 lowongan baru minggu ini.</p>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '75%' }}></div>
                </div>
                <span className={styles.progressText}>Profil Selesai 75%</span>
              </div>
            </div>
            <Link to="/dashboard/roadmap" className={styles.promoBtn}>
              Ayo selesaikan!
            </Link>
          </div>
        </div>
      </div>

      <EditProfilModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userProfile={profile}
        onSuccess={(updatedUser) => setProfile(updatedUser)}
      />
    </div>
  );
}
