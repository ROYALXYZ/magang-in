import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../types';
import styles from './EditProfilModal.module.css';

interface EditProfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: User | null;
  onSuccess: (updatedUser: User) => void;
}

export function EditProfilModal({ isOpen, onClose, userProfile, onSuccess }: EditProfilModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    education: '',
    institution: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form data when modal opens
  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        education: userProfile.education || '',
        institution: userProfile.institution || ''
      });
      setError('');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authService.updateProfile(formData);
      onSuccess(res.data.user);
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Gagal menyimpan profil. Coba lagi.');
      } else {
        setError('Terjadi kesalahan yang tidak terduga.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Edit Profil</h2>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Tutup">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Informasi Dasar</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Masukkan nama lengkap kamu"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phone">Nomor Telepon</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="address">Alamat Domisili</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Masukkan alamat domisili kamu saat ini"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Latar Belakang Pendidikan</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="education">Tingkat Pendidikan</label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">Pilih Tingkat Pendidikan</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">Diploma 3 (D3)</option>
                  <option value="D4">Diploma 4 (D4)</option>
                  <option value="S1">Sarjana (S1)</option>
                  <option value="S2">Magister (S2)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="institution">Nama Institusi / Kampus</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Contoh: Universitas Indonesia"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
              Batal
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
