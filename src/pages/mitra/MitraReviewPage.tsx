import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { internshipService } from '../../services/internship.service';
import type { Internship } from '../../types';
import styles from './MitraReviewPage.module.css';

interface ApplicantData {
  id: string;
  status: string;
  coverLetter?: string;
  attachmentUrl?: string;
  createdAt: string;
  applicant: {
    name: string;
    email: string;
    skills?: { skill: { id: string; name: string } }[];
  };
  internship?: {
    id: string;
    title: string;
    company: string;
  };
}

export function MitraReviewPage() {
  const [searchParams] = useSearchParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>(searchParams.get('internship') || 'all');
  const [applicants, setApplicants] = useState<ApplicantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch internships list for dropdown
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await internshipService.getMyInternships();
        setInternships(res.data);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    fetchInternships();
  }, []);

  // Fetch applicants based on selected internship
  useEffect(() => {
    if (isLoading) return;

    const fetchApplicants = async () => {
      setIsLoadingApplicants(true);
      try {
        if (selectedInternshipId === 'all') {
          const res = await internshipService.getAllMyApplicants();
          setApplicants(res.data);
        } else {
          const res = await internshipService.getApplicants(selectedInternshipId);
          const job = internships.find(i => i.id === selectedInternshipId);
          const withInternship = res.data.map((a: any) => ({
            ...a,
            internship: job ? { id: job.id, title: job.title, company: job.company } : undefined
          }));
          setApplicants(withInternship);
        }
      } catch {
        setApplicants([]);
      } finally {
        setIsLoadingApplicants(false);
      }
    };

    fetchApplicants();
  }, [selectedInternshipId, isLoading]);

  // Filter applicants by search query
  const filteredApplicants = applicants.filter(app => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.applicant.name || '').toLowerCase().includes(q) ||
      (app.applicant.email || '').toLowerCase().includes(q) ||
      (app.internship?.title || '').toLowerCase().includes(q) ||
      (app.internship?.company || '').toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await internshipService.updateApplicationStatus(applicationId, status);
      setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
    } catch {
      alert('Gagal mengubah status pelamar.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topNav}>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbActive}>Review Pelamar</span>
        </div>
      </div>

      {/* Header */}
      <div className={styles.headerCard}>
        <div>
          <h1 className={styles.jobTitle}>Daftar Pelamar</h1>
          <p className={styles.jobSub}>Lihat dan kelola semua lamaran yang masuk.</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat...</div>
      ) : (
        <>
          {/* Filter row: search + dropdown */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Cari nama, email, lowongan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <select
              value={selectedInternshipId}
              onChange={(e) => setSelectedInternshipId(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', maxWidth: '400px' }}
            >
              <option value="all">Semua Lowongan</option>
              {internships.map(i => (
                <option key={i.id} value={i.id}>{i.title} — {i.company}</option>
              ))}
            </select>
          </div>

          {/* Applicant List */}
          {isLoadingApplicants ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Memuat pelamar...</div>
          ) : filteredApplicants.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              {searchQuery ? 'Tidak ada pelamar yang cocok dengan pencarian.' : 'Belum ada pelamar.'}
            </div>
          ) : (
            <div className={styles.applicantList}>
              {filteredApplicants.map((app) => (
                <div key={app.id} className={styles.applicantCard} style={{ borderLeftColor: app.status === 'accepted' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                  <div className={styles.applicantInfo}>
                    <div className={styles.avatarWrapper}>
                      <div className={styles.avatar} style={{ background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontWeight: 700 }}>
                        {app.applicant.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </div>
                    <div>
                      <h3 className={styles.name}>{app.applicant.name || 'Tanpa Nama'}</h3>
                      <div className={styles.edu}>{app.applicant.email}</div>
                      {app.internship && (
                        <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '4px', fontWeight: 500 }}>
                          📋 {app.internship.title}
                        </div>
                      )}
                      {app.applicant.skills && app.applicant.skills.length > 0 && (
                        <div className={styles.skillChips}>
                          {app.applicant.skills.slice(0, 5).map(s => (
                            <span key={s.skill.id} className={styles.skillChip}>{s.skill.name}</span>
                          ))}
                          {app.applicant.skills.length > 5 && (
                            <span className={styles.skillChip}>+{app.applicant.skills.length - 5}</span>
                          )}
                        </div>
                      )}
                      {app.coverLetter && (
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                          "{app.coverLetter.substring(0, 100)}{app.coverLetter.length > 100 ? '...' : ''}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.scoreWrapper}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Status:</span>
                      <span style={{
                        display: 'inline-block', marginLeft: '8px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                        background: app.status === 'accepted' ? '#ecfdf5' : app.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                        color: app.status === 'accepted' ? '#059669' : app.status === 'rejected' ? '#dc2626' : '#d97706',
                      }}>
                        {app.status === 'accepted' ? 'Diterima' : app.status === 'rejected' ? 'Ditolak' : 'Pending'}
                      </span>
                    </div>
                    {app.attachmentUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${app.attachmentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                          background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd',
                          textDecoration: 'none', marginTop: '8px', cursor: 'pointer'
                        }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        Lihat CV
                      </a>
                    )}
                    {app.status === 'pending' && (
                      <div className={styles.actions}>
                        <button className={styles.tolakBtn} onClick={() => handleUpdateStatus(app.id, 'rejected')}>Tolak</button>
                        <button className={styles.terimaBtn} onClick={() => handleUpdateStatus(app.id, 'accepted')}>Terima</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
