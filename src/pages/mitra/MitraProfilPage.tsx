import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { internshipService } from '../../services/internship.service';
import styles from './MitraProfilPage.module.css';

interface MitraProfile {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  companyDesc?: string;
  companyIndustry?: string;
  companySize?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyYear?: string;
  address?: string;
  phone?: string;
  profileImage?: string;
}

export function MitraProfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MitraProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<MitraProfile>>({});
  const [stats, setStats] = useState({ activeInternships: 0, totalApplicants: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, internshipsRes] = await Promise.allSettled([
          authService.getProfile(),
          internshipService.getMyInternships(),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data as any);
          setEditData(profileRes.value.data as any);
        }

        if (internshipsRes.status === 'fulfilled') {
          const internships = internshipsRes.value.data;
          setStats({
            activeInternships: internships.filter(i => !i.isClosed).length,
            totalApplicants: 0, // Will be calculated if needed
          });
        }
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile({
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        ...editData as any,
      });
      setProfile({ ...profile, ...editData } as MitraProfile);
      setIsEditing(false);
    } catch {
      alert('Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text)' }}>Memuat profil...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Top Actions */}
      <div className={styles.topActions}>
        <h1 className={styles.pageTitle}>Profil Perusahaan</h1>
        <div className={styles.btnGroup}>
          {!isEditing ? (
            <button className={styles.primaryBtn} onClick={() => setIsEditing(true)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profil
            </button>
          ) : (
            <>
              <button className={styles.outlineBtn} onClick={() => { setIsEditing(false); setEditData(profile as any); }}>Batal</button>
              <button className={styles.primaryBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className={styles.heroCard}>
        <div className={styles.companyLogo} style={{ background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '16px', fontSize: '32px', fontWeight: 800 }}>
          {(profile?.companyName || profile?.name || '?').charAt(0).toUpperCase()}
        </div>

        <div className={styles.companyMain}>
          <div className={styles.companyNameRow}>
            <h2 className={styles.companyName}>{profile?.companyName || profile?.name || 'Nama Perusahaan'}</h2>
          </div>

          <div className={styles.locRow}>
            {profile?.companyIndustry && (
              <div className={styles.locItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                {profile.companyIndustry}
              </div>
            )}
            {profile?.address && (
              <div className={styles.locItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {profile.address}
              </div>
            )}
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>LOWONGAN AKTIF</span>
              <span className={styles.statValue}>{stats.activeInternships}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>EMAIL</span>
              <span className={styles.statValue} style={{ fontSize: '14px' }}>{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>TELEPON</span>
                <span className={styles.statValue} style={{ fontSize: '14px' }}>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form or Display */}
      {isEditing ? (
        <div className={styles.section} style={{ marginTop: '24px' }}>
          <h3 className={styles.sectionTitle}>Edit Informasi Perusahaan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Nama Perusahaan</label>
              <input value={editData.companyName || ''} onChange={e => setEditData({ ...editData, companyName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Industri</label>
              <input value={editData.companyIndustry || ''} onChange={e => setEditData({ ...editData, companyIndustry: e.target.value })} placeholder="Teknologi, Pendidikan, dll" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Ukuran Perusahaan</label>
              <input value={editData.companySize || ''} onChange={e => setEditData({ ...editData, companySize: e.target.value })} placeholder="1-50, 51-200, 201-500" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Tahun Berdiri</label>
              <input value={editData.companyYear || ''} onChange={e => setEditData({ ...editData, companyYear: e.target.value })} placeholder="2020" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Website</label>
              <input value={editData.companyWebsite || ''} onChange={e => setEditData({ ...editData, companyWebsite: e.target.value })} placeholder="https://company.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>LinkedIn</label>
              <input value={editData.companyLinkedin || ''} onChange={e => setEditData({ ...editData, companyLinkedin: e.target.value })} placeholder="linkedin.com/company/..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Alamat</label>
              <input value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })} placeholder="Jakarta, Indonesia" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Telepon</label>
              <input value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} placeholder="08xxxxxxxxxx" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Deskripsi Perusahaan</label>
              <textarea value={editData.companyDesc || ''} onChange={e => setEditData({ ...editData, companyDesc: e.target.value })} rows={4} placeholder="Ceritakan tentang perusahaan Anda..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', resize: 'vertical', background: 'var(--bg-card)', color: 'var(--text-dark)' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.contentGrid}>
          <div className={styles.leftCol}>
            {/* Tentang Kami */}
            {profile?.companyDesc && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Tentang Kami
                </h3>
                <p className={styles.aboutText}>{profile.companyDesc}</p>
              </div>
            )}

            {/* Informasi Perusahaan */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Informasi Perusahaan</h3>
              <div className={styles.detailGrid}>
                {profile?.companyIndustry && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2 7h7l-5.6 4.4L17.4 22 12 17.6 6.6 22l2-8.6L3 9h7l2-7z"/></svg>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>INDUSTRI</span>
                      <span className={styles.detailValue}>{profile.companyIndustry}</span>
                    </div>
                  </div>
                )}
                {profile?.companySize && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>UKURAN PERUSAHAAN</span>
                      <span className={styles.detailValue}>{profile.companySize}</span>
                    </div>
                  </div>
                )}
                {profile?.address && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>ALAMAT</span>
                      <span className={styles.detailValue}>{profile.address}</span>
                    </div>
                  </div>
                )}
                {profile?.companyYear && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>TAHUN BERDIRI</span>
                      <span className={styles.detailValue}>{profile.companyYear}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            {/* Kontak */}
            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Kontak & Link</h3>
              <div className={styles.contactList}>
                {profile?.companyWebsite && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div className={styles.contactMeta}>
                      <span className={styles.contactLabel}>Website</span>
                      <span className={styles.contactValue}>{profile.companyWebsite}</span>
                    </div>
                  </div>
                )}
                {profile?.companyLinkedin && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    </div>
                    <div className={styles.contactMeta}>
                      <span className={styles.contactLabel}>LinkedIn</span>
                      <span className={styles.contactValue}>{profile.companyLinkedin}</span>
                    </div>
                  </div>
                )}
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div className={styles.contactMeta}>
                    <span className={styles.contactLabel}>Email</span>
                    <span className={styles.contactValue}>{profile?.email}</span>
                  </div>
                </div>
                {profile?.phone && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                    </div>
                    <div className={styles.contactMeta}>
                      <span className={styles.contactLabel}>Telepon</span>
                      <span className={styles.contactValue}>{profile.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
