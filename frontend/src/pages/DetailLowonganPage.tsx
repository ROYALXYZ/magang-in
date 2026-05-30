import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { internshipService } from '../services/internship.service';
import { applicationService } from '../services/application.service';
import { useAuth } from '../contexts/AuthContext';
import type { Internship } from '../types';
import styles from './DetailLowonganPage.module.css';

export function DetailLowonganPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const backLink = location.pathname.includes('/dashboard') ? '/dashboard/lowongan' : '/lowongan';

  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await internshipService.getById(id);
      setInternship(response.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          setError('404');
        } else {
          setError('Gagal memuat detail lowongan.');
        }
      } else {
        setError('Tidak dapat terhubung ke server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // Check if user already applied
    if (isAuthenticated && user?.role === 'pengguna' && id) {
      applicationService.getMyApplications().then(res => {
        const alreadyApplied = res.data.some(app => app.internshipId === id);
        if (alreadyApplied) {
          setHasApplied(true);
          setApplySuccess(true);
        }
      }).catch(() => {});
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat detail lowongan...</p>
      </div>
    );
  }

  // 404 state
  if (error === '404') {
    return (
      <div className={styles.errorContainer}>
        <h2>Lowongan Tidak Ditemukan</h2>
        <p>Lowongan yang kamu cari tidak ada atau sudah ditutup.</p>
        <Link to={backLink} className={styles.backBtn}>Kembali ke Daftar Lowongan</Link>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button onClick={fetchDetail} className={styles.retryBtn}>Coba Lagi</button>
      </div>
    );
  }

  if (!internship) return null;

  // Parse benefits menjadi array
  const benefitsList = internship.benefits?.split(',').map(b => b.trim()).filter(Boolean) || [];
  // Parse requirements menjadi array
  const requirementsList = internship.requirements?.split('\n').map(r => r.trim()).filter(Boolean) || 
    internship.requirements?.split(',').map(r => r.trim()).filter(Boolean) || [];

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi: hanya PDF, max 5MB
    if (file.type !== 'application/pdf') {
      setApplyError('File harus berformat PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setApplyError('Ukuran file maksimal 5MB.');
      return;
    }

    setApplyError('');
    setCvFile(file);
  };

  // Handle submit lamaran
  const handleApply = async () => {
    if (!id) return;

    setApplyLoading(true);
    setApplyError('');

    try {
      await applicationService.apply(id, coverLetter || undefined, cvFile || undefined);
      setApplySuccess(true);
      setHasApplied(true);
      // Auto close modal setelah 1.5 detik
      setTimeout(() => {
        closeApplyModal();
      }, 1500);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        const msg = axiosErr.response?.data?.message || '';
        if (msg.toLowerCase().includes('sudah') || msg.toLowerCase().includes('already')) {
          setApplyError('Kamu sudah pernah melamar di lowongan ini.');
        } else {
          setApplyError(msg || 'Gagal mengirim lamaran. Coba lagi.');
        }
      } else {
        setApplyError('Tidak dapat terhubung ke server.');
      }
    } finally {
      setApplyLoading(false);
    }
  };

  // Reset modal state
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setCoverLetter('');
    setCvFile(null);
    setApplyError('');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            {internship.company.charAt(0).toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{internship.title}</h1>
            <p className={styles.company}>
              {internship.company} <span className={styles.dot}>·</span> {internship.location}
            </p>
            <div className={styles.tags}>
              {internship.type && <span className={styles.tag}>{internship.type}</span>}
              {internship.duration && <span className={styles.tag}>{internship.duration}</span>}
              {internship.level && <span className={styles.tag}>{internship.level}</span>}
            </div>
          </div>
        </div>
        {isAuthenticated && user?.role === 'pengguna' && (
          <button 
            className={styles.applyBtn} 
            onClick={() => setShowApplyModal(true)}
            disabled={hasApplied}
          >
            {hasApplied ? '✓ Sudah Dilamar' : 'Lamar Sekarang'}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          {/* Deskripsi */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Deskripsi</h2>
            <p className={styles.description}>{internship.description}</p>
          </div>

          {/* Persyaratan */}
          {requirementsList.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Persyaratan</h2>
              <ul className={styles.requirementsList}>
                {requirementsList.map((req, i) => (
                  <li key={i} className={styles.requirementItem}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className={styles.checkIcon}>
                      <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2" />
                      <path d="M8 12l2.5 2.5L16 9.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefit */}
          {benefitsList.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Benefit</h2>
              <div className={styles.benefitsGrid}>
                {benefitsList.map((benefit, i) => (
                  <div key={i} className={styles.benefitItem}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2" />
                      <path d="M12 8v8M8 12h8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {internship.roadmaps && internship.roadmaps.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Roadmap Belajar</h2>
              <div className={styles.roadmap}>
                {internship.roadmaps.map((item, i) => (
                  <div key={item.id} className={styles.roadmapItem}>
                    <div className={styles.roadmapDot} style={{ background: i < internship.roadmaps!.length - 1 ? '#6366f1' : '#cbd5e1' }} />
                    {i < internship.roadmaps!.length - 1 && <div className={styles.roadmapLine} />}
                    <div className={styles.roadmapContent}>
                      <span className={styles.roadmapTitle}>{item.title}</span>
                    </div>
                    {item.contentUrl && (
                      <a href={item.contentUrl} target="_blank" rel="noopener noreferrer" className={styles.roadmapLink}>
                        <svg width="18" height="18" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className={styles.rightCol}>
          {/* Info Card */}
          <div className={styles.infoCard}>
            {internship.major && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>JURUSAN</span>
                <span className={styles.infoValue}>{internship.major}</span>
              </div>
            )}
            {internship.type && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>TIPE</span>
                <span className={styles.infoValue}>{internship.type}</span>
              </div>
            )}
            {internship.duration && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>DURASI</span>
                <span className={styles.infoValue}>{internship.duration}</span>
              </div>
            )}
            {internship.level && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>LEVEL</span>
                <span className={styles.infoValue}>{internship.level}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>LOKASI</span>
              <span className={styles.infoValue}>{internship.location}</span>
            </div>
          </div>

          {/* Skills */}
          {internship.skills.length > 0 && (
            <div className={styles.skillsCard}>
              <h3 className={styles.skillsTitle}>Skills Required</h3>
              <div className={styles.skillsTags}>
                {internship.skills.map((s) => (
                  <span key={s.skill.id} className={styles.skillTag}>{s.skill.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className={styles.modalOverlay} onClick={closeApplyModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Lamar Magang</h2>
              <button className={styles.modalClose} onClick={closeApplyModal}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalJobTitle}>{internship.title} — {internship.company}</p>

              {/* Upload CV */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Upload CV (PDF, maks 5MB)</label>
                <div 
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {cvFile ? (
                    <div className={styles.fileSelected}>
                      <svg width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>{cvFile.name}</span>
                      <button 
                        className={styles.removeFileBtn}
                        onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <svg width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Klik untuk upload CV</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Cover Letter (opsional)</label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Ceritakan mengapa kamu cocok untuk posisi ini..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Error */}
              {applyError && (
                <div className={styles.modalError}>{applyError}</div>
              )}

              {/* Success */}
              {applySuccess && (
                <div className={styles.modalSuccess}>
                  ✓ Lamaran berhasil dikirim! Kamu bisa cek statusnya di halaman Lamaran.
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={closeApplyModal}>
                Batal
              </button>
              <button 
                className={styles.modalSubmitBtn} 
                onClick={handleApply}
                disabled={applyLoading || applySuccess}
              >
                {applyLoading ? 'Mengirim...' : applySuccess ? '✓ Terkirim' : 'Kirim Lamaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
