import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Deklarasi Skill',
    description:
      'Tampilkan kemampuan terbaik Anda dalam satu tempat. Sistem kami akan menganalisis proyek, pengalaman, dan portofolio Anda untuk memetakan skill secara akurat dan relevan dengan kebutuhan industri.',
    highlight: false,
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: 'Roadmaps Untuk Mengatasi Kelemahan Anda',
    description:
      'Temukan jalan terbaik untuk berkembang. Kami menyusun roadmap personal berbasis AI untuk membantu Anda memperbaiki kekurangan, meningkatkan skill, dan mencapai posisi karier yang Anda inginkan.',
    highlight: true,
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'AI Match Engine',
    description:
      'Lewati kelelahan "Lamar ke Semua". Kami hanya menampilkan magang yang 80% atau lebih sesuai dengan profil dan tujuan karir Anda.',
    highlight: false,
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Direct Connect',
    description:
      'Kirim pesan langsung ke perekrut melalui platform kami. Tidak ada lagi "lubang hitam"; dapatkan umpan balik nyata dan lacak status lamaran Anda secara real-time.',
    highlight: false,
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Auto Portofolio',
    description:
      'Kami secara otomatis membuat halaman portofolio yang rapi dan siap digunakan oleh perekrut. Berdasarkan aktivitas Anda, skor kecocokan, dan peta jalan yang telah diselesaikan.',
    highlight: false,
  },
];

export function FeaturesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Website Cerdas untuk Perjalanan Anda</h2>
          <p className={styles.subtitle}>
            Kami tidak hanya mencantumkan lowongan pekerjaan kami merancang jalur karier. Manfaatkan AI kami untuk memahami posisi Anda saat ini dan bagaimana mencapai tujuan Anda.
          </p>
        </div>

        {/* Top row: Deklarasi Skill + Roadmaps */}
        <div className={styles.topRow}>
          <div className={styles.skillCard}>
            <div className={styles.cardIcon}>{features[0].icon}</div>
            <h3 className={styles.cardTitle}>{features[0].title}</h3>
            <p className={styles.cardDesc}>{features[0].description}</p>
          </div>

          <div className={styles.roadmapCard}>
            <div className={styles.roadmapIcon}>{features[1].icon}</div>
            <h3 className={styles.roadmapTitle}>{features[1].title}</h3>
            <p className={styles.roadmapDesc}>{features[1].description}</p>
          </div>
        </div>

        {/* Bottom row: 3 cards */}
        <div className={styles.bottomRow}>
          {features.slice(2).map((f) => (
            <div key={f.title} className={styles.card}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
