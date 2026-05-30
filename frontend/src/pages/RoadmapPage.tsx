import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillService } from '../services/skill.service';
import { aiService } from '../services/ai.service';
import type { UserSkill, MatchResult } from '../types';
import styles from './RoadmapPage.module.css';

// Mapping role ke roadmap info
const roadmapDatabase = [
  { role: 'frontend', title: 'Frontend Developer', logo: 'FE', logoClass: 'fe', url: 'https://roadmap.sh/frontend', description: 'Kuasai pembuatan antarmuka web modern dengan fokus pada React, Vue, Angular, dan optimasi performa client-side.', relatedSkills: ['javascript', 'typescript', 'react', 'vue', 'angular', 'css', 'html', 'tailwind', 'nextjs', 'flutter'] },
  { role: 'backend', title: 'Backend Developer', logo: 'BE', logoClass: 'be', url: 'https://roadmap.sh/backend', description: 'Bangun sistem yang kuat dan skalabel. Fokus pada Node.js, Python, Go, database, dan arsitektur microservices.', relatedSkills: ['node', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'go', 'php', 'laravel', 'sql', 'postgresql', 'mongodb', 'api', 'graphql'] },
  { role: 'fullstack', title: 'Full Stack Developer', logo: 'FS', logoClass: 'be', url: 'https://roadmap.sh/full-stack', description: 'Gabungkan keahlian frontend dan backend. Bangun aplikasi end-to-end dari UI hingga database.', relatedSkills: ['javascript', 'react', 'node', 'sql', 'python', 'nextjs', 'typescript'] },
  { role: 'data', title: 'Data Analyst', logo: 'DA', logoClass: 'da', url: 'https://roadmap.sh/data-analyst', description: 'Ubah data menjadi insight bisnis. Pelajari visualisasi data, statistik terapan, dan pemrosesan data skala besar.', relatedSkills: ['python', 'sql', 'pandas', 'powerbi', 'tableau', 'r', 'numpy'] },
  { role: 'ai/ml', title: 'AI & Data Science', logo: 'AI', logoClass: 'da', url: 'https://roadmap.sh/ai-data-scientist', description: 'Pelajari machine learning, deep learning, dan AI. Bangun model prediktif dengan TensorFlow dan PyTorch.', relatedSkills: ['python', 'tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'docker'] },
  { role: 'devops', title: 'DevOps Engineer', logo: 'DO', logoClass: 'be', url: 'https://roadmap.sh/devops', description: 'Otomasi deployment dan infrastruktur. Kuasai Docker, Kubernetes, CI/CD, dan cloud platforms.', relatedSkills: ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ansible', 'linux', 'cicd', 'bash'] },
  { role: 'mobile', title: 'Mobile Developer', logo: 'MB', logoClass: 'fe', url: 'https://roadmap.sh/android', description: 'Bangun aplikasi mobile native dan cross-platform. Kuasai Flutter, Kotlin, Swift, dan React Native.', relatedSkills: ['flutter', 'kotlin', 'swift', 'react native', 'android', 'ios', 'firebase'] },
  { role: 'qa', title: 'QA Engineer', logo: 'QA', logoClass: 'ux', url: 'https://roadmap.sh/qa', description: 'Jamin kualitas software melalui testing manual dan automation. Pelajari Selenium, Jest, dan CI/CD testing.', relatedSkills: ['testing', 'automation', 'selenium', 'jest', 'appium', 'postman', 'quality assurance', 'agile'] },
  { role: 'ui/ux', title: 'UI/UX Design', logo: 'UX', logoClass: 'ux', url: 'https://roadmap.sh/ux-design', description: 'Ciptakan pengalaman pengguna yang luar biasa. Pelajari user research, prototyping, dan desain visual.', relatedSkills: ['figma', 'adobexd', 'user research', 'design system', 'accessibility'] },
  { role: 'cyber', title: 'Cyber Security', logo: 'CS', logoClass: 'da', url: 'https://roadmap.sh/cyber-security', description: 'Lindungi sistem dan data dari ancaman. Pelajari penetration testing, network security, dan ethical hacking.', relatedSkills: ['security', 'penetration', 'network security', 'networking', 'linux', 'wireshark', 'bash'] },
];

function getRelevanceScore(userSkillNames: string[], roadmapSkills: string[]): number {
  const userLower = userSkillNames.map(s => s.toLowerCase());
  const matched = roadmapSkills.filter(rs => userLower.some(us => us.includes(rs) || rs.includes(us)));
  return roadmapSkills.length > 0 ? matched.length / roadmapSkills.length : 0;
}

function getRelevanceLabel(score: number): { label: string; className: string } {
  if (score >= 0.4) return { label: 'SANGAT RELEVAN', className: 'sangat-relevan' };
  if (score >= 0.2) return { label: 'RELEVAN', className: 'relevan' };
  if (score >= 0.1) return { label: 'KURANG RELEVAN', className: 'kurang-relevan' };
  return { label: 'EKSPLORASI', className: 'eksplorasi' };
}

export function RoadmapPage() {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user skills dari DB
        const skillRes = await skillService.getMySkills();
        setUserSkills(skillRes.data);

        // Coba fetch matching results untuk roadmap URLs
        const skillNames = skillRes.data.map(s => s.skill.name);
        if (skillNames.length > 0) {
          try {
            const matchRes = await aiService.matchInternship(skillNames);
            setMatchResults(matchRes.data.matches || []);
          } catch { /* ignore matching errors */ }
        }
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const userSkillNames = userSkills.map(us => us.skill.name);

  // Calculate relevance for each roadmap and sort
  const sortedRoadmaps = roadmapDatabase
    .map(rm => {
      const score = getRelevanceScore(userSkillNames, rm.relatedSkills);
      const relevance = getRelevanceLabel(score);
      return { ...rm, score, relevance };
    })
    .sort((a, b) => b.score - a.score);

  // Get unique roadmap URLs from match results
  const matchRoadmapUrls = [...new Set(matchResults.map(m => m.roadmap_url).filter(Boolean))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Roadmap Belajar</h1>
          <p className={styles.subtitle}>Pilih roadmap yang sesuai dengan keahlian dan tujuan karier kamu</p>
        </div>
        <button className={styles.filterBtn}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filter
        </button>
      </div>

      {/* AI Skill Box */}
      <div className={styles.aiBox}>
        <div className={styles.aiIconWrapper}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"></path>
          </svg>
        </div>
        <div className={styles.aiContent}>
          <div className={styles.aiTitle}>
            Skill kamu:
            <div className={styles.aiSkillTags}>
              {isLoading ? (
                <span className={styles.aiTag}>Memuat...</span>
              ) : userSkillNames.length > 0 ? (
                userSkillNames.slice(0, 6).map(name => (
                  <span key={name} className={styles.aiTag}>{name}</span>
                ))
              ) : (
                <span className={styles.aiTag} style={{ background: '#fff7ed', color: '#c2410c' }}>Belum ada skill</span>
              )}
              {userSkillNames.length > 6 && (
                <span className={styles.aiTag}>+{userSkillNames.length - 6}</span>
              )}
            </div>
          </div>
          <p className={styles.aiText}>
            {userSkillNames.length > 0
              ? 'Roadmap direkomendasikan secara cerdas oleh AI Magang-in berdasarkan profil skill di atas untuk mempercepat karir magangmu.'
              : 'Lengkapi skill kamu terlebih dahulu untuk mendapatkan rekomendasi roadmap yang personal.'}
          </p>
        </div>
      </div>

      {/* Roadmap Grid */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat roadmap...</div>
      ) : (
        <div className={styles.grid}>
          {sortedRoadmaps.map((item) => (
            <div key={item.role} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.logoCircle} ${styles[item.logoClass]}`}>
                  {item.logo}
                </div>
                <span className={`${styles.badge} ${styles[item.relevance.className]}`}>
                  {item.relevance.label}
                </span>
              </div>
              
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.description}</p>
              
              <div className={styles.cardFooter}>
                <div className={styles.techTags}>
                  {item.relatedSkills.slice(0, 3).map(tech => (
                    <span key={tech} className={styles.techTag}>
                      {tech.substring(0, 3).toUpperCase()}
                    </span>
                  ))}
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <button className={styles.actionBtn}>
                    Mulai Belajar
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <p className={styles.bottomText}>Tidak menemukan yang cocok?</p>
        <Link to="/onboarding/self-declare" className={styles.changeSkillBtn}>
          Coba ubah skill kamu 
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </div>
  );
}
