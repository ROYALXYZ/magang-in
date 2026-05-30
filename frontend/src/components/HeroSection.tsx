import { useNavigate } from 'react-router-dom';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.badge}>
          <span className={styles.badgeDot}></span>
          Next-Gen Internship Matching
        </div>

        <h1 className={styles.heading}>
          Temukan Magang 
          <br />
         Sempurna untuk Anda
Dengan <span className={styles.headingAccent}>AI</span>
        </h1>

        <p className={styles.subheading}>
          Jembatani kesenjangan antara studi Anda dan karier profesional.
          <br />
          AI kami menganalisis keterampilan dan aspirasi Anda untuk mencocokkan Anda dengan peran teknologi tingkat atas.
        </p>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => navigate('/login')}>Get Started</button>
          
        </div>

        <div className={styles.socialProof}>
          <div className={styles.avatarGroup}>
            {['#6366f1', '#8b5cf6', '#a78bfa'].map((color, i) => (
              <div
                key={i}
                className={styles.avatar}
                style={{ background: color }}
              />
            ))}
          </div>
          <p className={styles.socialText}>
            Joined by <strong>2,000+</strong> tech students this week
          </p>
        </div>
      </div>
    </section>
  );
}
