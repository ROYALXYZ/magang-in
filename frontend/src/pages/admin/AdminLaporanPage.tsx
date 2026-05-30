import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import styles from './AdminLaporanPage.module.css';

interface MonthlyGrowth {
  month: string;
  newUsers: number;
  newInternships: number;
}

interface Industry {
  name: string;
  count: number;
  percentage: number;
}

interface AppInsights {
  newApplicants: number;
  totalMatches: number;
  matchRate: number;
  totalApplications: number;
}

export function AdminLaporanPage() {
  const [growth, setGrowth] = useState<MonthlyGrowth[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [insights, setInsights] = useState<AppInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [growthRes, industryRes, insightsRes] = await Promise.allSettled([
          adminService.getMonthlyGrowth(),
          adminService.getTopIndustries(),
          adminService.getApplicationInsights(),
        ]);
        if (growthRes.status === 'fulfilled') setGrowth(growthRes.value.data);
        if (industryRes.status === 'fulfilled') setIndustries(industryRes.value.data);
        if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    let csv = 'Bulan,User Baru,Lowongan Baru\n';
    growth.forEach(g => { csv += `${g.month},${g.newUsers},${g.newInternships}\n`; });
    csv += '\nTop Industri\nNama,Jumlah,Persentase\n';
    industries.forEach(i => { csv += `${i.name},${i.count},${i.percentage}%\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-magangin-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxGrowth = Math.max(
    ...growth.flatMap(g => [g.newUsers, g.newInternships]),
    1
  );

  // Find latest month with growth (for highlighting)
  const latestIdx = growth.length - 1;

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Laporan & Data Analitik</h1>
          <p className={styles.desc}>Pantau performa platform dan pertumbuhan pengguna secara real-time.</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleExportCSV}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-dark)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text)' }}>Memuat data laporan...</div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className={styles.chartsGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                Pertumbuhan 6 Bulan Terakhir
                <div className={styles.legend}>
                  <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#cbd5e1' }}></div> User Baru</div>
                  <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#3730a3' }}></div> Lowongan Baru</div>
                </div>
              </div>
              {growth.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>Belum ada data.</div>
              ) : (
                <div className={styles.barChartContainer}>
                  {growth.map((d, i) => (
                    <div key={d.month + i} className={styles.barGroup}>
                      <div
                        className={`${styles.bar} ${styles.barSiswa}`}
                        style={{ height: `${(d.newUsers / maxGrowth) * 90}%` }}
                        title={`${d.newUsers} user baru`}
                      ></div>
                      <div
                        className={`${styles.bar} ${styles.barLowongan} ${i === latestIdx ? styles.barActive : ''}`}
                        style={{ height: `${(d.newInternships / maxGrowth) * 90}%` }}
                        title={`${d.newInternships} lowongan baru`}
                      ></div>
                      <span className={styles.monthLabel}>{d.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${styles.card} ${styles.successCard}`}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 24px' }}>Success Match Rate</h3>
              <span style={{ fontSize: '12px', opacity: 0.8, marginBottom: '20px' }}>Persentase Lamaran Diterima</span>

              <div className={styles.radialBox}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <circle
                    cx="90" cy="90" r="80"
                    fill="none" stroke="white" strokeWidth="12"
                    strokeDasharray="502.4"
                    strokeDashoffset={502.4 - (502.4 * (insights?.matchRate || 0)) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 90 90)"
                  />
                </svg>
                <div className={styles.radialText}>
                  <span className={styles.percentText}>{insights?.matchRate || 0}%</span>
                  <span className={styles.percentSub}>
                    {(insights?.matchRate || 0) >= 70 ? 'Sangat Akurat' : (insights?.matchRate || 0) >= 40 ? 'Cukup Baik' : 'Perlu Ditingkatkan'}
                  </span>
                </div>
              </div>

              <div className={styles.matchInfo}>
                <span>Total Match</span>
                <span>{insights?.totalMatches || 0}</span>
              </div>
            </div>
          </div>

          {/* Industries & Insights */}
          <div className={styles.bottomGrid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Top Industri / Jurusan</h3>
              {industries.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text)' }}>Belum ada data lowongan.</div>
              ) : (
                industries.map(ind => (
                  <div key={ind.name} className={styles.industryItem}>
                    <div className={styles.industryHeader}>
                      <span>{ind.name}</span>
                      <span>{ind.percentage}% ({ind.count})</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${ind.percentage}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Recent Data Insights</h3>
              <div className={styles.insightStats}>
                <div className={styles.miniStat}>
                  <div className={styles.statIcon}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                  <div>
                    <span className={styles.miniLabel}>PELAMAR BARU (7 HARI)</span>
                    <span className={styles.miniVal}>{insights?.newApplicants || 0}</span>
                  </div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.statIcon}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
                  </div>
                  <div>
                    <span className={styles.miniLabel}>TOTAL LAMARAN</span>
                    <span className={styles.miniVal}>{insights?.totalApplications || 0}</span>
                  </div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.statIcon}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <span className={styles.miniLabel}>DITERIMA</span>
                    <span className={styles.miniVal}>{insights?.totalMatches || 0}</span>
                  </div>
                </div>
              </div>

              {industries.length > 0 && (
                <div className={styles.infoBox}>
                  <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <p className={styles.infoText}>
                    <b>Insight:</b> Industri <b>{industries[0].name}</b> mendominasi dengan {industries[0].percentage}% dari total lowongan ({industries[0].count} posisi).
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: 'var(--text-light)' }}>
        © 2026 Magang-in Platform. All rights reserved.
      </div>
    </div>
  );
}
