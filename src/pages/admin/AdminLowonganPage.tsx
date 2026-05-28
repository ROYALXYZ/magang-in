import { useState, useEffect } from 'react';
import { adminService, type AdminInternship } from '../../services/admin.service';
import styles from './AdminLowonganPage.module.css';

export function AdminLowonganPage() {
  const [internships, setInternships] = useState<AdminInternship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getAllInternships();
      setInternships(res.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (id: string, currentlyClosed: boolean) => {
    try {
      await adminService.toggleInternshipStatus(id, !currentlyClosed);
      fetchData();
    } catch {
      alert('Gagal mengubah status lowongan.');
    }
  };

  const activeCount = internships.filter(i => !i.isClosed).length;
  const totalApplicants = internships.reduce((sum, i) => sum + (i._count?.applications || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Kelola Lowongan Magang</h1>
          <p className={styles.desc}>Pantau dan kelola semua lowongan yang ada di platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>TOTAL LOWONGAN</span>
          <span className={styles.statValue}>{internships.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>SEDANG AKTIF</span>
          <span className={styles.statValue}>{activeCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>TOTAL PELAMAR</span>
          <span className={styles.statValue}>{totalApplicants}</span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Judul Lowongan</th>
                <th>Perusahaan (Mitra)</th>
                <th>Pelamar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className={styles.jobTitleBox}>
                      <div>
                        <span className={styles.jobMain}>{job.title}</span>
                        <span className={styles.jobTime}>{job.location} • {job.type || 'Internship'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.companyCell}>
                      {job.company}
                      <br />
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{job.mitra?.email}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{job._count?.applications || 0}</td>
                  <td>
                    <span className={`${styles.badge} ${job.isClosed ? styles.badgeDitutup : styles.badgeTerbuka}`}>
                      {job.isClosed ? 'DITUTUP' : 'TERBUKA'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(job.id, job.isClosed)}
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-dark)' }}
                    >
                      {job.isClosed ? 'Buka Kembali' : 'Tutup'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
