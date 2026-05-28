import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/application.service';
import type { Application } from '../types';
import styles from './LamaranPage.module.css';

export function LamaranPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit modal state
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchApps = async () => {
    try {
      const response = await applicationService.getMyApplications();
      setApplications(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data lamaran.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className={`${styles.badge} ${styles.badgeAccepted}`}>DITERIMA</span>;
      case 'rejected':
        return <span className={`${styles.badge} ${styles.badgeRejected}`}>DITOLAK</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgePending}`}>MENUNGGU REVIEW</span>;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin membatalkan lamaran ini?')) return;
    try {
      await applicationService.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membatalkan lamaran.');
    }
  };

  const handleEditOpen = (app: Application) => {
    setEditingApp(app);
    setEditCoverLetter(app.coverLetter || '');
    setEditFile(null);
  };

  const handleEditSubmit = async () => {
    if (!editingApp) return;
    setIsSubmitting(true);
    try {
      await applicationService.updateApplication(editingApp.id, editCoverLetter, editFile || undefined);
      setEditingApp(null);
      // Refresh data
      setIsLoading(true);
      await fetchApps();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui lamaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lamaran Saya</h1>
        <p className={styles.subtitle}>Lacak status semua pendaftaran magang yang telah kamu kirimkan.</p>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div style={{
            width: '36px', height: '36px', border: '3px solid #e2e8f0',
            borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }} />
          <p>Memuat lamaran...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && !isLoading && (
        <div className={styles.error}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>Coba Lagi</button>
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📁</div>
          <h3 className={styles.emptyText}>Belum ada lamaran</h3>
          <p className={styles.emptySub}>Kamu belum pernah mengirim lamaran magang apa pun. Mulai eksplorasi dan temukan posisi yang cocok untukmu!</p>
          <Link to="/dashboard/lowongan" className={styles.exploreBtn}>Eksplorasi Lowongan</Link>
        </div>
      )}

      {!isLoading && !error && applications.length > 0 && (
        <div>
          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Cari berdasarkan posisi, perusahaan, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div className={styles.list}>
          {applications
            .filter(app => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                app.internship.title.toLowerCase().includes(q) ||
                app.internship.company.toLowerCase().includes(q) ||
                (app.internship.location || '').toLowerCase().includes(q) ||
                app.status.toLowerCase().includes(q)
              );
            })
            .map((app) => (
            <div key={app.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.jobInfo}>
                  <div className={styles.companyLogo}>
                    {app.internship.company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.jobTitle}>{app.internship.title}</h3>
                    <div className={styles.jobCompany}>
                      {app.internship.company} • {app.internship.location}
                    </div>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.appliedDate}>
                  Dilamar pada: {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleEditOpen(app)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                          background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Batalkan
                      </button>
                    </>
                  )}
                  <Link to={`/dashboard/lowongan/${app.internshipId}`} className={styles.detailBtn}>
                    Lihat Lowongan
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingApp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }} onClick={() => setEditingApp(null)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px',
            width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>Edit Lamaran</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b' }}>
              {editingApp.internship.title} — {editingApp.internship.company}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                Cover Letter
              </label>
              <textarea
                value={editCoverLetter}
                onChange={(e) => setEditCoverLetter(e.target.value)}
                placeholder="Tulis cover letter kamu..."
                rows={4}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                Ganti CV (opsional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                style={{ fontSize: '13px' }}
              />
              {editFile && <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>File baru: {editFile.name}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingApp(null)}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  background: '#6366f1', color: 'white', fontSize: '13px', fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
