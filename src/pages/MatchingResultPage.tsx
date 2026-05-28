import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { aiService } from '../services/ai.service';
import { skillService } from '../services/skill.service';
import type { MatchResult } from '../types';
import styles from './MatchingResultPage.module.css';

function getMatchLevel(match: MatchResult) {
  if (match.match_category === 'Strong Match') return { label: 'STRONG', color: '#22c55e', bg: '#ecfdf5' };
  if (match.match_category === 'Partial Match') return { label: 'PARTIAL', color: '#f59e0b', bg: '#fffbeb' };
  if (match.match_category === 'Low Match') return { label: 'LOW', color: '#ef4444', bg: '#fef2f2' };
  
  const score = match.matchScore;
  if (score >= 70) return { label: 'STRONG', color: '#22c55e', bg: '#ecfdf5' };
  if (score >= 40) return { label: 'PARTIAL', color: '#f59e0b', bg: '#fffbeb' };
  return { label: 'LOW', color: '#ef4444', bg: '#fef2f2' };
}

export function MatchingResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Detect if we're in onboarding flow or dashboard
  const isOnboarding = location.pathname.includes('/onboarding');

  useEffect(() => {
    const doMatch = async () => {
      setIsLoading(true);
      setError('');

      try {
        // 1. Ambil skill user dari DB
        let skills: string[] = [];
        try {
          const skillRes = await skillService.getMySkills();
          skills = skillRes.data.map(us => us.skill.name);
        } catch {
          // Fallback ke session jika DB gagal
          const stored = sessionStorage.getItem('user_skills_for_match');
          if (stored) skills = JSON.parse(stored);
        }

        // Override dengan session jika ada (lebih fresh, misal dari CV scan)
        const stored = sessionStorage.getItem('user_skills_for_match');
        if (stored) {
          const sessionSkills: string[] = JSON.parse(stored);
          if (sessionSkills.length > 0) {
            skills = sessionSkills;
            // Clear session setelah dipakai
            sessionStorage.removeItem('user_skills_for_match');
          }
        }

        setUserSkills(skills);

        if (skills.length === 0) {
          setError('Kamu belum memiliki skill. Silakan lengkapi skill terlebih dahulu.');
          setIsLoading(false);
          return;
        }

        // 2. Call AI matching
        const response = await aiService.matchInternship(skills);
        const sorted = (response.data.matches || []).sort((a, b) => b.matchScore - a.matchScore);
        setMatches(sorted);
      } catch {
        setError('Gagal mendapatkan rekomendasi. Coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };

    doMatch();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {isOnboarding && <p className={styles.step}>Step 2 of 2: Hasil Matching</p>}
          <h1 className={styles.title}>Hasil Rekomendasi AI</h1>
          <p className={styles.subtitle}>
            {userSkills.length > 0
              ? `Lowongan yang paling cocok berdasarkan ${userSkills.length} skill kamu`
              : 'Lengkapi skill untuk mendapatkan rekomendasi'}
          </p>
          {userSkills.length > 0 && (
            <div className={styles.userSkills}>
              {userSkills.slice(0, 8).map((s) => (
                <span key={s} className={styles.userSkillChip}>{s}</span>
              ))}
              {userSkills.length > 8 && (
                <span className={styles.userSkillChip} style={{ background: '#f1f5f9', color: '#64748b' }}>
                  +{userSkills.length - 8} lainnya
                </span>
              )}
            </div>
          )}

          {/* Action buttons: update skill */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/onboarding/self-declare')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
            >
              <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Update Skill
            </button>
            <button
              onClick={() => navigate('/onboarding/upload-cv')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#6366f1', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Scan CV Baru
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>AI sedang mencocokkan skill kamu dengan lowongan...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className={styles.errorBox}>
            <p>{error}</p>
            {error.includes('belum memiliki skill') ? (
              <button onClick={() => navigate('/onboarding')} className={styles.retryBtn}>Lengkapi Skill</button>
            ) : (
              <button onClick={() => window.location.reload()} className={styles.retryBtn}>Coba Lagi</button>
            )}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && matches.length === 0 && (
          <div className={styles.empty}>
            <p>Tidak ada lowongan yang cocok saat ini.</p>
            <p className={styles.emptySub}>Coba tambah lebih banyak skill untuk hasil yang lebih baik.</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && matches.length > 0 && (
          <div className={styles.results}>
            {matches.map((match, i) => {
              const level = getMatchLevel(match);
              return (
                <div key={`${match.internshipId || match.title}-${i}`} className={styles.card} style={{ borderLeftColor: level.color }}>
                  <div className={styles.cardLeft}>
                    <span className={styles.rank}>#{i + 1}</span>
                    <span className={styles.badge} style={{ background: level.bg, color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{match.title}</h3>
                    <p className={styles.cardCompany}>{match.company}</p>
                    {(match.matched_skills && match.matched_skills.length > 0) && (
                      <div className={styles.matchedSkills}>
                        <span className={styles.matchedLabel}>Matched:</span>
                        {match.matched_skills.map((s) => (
                          <span key={s} className={styles.matchedChip}>{s}</span>
                        ))}
                      </div>
                    )}
                    {(match.missingSkills && match.missingSkills.length > 0) && (
                      <div className={styles.missingSkills}>
                        <span className={styles.missingLabel}>Missing:</span>
                        {match.missingSkills.slice(0, 8).map((s) => (
                          <span key={s} className={styles.missingChip}>{s}</span>
                        ))}
                        {match.missingSkills.length > 8 && (
                          <span className={styles.missingChip}>+{match.missingSkills.length - 8}</span>
                        )}
                      </div>
                    )}
                    {match.roadmap_url && (
                      <a href={match.roadmap_url} target="_blank" rel="noopener noreferrer" className={styles.roadmapLink}>
                        📚 Lihat Roadmap Belajar →
                      </a>
                    )}
                  </div>
                  <div className={styles.cardRight}>
                    <span className={styles.score}>{Math.round(match.matchScore)}%</span>
                    {match.internshipId && (
                      <Link to={`/dashboard/lowongan/${match.internshipId}`} className={styles.detailBtn}>
                        Detail
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        {!isLoading && !error && (
          <div className={styles.footerActions}>
            <Link to="/dashboard/lowongan" className={styles.browseBtn}>Lihat Semua Lowongan</Link>
            {isOnboarding && (
              <Link to="/dashboard" className={styles.dashboardBtn}>Ke Dashboard</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
