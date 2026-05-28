import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillService } from '../services/skill.service';
import { aiService } from '../services/ai.service';
import type { Skill } from '../types';
import styles from './SelfDeclareSkillPage.module.css';

const categories = ['All', 'Frontend', 'Backend', 'Data Science', 'DevOps', 'AI', 'Design', 'Other'];

export function SelfDeclareSkillPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await skillService.getAll();
        if (response.data && response.data.length > 0) {
          setSkills(response.data);
        } else {
          setFetchError('Daftar skill kosong. Hubungi admin.');
        }
      } catch {
        setFetchError('Gagal memuat daftar skill. Periksa koneksi internet.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const toggleSkill = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || 
      (s.category && s.category.toLowerCase() === activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const selectedSkillNames = skills
    .filter((s) => selectedIds.includes(s.id))
    .map((s) => s.name);

  const handleSubmit = async () => {
    if (selectedIds.length < 3) return;
    setIsSaving(true);
    try {
      // 1. Sync skill IDs ke backend
      await skillService.sync(selectedIds);
      
      // 2. Normalize skill names via AI sebelum matching
      let normalizedNames = selectedSkillNames;
      try {
        const normalizeRes = await aiService.normalizeSkills(selectedSkillNames);
        if (normalizeRes.data.normalized && normalizeRes.data.normalized.length > 0) {
          normalizedNames = normalizeRes.data.normalized.map(n => n.normalized || n.original);
        }
      } catch {
        // Jika normalize gagal, pakai nama asli
      }
      
      // 3. Simpan ke session untuk matching
      sessionStorage.setItem('user_skills_for_match', JSON.stringify(normalizedNames));
      navigate('/dashboard/rekomendasi');
    } catch {
      alert('Gagal menyimpan skill. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Progress: 50% karena step 1 of 2
  const progress = Math.min(50 + (selectedIds.length / 3) * 50, 100);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.step}>Step 1 of 2: Input Skill</p>
          <h1 className={styles.title}>Pilih Skill Kamu</h1>
          <p className={styles.subtitle}>
            Centang skill yang kamu kuasai. Minimal pilih 3 skill untuk hasil matching yang akurat.
          </p>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Cari skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Category tabs */}
        <div className={styles.categories}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? styles.catBtnActive : styles.catBtn}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Populer</span>
          <span className={styles.count}>{selectedIds.length} skill dipilih</span>
        </div>

        {/* Skill Grid */}
        {isLoading ? (
          <div className={styles.loading}>Memuat daftar skill...</div>
        ) : fetchError ? (
          <div className={styles.loading} style={{ color: '#ef4444' }}>{fetchError}</div>
        ) : (
          <div className={styles.grid}>
            {filteredSkills.map((skill) => (
              <label
                key={skill.id}
                className={`${styles.skillItem} ${selectedIds.includes(skill.id) ? styles.skillItemSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                  className={styles.checkbox}
                />
                <span>{skill.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {selectedSkillNames.length > 0 && (
            <div className={styles.selectedChips}>
              {selectedSkillNames.map((name) => (
                <span key={name} className={styles.chip}>
                  {name}
                  <button
                    className={styles.chipX}
                    onClick={() => {
                      const skill = skills.find((s) => s.name === name);
                      if (skill) toggleSkill(skill.id);
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.footerRight}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Kembali
          </button>
          <button
            className={styles.nextBtn}
            disabled={selectedIds.length < 3 || isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? 'Menyimpan...' : 'Lanjut ke Matching'}
          </button>
        </div>
      </div>
    </div>
  );
}
