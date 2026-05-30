import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { internshipService } from '../services/internship.service';
import type { Internship } from '../types';
import styles from './PerusahaanPage.module.css';
import heroBg from '../assets/bg-serch-company.png';

const avatarColors = ['#4f46e5', '#f97316', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6', '#f43f5e'];

interface CompanyData {
  name: string;
  location: string;
  jobCount: number;
  color: string;
}

export function PerusahaanPage() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await internshipService.getAll();
        // Group by company
        const companyMap = new Map<string, { locations: Set<string>; count: number }>();
        res.data.forEach((job: Internship) => {
          const existing = companyMap.get(job.company);
          if (existing) {
            existing.count++;
            existing.locations.add(job.location);
          } else {
            companyMap.set(job.company, { locations: new Set([job.location]), count: 1 });
          }
        });

        const companyList: CompanyData[] = Array.from(companyMap.entries())
          .map(([name, data], i) => ({
            name,
            location: Array.from(data.locations).slice(0, 2).join(', '),
            jobCount: data.count,
            color: avatarColors[i % avatarColors.length],
          }))
          .sort((a, b) => b.jobCount - a.jobCount);

        setCompanies(companyList);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const filtered = companies.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.heroBanner} style={{ backgroundImage: `linear-gradient(135deg, rgba(79, 70, 229, 0.85) 0%, rgba(99, 102, 241, 0.7) 100%), url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 className={styles.heroTitle}>Discover Your Future Workspace</h1>
        <p className={styles.heroSubtitle}>
          {companies.length} perusahaan mitra yang membuka lowongan magang di platform Magang-in.
        </p>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama perusahaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles.searchBtn}>Search</button>
        </div>
      </div>

      {/* Company Grid */}
      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Memuat data perusahaan...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Tidak ada perusahaan ditemukan.</div>
      ) : (
        <>
          <div className={styles.grid}>
            {paginated.map((c) => (
              <div key={c.name} className={styles.companyCard}>
                <div className={styles.companyIcon} style={{ background: `${c.color}20` }}>
                  <span style={{ color: c.color, fontWeight: 700, fontSize: 18 }}>{c.name.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className={styles.companyName}>{c.name}</h3>
                <p className={styles.companyLocation}>
                  <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {c.location}
                </p>
                <div className={styles.companyFooter}>
                  <span className={styles.jobCount}>{c.jobCount} Lowongan</span>
                  <Link to={`/lowongan?search=${encodeURIComponent(c.name)}`} className={styles.arrow}>→</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
