import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { internshipService } from '../services/internship.service';
import type { Internship, MasterLocation } from '../types';
import styles from './LowonganPage.module.css';

// Warna avatar berdasarkan huruf pertama
const avatarColors = ['#4f46e5', '#f97316', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899'];
function getColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

// Format tanggal relatif
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `Diupload ${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  return `Diupload ${days} hari yang lalu`;
}

export function LowonganPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [locations, setLocations] = useState<MasterLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Suggestions berdasarkan input
  const locationSuggestions = locations.filter((loc) =>
    !locationFilter || loc.name.toLowerCase().includes(locationFilter.toLowerCase())
  );

  // Fetch data dari API
  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await internshipService.getAll();
      setInternships(response.data);
    } catch {
      setError('Gagal memuat data lowongan. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch master lokasi (dengan cache di sessionStorage)
  const fetchLocations = async () => {
    const cached = sessionStorage.getItem('master_locations');
    if (cached) {
      setLocations(JSON.parse(cached));
      return;
    }
    try {
      const response = await internshipService.getLocations();
      setLocations(response.data);
      sessionStorage.setItem('master_locations', JSON.stringify(response.data));
    } catch {
      // Gagal fetch lokasi — biarkan dropdown kosong
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchLocations();
  }, []);

  // Filter client-side
  const filtered = internships.filter((job) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.skills.some(s => s.skill.name.toLowerCase().includes(query));

    const matchesLocation = !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedJobs = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page saat filter berubah
  useEffect(() => { setCurrentPage(1); }, [searchQuery, locationFilter]);

  return (
    <div className={styles.page}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari Nama Pekerjaan, Skill, dan Perusahaan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.searchInput} style={{ position: 'relative' }}>
            <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              placeholder="Semua Kota/Provinsi"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            />
            {locationFilter && (
              <button
                type="button"
                onClick={() => setLocationFilter('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex' }}
                aria-label="Clear"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '6px',
              }}>
                {locationSuggestions.map((loc) => (
                  <div
                    key={loc.id}
                    onMouseDown={() => { setLocationFilter(loc.name); setShowLocationSuggestions(false); }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#334155',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="14" height="14" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {loc.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className={styles.searchBtn}>CARI</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.main}>

        {/* Job Listings */}
        <section className={styles.listings}>
          <h2 className={styles.listingsTitle}>
            Daftar Lowongan Kerja & Magang <span className={styles.resultCount}>({filtered.length} Hasil)</span>
          </h2>

          {/* Loading State */}
          {isLoading && (
            <div className={styles.jobGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.jobCard} style={{ opacity: 0.5, animation: 'pulse 1.5s infinite' }}>
                  <div style={{ height: 20, background: '#e5e7eb', borderRadius: 4, width: '70%', marginBottom: 12 }} />
                  <div style={{ height: 14, background: '#e5e7eb', borderRadius: 4, width: '50%', marginBottom: 8 }} />
                  <div style={{ height: 14, background: '#e5e7eb', borderRadius: 4, width: '60%', marginBottom: 8 }} />
                  <div style={{ height: 36, background: '#e5e7eb', borderRadius: 8, width: '40%', marginTop: 16 }} />
                </div>
              ))}
              <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`}</style>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
              <button onClick={fetchInternships} className={styles.applyBtn}>Coba Lagi</button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <p>Tidak ada lowongan ditemukan.</p>
              {searchQuery && <p style={{ fontSize: 14 }}>Coba ubah kata kunci pencarian Anda.</p>}
            </div>
          )}

          {/* Job Cards */}
          {!isLoading && !error && filtered.length > 0 && (
            <>
            <div className={styles.jobGrid}>
              {paginatedJobs.map((job) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobAvatar} style={{ background: getColor(job.company) }}>
                      {job.company.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.jobCompany}>{job.company}</p>
                    </div>
                  </div>

                  <div className={styles.jobMeta}>
                    {job.type && <span>{job.type}</span>}
                    {job.duration && <span>{job.duration}</span>}
                  </div>
                  <div className={styles.jobLocation}>{job.location}</div>

                  {job.skills.length > 0 && (
                    <div className={styles.jobTags}>
                      {job.skills.slice(0, 4).map((s) => (
                        <span key={s.skill.id} className={styles.jobTag}>{s.skill.name}</span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className={styles.jobTag}>+{job.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.jobActions}>
                    <Link to={`/lowongan/${job.id}`} className={styles.applyBtn}>Lihat Detail</Link>
                    <button className={styles.bookmarkBtn} aria-label="Bookmark">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>

                  <div className={styles.jobFooter}>
                    <span className={styles.jobPosted}>{timeAgo(job.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', paddingBottom: '16px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
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
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: '8px 14px',
                        border: currentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: currentPage === pageNum ? '#6366f1' : 'white',
                        color: currentPage === pageNum ? 'white' : '#334155',
                        fontWeight: currentPage === pageNum ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  ›
                </button>
              </div>
            )}
            </>
          )}
        </section>
      </div>

      {/* CTA Banner — hanya tampil kalau belum login */}
      {!isAuthenticated && (
      <div className={styles.ctaBanner}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaIcon}>
            <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className={styles.ctaText}>
            <h3>Login untuk lihat lebih banyak loker</h3>
            <p>Dapatkan rekomendasi lowongan yang 90% cocok dengan profil dan keahlianmu.</p>
          </div>
          <div className={styles.ctaBtns}>
            <Link to="/login" className={styles.ctaBtnOutline}>Daftar</Link>
            <Link to="/login" className={styles.ctaBtnPrimary}>Login Sekarang</Link>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
