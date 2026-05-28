import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import styles from './AdminVerifikasiPage.module.css';

interface MitraRequest {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companyDesc?: string;
  mitraStatus: string;
  createdAt: string;
}

export function AdminVerifikasiPage() {
  const [requests, setRequests] = useState<MitraRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingMitra();
      setRequests(res.data);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui user ini menjadi Mitra?')) return;
    try {
      await adminService.approveMitra(id);
      fetchRequests();
    } catch {
      alert('Gagal menyetujui mitra.');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tolak request mitra ini?')) return;
    try {
      await adminService.rejectMitra(id);
      fetchRequests();
    } catch {
      alert('Gagal menolak request.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleBox}>
          <h1 className={styles.title}>Verifikasi Mitra</h1>
          <p className={styles.desc}>Review dan setujui request pengguna yang ingin menjadi mitra perusahaan.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabActive}`}>
          Request Pending <span className={styles.countBadge}>{requests.length}</span>
        </div>
      </div>

      {/* Request List */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>Memuat data...</div>
      ) : requests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>
          Tidak ada request mitra yang menunggu verifikasi.
        </div>
      ) : (
        <div className={styles.mitraList}>
          {requests.map((req) => (
            <div key={req.id} className={styles.mitraCard}>
              <div className={styles.companyInfo}>
                <div className={styles.companyLogo} style={{ background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px', fontWeight: 700, color: '#6366f1' }}>
                  {req.companyName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <span className={styles.companyName}>{req.companyName || 'Tanpa Nama Perusahaan'}</span>
                  <span className={styles.companyLoc}>{req.name} • {req.email}</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '0 16px' }}>
                {req.companyDesc && (
                  <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0, maxWidth: '300px' }}>
                    {req.companyDesc.length > 100 ? req.companyDesc.substring(0, 100) + '...' : req.companyDesc}
                  </p>
                )}
              </div>
              <div className={styles.date}>
                {new Date(req.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleApprove(req.id)}
                  style={{ background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Setujui
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
