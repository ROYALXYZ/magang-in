import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { skillService } from '../services/skill.service';
import type { User, UserSkill } from '../types';
import { EditProfilModal } from '../components/EditProfilModal';
import styles from './ProfilPage.module.css';

function MitraRequestCard({ mitraStatus }: { mitraStatus?: string | null }) {
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (mitraStatus === 'pending') {
    return (
      <div className={styles.actionCard}>
        <div className={styles.actionIcon} style={{ background: '#fffbeb', color: '#f59e0b' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3>Request Mitra</h3>
        <p style={{ color: '#f59e0b', fontWeight: 600 }}>Menunggu persetujuan admin...</p>
      </div>
    );
  }

  if (mitraStatus === 'rejected') {
    return (
      <div className={styles.actionCard}>
        <div className={styles.actionIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <h3>Request Mitra Ditolak</h3>
        <p>Request sebelumnya ditolak. Hubungi admin untuk info lebih lanjut.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setMessage('Nama perusahaan wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await authService.requestMitra(companyName, companyDesc);
      setMessage(res.data.message);
      setCompanyName('');
      setCompanyDesc('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Gagal mengirim request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.actionCard}>
      <div className={styles.actionIcon} style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
      </div>
      <h3>Daftar Mitra</h3>
      <p>Daftarkan perusahaan kamu untuk bisa posting lowongan magang.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <input
          type="text"
          placeholder="Nama Perusahaan"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-dark)' }}
        />
        <textarea
          placeholder="Deskripsi singkat perusahaan (opsional)"
          value={companyDesc}
          onChange={(e) => setCompanyDesc(e.target.value)}
          rows={3}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', resize: 'vertical', background: 'var(--bg-card)', color: 'var(--text-dark)' }}
        />
        <button
          className={styles.primaryBtn}
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Request Mitra'}
        </button>
        {message && <p style={{ fontSize: '12px', color: message.includes('berhasil') ? '#059669' : '#ef4444', margin: 0 }}>{message}</p>}
      </div>
    </div>
  );
}

export function ProfilPage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(authUser);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.allSettled([
          authService.getProfile(),
          skillService.getMySkills(),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
        }
        if (skillsRes.status === 'fulfilled') {
          setSkills(skillsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px' }}>Memuat profil...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profil Saya</h1>
        <p className={styles.subtitle}>Kelola informasi pribadi dan keahlianmu di sini.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <div className={styles.profileTop}>
              <div className={styles.avatar}>
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className={styles.nameInfo}>
                <h2>{profile?.name || 'Pengguna Magang-in'}</h2>
                <p>{profile?.email}</p>
                <span className={styles.roleBadge}>{profile?.role || 'pengguna'}</span>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Informasi Personal
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nomor Telepon</span>
                  <span className={styles.infoValue}>{profile?.phone || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Alamat Domisili</span>
                  <span className={styles.infoValue}>{profile?.address || '-'}</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                Latar Belakang Pendidikan
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tingkat Pendidikan</span>
                  <span className={styles.infoValue}>{profile?.education || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Institusi / Kampus</span>
                  <span className={styles.infoValue}>{profile?.institution || '-'}</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Keahlian (Skills)
              </h3>
              {skills.length > 0 ? (
                <div className={styles.skillsContainer}>
                  {skills.map(s => (
                    <span key={s.id} className={styles.skillChip}>{s.skill.name}</span>
                  ))}
                </div>
              ) : (
                <p className={styles.noSkills}>Belum ada skill yang dideklarasikan.</p>
              )}
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.actionCard}>
            <div className={styles.actionIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <h3>Edit Profil</h3>
            <p>Perbarui informasi data diri, pendidikan, dan kontak kamu kapan saja.</p>
            <button className={styles.primaryBtn} onClick={() => setIsEditModalOpen(true)}>Edit Data Diri</button>
          </div>

          {/* Request Mitra Section */}
          {profile?.role === 'pengguna' && (
            <MitraRequestCard mitraStatus={(profile as any)?.mitraStatus} />
          )}

          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <h3>Keluar Akun</h3>
            <p>Sesi kamu akan diakhiri dengan aman.</p>
            <button className={styles.dangerBtn} onClick={logout}>Keluar (Logout)</button>
          </div>
        </aside>
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
