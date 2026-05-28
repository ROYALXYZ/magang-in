import { useNavigate } from 'react-router-dom';
import styles from './OnboardingPage.module.css';

export function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Brand */}
        <p className={styles.brand}>Magang-in</p>

        {/* Header */}
        <h1 className={styles.title}>Bagaimana kamu ingin memasukkan skill?</h1>
        <p className={styles.subtitle}>
          Pilih cara yang paling nyaman untuk kamu. Skill kamu akan digunakan
          untuk mencocokkan dengan lowongan magang.
        </p>

        {/* Option Cards */}
        <div className={styles.cards}>
          {/* Self-Declaration */}
          <div className={styles.card} onClick={() => navigate('/onboarding/self-declare')}>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Self-Declaration</h3>
            <p className={styles.cardDesc}>
              Pilih skill secara manual dari daftar 80+ teknologi dan keahlian
            </p>
            <button className={styles.cardBtnOutline} onClick={(e) => { e.stopPropagation(); navigate('/onboarding/self-declare'); }}>
              Pilih Manual
            </button>
          </div>

          {/* Upload CV */}
          <div className={styles.card} onClick={() => navigate('/onboarding/upload-cv')}>
            <span className={styles.aiBadge}>AI-Powered</span>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Upload CV</h3>
            <p className={styles.cardDesc}>
              Upload file PDF CV kamu dan biarkan AI mengidentifikasi skill secara otomatis
            </p>
            <button className={styles.cardBtnPrimary} onClick={(e) => { e.stopPropagation(); navigate('/onboarding/upload-cv'); }}>
              Upload CV
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className={styles.note}>Kamu bisa mengubah skill kapan saja di halaman profil</p>
      </div>
    </div>
  );
}
