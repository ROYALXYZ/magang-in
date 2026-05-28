import styles from './Footer.module.css';

const footerLinks = {
  Platform: ['Hero', 'Main', 'Get Started'],
  Company: ['About Us', 'Careers', 'Contact Sales', 'Success Stories', 'Partnerships'],
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Magang</span>
              <span className={styles.logoAccent}>-in</span>
            </div>
            <p className={styles.brandDesc}>
              Jembatan bertenaga AI antara mahasiswa teknologi yang ambisius
              dan magang impian mereka. Kami fokus pada potensi Anda, bukan
              hanya CV Anda.
            </p>
            <div className={styles.socials}>
              {/* LinkedIn */}
              <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className={styles.socialIcon} aria-label="Twitter">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>{section}</h4>
              <ul className={styles.linkList}>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className={styles.link}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 Magang-in Platform. All rights reserved.
          </p>
          <div className={styles.bottomRight}>
            <span className={styles.lang}>🌐 Indonesia (ID)</span>
            <span className={styles.lang}>⚡ Support Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
