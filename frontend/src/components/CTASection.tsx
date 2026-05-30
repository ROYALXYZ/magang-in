import styles from './CTASection.module.css';

export function CTASection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Siap memulai karier di bidang teknologi?</h2>
          <p className={styles.subtitle}>
            Bergabunglah dengan ribuan mahasiswa yang telah mendapatkan magang impian
            mereka menggunakan mesin pencocokan berbasis keterampilan magang-in.
          </p>
          <button className={styles.btn}>Join magang-in Today</button>
        </div>
      </div>
    </section>
  );
}
