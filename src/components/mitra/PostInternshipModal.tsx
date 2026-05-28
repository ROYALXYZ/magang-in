import { useState, useEffect, useRef } from 'react';
import { internshipService } from '../../services/internship.service';
import { skillService } from '../../services/skill.service';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import styles from './PostInternshipModal.module.css';

// Searchable dropdown component
function SearchableSelect({ label, options, value, onChange, placeholder, required }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.formGroup} ref={ref} style={{ position: 'relative' }}>
      <label className={styles.label}>{label}</label>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        required={required}
        value={isOpen ? search : value}
        onFocus={() => { setIsOpen(true); setSearch(value); }}
        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
      />
      {isOpen && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {filtered.slice(0, 20).map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setSearch(opt); setIsOpen(false); }}
              style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-dark)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-select searchable for skills
function MultiSkillSelect({ label, options, selected, onChange, placeholder }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o));

  const removeSkill = (skill: string) => onChange(selected.filter(s => s !== skill));
  const addSkill = (skill: string) => { onChange([...selected, skill]); setSearch(''); };

  return (
    <div className={styles.formGroup} ref={ref} style={{ position: 'relative' }}>
      <label className={styles.label}>{label}</label>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {selected.map(s => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', background: '#eef2ff', color: '#6366f1', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
              {s}
              <span onClick={() => removeSkill(s)} style={{ cursor: 'pointer', fontWeight: 800 }}>×</span>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={search}
        onFocus={() => setIsOpen(true)}
        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
      />
      {isOpen && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {filtered.slice(0, 20).map(opt => (
            <div
              key={opt}
              onClick={() => addSkill(opt)}
              style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-dark)', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PostInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PostInternshipModal({ isOpen, onClose, onSuccess }: PostInternshipModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'On-site',
    duration: '3-6 Bulan',
    level: 'Internship',
    major: 'Teknik Informatika',
    requirements: '',
    skillsRequired: '',
    benefits: 'Sertifikat, Uang saku, Mentoring, Networking, Portfolio project',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Fetch master data
  useEffect(() => {
    if (isOpen) {
      internshipService.getLocations().then(res => setLocations(res.data.map(l => l.name))).catch(() => {});
      internshipService.getMajors().then(res => setMajors(res.data.map(m => m.name))).catch(() => {});
      skillService.getAll().then(res => setAllSkills(res.data.map((s: any) => s.name))).catch(() => {});
    }
  }, [isOpen]);

  // Auto-fill company name from profile
  useEffect(() => {
    if (isOpen) {
      authService.getProfile().then(res => {
        const profile = res.data as any;
        const companyName = profile.companyName || profile.name || '';
        setFormData(prev => ({ ...prev, company: companyName }));
      }).catch(() => {
        // Fallback to user name
        if (user?.name) setFormData(prev => ({ ...prev, company: user.name || '' }));
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.company || !formData.description || !formData.location) {
      setError('Judul, perusahaan, deskripsi, dan lokasi wajib diisi.');
      setLoading(false);
      return;
    }

    try {
      await internshipService.create({
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        duration: formData.duration,
        level: formData.level,
        major: formData.major,
        requirements: formData.requirements,
        skillsRequired: selectedSkills.join(', '),
        benefits: formData.benefits,
      } as any);
      onSuccess?.();
      onClose();
      // Reset form
      setSelectedSkills([]);
      setFormData({
        title: '', company: '', description: '', location: '',
        type: 'On-site', duration: '3-6 Bulan', level: 'Internship',
        major: 'Teknik Informatika', requirements: '', skillsRequired: '',
        benefits: 'Sertifikat, Uang saku, Mentoring, Networking, Portfolio project',
      });
    } catch {
      setError('Gagal memasang lowongan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>Pasang Lowongan Baru</h2>
            <p className={styles.subtitle}>Isi detail informasi magang untuk menarik talenta terbaik.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Row 1: Title & Company */}
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Judul Lowongan *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Frontend Developer Intern"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Perusahaan *</label>
                <input
                  type="text"
                  className={styles.input}
                  required
                  value={formData.company}
                  readOnly
                  style={{ background: 'var(--bg-light)', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Row 2: Location & Type */}
            <div className={styles.row}>
              <SearchableSelect
                label="Lokasi *"
                options={locations}
                value={formData.location}
                onChange={v => setFormData({ ...formData, location: v })}
                placeholder="Cari lokasi..."
                required
              />
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipe</label>
                <select
                  className={styles.select}
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Row 3: Duration & Level & Major */}
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Durasi</label>
                <select
                  className={styles.select}
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="1-3 Bulan">1-3 Bulan</option>
                  <option value="3-6 Bulan">3-6 Bulan</option>
                  <option value="6 Bulan">6 Bulan</option>
                  <option value="6-12 Bulan">6-12 Bulan</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Level</label>
                <select
                  className={styles.select}
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="Internship">Internship</option>
                  <option value="Junior">Junior</option>
                  <option value="Entry Level">Entry Level</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Jurusan</label>
                <select
                  className={styles.select}
                  value={formData.major}
                  onChange={e => setFormData({ ...formData, major: e.target.value })}
                >
                  {majors.length > 0 ? majors.map(m => (
                    <option key={m} value={m}>{m}</option>
                  )) : (
                    <>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                      <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                      <option value="Teknik Elektro">Teknik Elektro</option>
                      <option value="Umum">Umum (Semua Jurusan)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Deskripsi Pekerjaan *</label>
              <textarea
                className={styles.textarea}
                placeholder="Jelaskan peran dan tanggung jawab magang ini..."
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Skills Required */}
            <MultiSkillSelect
              label="Skills Required"
              options={allSkills}
              selected={selectedSkills}
              onChange={setSelectedSkills}
              placeholder="Cari skill..."
            />

            {/* Requirements */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Persyaratan (pisahkan dengan baris baru)</label>
              <textarea
                className={styles.textarea}
                placeholder={"Mahasiswa aktif semester 5-8\nMemiliki keahlian React\nBersedia magang minimal 3 bulan\nMemiliki motivasi belajar yang tinggi"}
                value={formData.requirements}
                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
              />
            </div>

            {/* Benefits */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Benefits (pisahkan dengan koma)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Sertifikat, Uang saku, Mentoring, Networking"
                value={formData.benefits}
                onChange={e => setFormData({ ...formData, benefits: e.target.value })}
              />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0' }}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Batal</button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Memproses...' : 'Pasang Lowongan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
