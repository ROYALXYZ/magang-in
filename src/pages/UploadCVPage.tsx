import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/ai.service';
import { skillService } from '../services/skill.service';
import styles from './UploadCVPage.module.css';

export function UploadCVPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setError('Ukuran file melebihi 5MB');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    try {
      const response = await aiService.scanCV(file);
      setExtractedSkills(response.data.extractedSkills || []);
      setConfidence(response.data.confidence || 0.85);
    } catch {
      setError('Gagal memproses CV. Coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeSkill = (skill: string) => {
    setExtractedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleProceed = async () => {
    if (extractedSkills.length === 0) return;
    setIsSaving(true);
    try {
      // Normalize skill names via AI sebelum matching
      let normalizedNames = extractedSkills;
      try {
        const normalizeRes = await aiService.normalizeSkills(extractedSkills);
        if (normalizeRes.data.normalized && normalizeRes.data.normalized.length > 0) {
          normalizedNames = normalizeRes.data.normalized.map(n => n.normalized || n.original);
        }
      } catch {
        // Jika normalize gagal, pakai nama asli dari CV
      }

      // Sync skill ke DB: cari skill IDs dari master skill yang cocok
      try {
        const allSkillsRes = await skillService.getAll();
        const masterSkills = allSkillsRes.data;
        
        // Match extracted skills dengan master skills (case-insensitive)
        const matchedIds = normalizedNames
          .map(name => {
            const found = masterSkills.find(ms => 
              ms.name.toLowerCase() === name.toLowerCase() ||
              ms.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(ms.name.toLowerCase())
            );
            return found?.id;
          })
          .filter((id): id is string => !!id);

        if (matchedIds.length > 0) {
          await skillService.sync(matchedIds);
        }
      } catch {
        // Jika sync gagal, tetap lanjut ke matching dengan session
      }

      // Simpan ke session sebagai backup
      sessionStorage.setItem('user_skills_for_match', JSON.stringify(normalizedNames));
      navigate('/dashboard/rekomendasi');
    } catch {
      setError('Gagal menyimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Back button top-left */}
      <button className={styles.topBackBtn} onClick={() => navigate(-1)}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Kembali
      </button>

      <div className={styles.container}>
        <p className={styles.step}>Step 1 of 2: Input Skill</p>
        <h1 className={styles.title}>Upload CV Kamu</h1>
        <p className={styles.subtitle}>AI akan menganalisis CV dan mengidentifikasi skill yang kamu miliki</p>

        {/* Upload Zone (before results) */}
        {extractedSkills.length === 0 && !isProcessing && (
          <>
            <div className={styles.uploadZone}>
              <svg width="40" height="40" fill="none" stroke="#6366f1" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <p className={styles.uploadText}>Drag & drop file CV di sini</p>
              <p className={styles.uploadSub}>atau klik untuk pilih file (PDF, max 5MB)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </div>

            {file && (
              <div className={styles.fileInfo}>
                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                <button className={styles.removeFile} onClick={() => setFile(null)}>&times;</button>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.uploadBtn}
              disabled={!file || isProcessing}
              onClick={handleUpload}
            >
              Scan CV dengan AI
            </button>
          </>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className={styles.processing}>
            <div className={styles.spinner} />
            <p>AI sedang menganalisis CV kamu...</p>
          </div>
        )}
        {/* Results */}
        {extractedSkills.length > 0 && !isProcessing && (
          <div className={styles.results}>
            <div className={styles.confidenceBadge}>
              Confidence: {Math.round(confidence * 100)}%
            </div>
            <h3 className={styles.resultsTitle}>Skill terdeteksi dari CV kamu:</h3>
            <div className={styles.skillChips}>
              {extractedSkills.map((skill) => (
                <span key={skill} className={styles.chip}>
                  {skill}
                  <button className={styles.chipX} onClick={() => removeSkill(skill)}>&times;</button>
                </span>
              ))}
            </div>
            <p className={styles.resultCount}>{extractedSkills.length} skill terdeteksi</p>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.footer}>
              <button className={styles.backBtn} onClick={() => { setExtractedSkills([]); setFile(null); }}>
                Upload ulang
              </button>
              <button
                className={styles.nextBtn}
                disabled={isSaving}
                onClick={handleProceed}
              >
                {isSaving ? 'Menyimpan...' : 'Lanjut ke Matching'}
              </button>
            </div>
          </div>
        )}

        {/* Back link sudah di atas */}
      </div>
    </div>
  );
}
