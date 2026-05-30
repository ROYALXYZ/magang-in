# Dokumen — Magang-In (Data Science)

## 1. Project Brief

### Apa yang kita buat?
Analisis berbasis data untuk memahami kebutuhan skill industri teknologi (khususnya magang di Indonesia/Jawa) dan membandingkannya dengan tren job market tech global.

### Masalah yang diangkat
Mahasiswa sering:
- Tidak tahu skill apa yang benar-benar dibutuhkan industri
- Bingung memilih lowongan magang yang sesuai
- Tidak sadar gap antara skill mereka dan demand market

### Kalimat paling sederhana (untuk dosen):
> *"Kami menganalisis data lowongan magang teknologi di Indonesia dan membandingkannya dengan data job market tech global untuk memahami kebutuhan skill industri dan gap yang ada."*

### Catatan Framing Penting ⚠️
Dataset Indonesia berisi **lowongan magang**, sedangkan dataset global berisi **job posting tech secara umum** (bukan spesifik magang). Ini **bukan kelemahan** — justru menjadi angle insight yang kuat:
> *"Apakah skill yang diminta magang tech di Indonesia sudah selaras dengan demand industri tech global?"*

---

## 2. Arsitektur Data

### Alur Pipeline (Dataset Indonesia)
```
Scraping Playwright (scrapper.py)
  ├── Glints
  ├── Kalibrr
  └── JobStreet
        ↓
  Enrichment (buka halaman detail per job)
        ↓
  Preprocessing otomatis (preprocessing.py)
  ├── Skill extraction  ← SKILLS_DB + roadmap.sh terms
  ├── Role mapping      ← ROADMAP_ROLES
  ├── Location detection (3-layer fallback)
  └── Scoring + filtering
        ↓
  magangin_jobs_YYYYMMDD_HHMM.csv   ← raw output scraper
        ↓
  Local_cleaning.ipynb              ← cleaning pipeline
  ├── Fix company_name
  ├── Drop kolom tidak diperlukan
  ├── Handle missing skills (roadmap mapping + fallback)
  └── Drop baris yang tidak bisa di-handle
        ↓
  magangin_jobs_cleaned.csv         ← dataset siap analisis
```

### Roadmap Skill Enrichment
Skills diekstrak dari dua sumber:
1. **`SKILLS_DB`** di `scrapper/config.py` — keyword-based extraction dari deskripsi lowongan
2. **`skills_per_role.json`** di `scrapper/roadmap/output/` — skill terms dari roadmap.sh (diambil via GitHub API oleh `fetch_roadmap.py`)

Untuk baris dengan `skills` null, pipeline cleaning mengisi skills berdasarkan `role` → roadmap lookup. Role `ai/ml` menggunakan hardcoded fallback karena roadmap.sh `ai-data-scientist` berisi nama paper/course, bukan tech skill terms.

### Dua Dataset yang Digunakan
| Dataset | Sumber | Isi | Jumlah |
|---|---|---|---|
| **Dataset Indo** | Scraping (Glints, Kalibrr, JobStreet) | Lowongan magang tech di Jawa | 189 baris |
| **Dataset Global** | Kaggle — *Job Descriptions 2025: Tech & Non-Tech Roles* | Job posting tech global | ~ribuan baris |

### File Kunci
| File | Deskripsi |
|---|---|
| `data/magangin_jobs_20260510_1527.csv` | Dataset Indo **raw** hasil scraping (189 baris, 17 kolom) |
| `data/magangin_jobs_cleaned.csv` | Dataset Indo **cleaned** siap analisis (189 baris, 10 kolom) |
| `data/global_jobs_cleaned.csv` | Dataset Global setelah cleaning |
| `scrapper/scrapper.py` | Scraper utama (Playwright) |
| `scrapper/preprocessing.py` | Logic skill extraction, role mapping, scoring |
| `scrapper/config.py` | Semua konstanta: SKILLS_DB, ROADMAP_ROLES, lokasi |
| `scrapper/roadmap/fetch_roadmap.py` | Fetch skill terms dari roadmap.sh via GitHub API |
| `local/Local_cleaning.ipynb` | Pipeline cleaning dataset Indo (9 sections) |
| `local/Local_EDA.ipynb` | EDA dataset Indo |

---

## 3. Data Dictionary — Dataset Indo (Cleaned)

**File:** `data/magangin_jobs_cleaned.csv`
**Jumlah baris:** 189 | **Jumlah kolom:** 10

| # | Kolom | Tipe | Contoh Nilai | Deskripsi |
|---|---|---|---|---|
| 1 | `source` | string | `jobstreet`, `glints`, `kalibrr` | Platform asal lowongan |
| 2 | `title` | string | `Data Analyst Intern` | Judul posisi lowongan |
| 3 | `link` | string | `https://id.jobstreet.com/...` | URL halaman detail |
| 4 | `company_name` | string | `Tokopedia` | Nama perusahaan. Null → diisi `"Unknown"` |
| 5 | `skills` | string | `python, sql, pandas, git` | Skill terdeteksi, dipisahkan koma. Null diisi dari roadmap mapping |
| 6 | `skills_count` | integer | `5` | Jumlah skill terdeteksi |
| 7 | `role` | string | `data` | Kategori roadmap IT hasil mapping dari judul |
| 8 | `location_city` | string | `jakarta`, `yogyakarta` | Kota terdeteksi (lowercase) |
| 9 | `region` | string | `Jabodetabek` | Wilayah: `Jabodetabek`, `Yogyakarta`, `Jawa Barat`, `Jawa Tengah`, `Jawa Timur`, `Banten`, `Remote` |
| 10 | `roadmap_url` | string | `https://roadmap.sh/data-analyst` | URL roadmap.sh relevan berdasarkan `role` |

> **Kolom yang di-drop saat cleaning:** `location_raw`, `description_raw`, `jogja_tag`, `jabodetabek_tag`, `is_tech`, `score`

### Nilai `role` yang mungkin
| Role | Contoh Judul |
|---|---|
| `frontend` | Frontend Developer Intern, React Intern |
| `backend` | Backend Developer Intern, Node.js Intern |
| `fullstack` | Full Stack Engineer, Fullstack Intern |
| `data` | Data Analyst Intern, Data Scientist Intern |
| `ai/ml` | AI Engineer Internship, ML Engineer Intern |
| `devops` | DevOps Intern, Cloud Engineer Intern |
| `mobile` | Android Developer Intern, Flutter Intern |
| `qa` | QA Engineer Intern, Software Tester |
| `ui/ux` | UI/UX Designer Intern |
| `cyber` | Cybersecurity Intern |
| `it-general` | Software Engineer Intern, IT Intern, Programmer |

---

## 4. Data Issues — Dataset Indo

### Cleaning yang Sudah Dilakukan (per `Local_cleaning.ipynb`)

| Issue | Status | Penanganan |
|---|---|---|
| `company_name` noise (pola "ulasan" dari JobStreet) | ✅ Fixed | Regex strip + fallback ekstrak dari URL |
| `company_name` null (4 baris) | ✅ Fixed | Ekstrak dari URL Kalibrr/Glints, fallback `"Unknown"` |
| `location_raw` null (42 baris) | ✅ Fixed | Diisi string kosong (sudah ada `location_city`) |
| `skills` null (23 baris) | ✅ Fixed | 20 diisi dari roadmap mapping, 0 di-drop |
| Kolom redundan/raw | ✅ Dropped | 6 kolom dihapus |

### ⚠️ Issue Tersisa: `skills` dari Roadmap Mapping
Skills yang diisi dari roadmap mapping bersifat **representatif role**, bukan dari deskripsi lowongan asli. Tag ini perlu dibedakan saat analisis jika diperlukan akurasi sumber skill.

### ⚠️ Issue: `ai-data-scientist` Roadmap Terms
Roadmap.sh untuk `ai-data-scientist` berisi nama paper, course, dan artikel (bukan tech skill terms). Skills untuk role `ai/ml` menggunakan fallback hardcoded: `python, tensorflow, pytorch, sklearn, pandas, numpy, sql, git`.

---

## 5. Distribusi Dataset Indo (Cleaned)

### Per Source
| Source | Jumlah |
|---|---|
| jobstreet | 147 |
| glints | 41 |
| kalibrr | 1 |

### Per Role
| Role | Jumlah |
|---|---|
| `backend` | 40 |
| `it-general` | 35 |
| `cyber` | 20 |
| `frontend` | 19 |
| `qa` | 19 |
| `data` | 14 |
| `ai/ml` | 13 |
| `ui/ux` | 10 |
| `fullstack` | 9 |
| `devops` | 8 |
| `mobile` | 2 |

### Per Region
| Region | Jumlah |
|---|---|
| Jabodetabek | 129 |
| Jawa Timur | 20 |
| Remote | 14 |
| Yogyakarta | 11 |
| Jawa Barat | 9 |
| Jawa Tengah | 6 |

---

## 6. Alur Kerja yang Diharapkan

```
Dataset Indo (cleaned CSV)         Dataset Global (Kaggle CSV)
       ↓                                      ↓
  Local_cleaning.ipynb ✅            Cleaning Global
  (sudah selesai)                    - filter hanya tech roles
                                     - normalisasi skill
                                     - mapping ke role yang sama
       ↓                                      ↓
       └──────────── Feature Alignment ───────┘
             (samakan: title, skills, role,
              location, dataset_source)
                       ↓
              EDA per Dataset
              - Local_EDA.ipynb (Indo)
              - EDA Global
                       ↓
              Comparative EDA
              - skill demand Indo vs Global
              - role distribution Indo vs Global
                       ↓
              Insight & Visualisasi Explanatory
                       ↓
              Dashboard Streamlit
```

### Target Kolom Setelah Feature Alignment
| Kolom Standar | Keterangan |
|---|---|
| `dataset_source` | `indo` atau `global` — pembeda utama antar dataset |
| `title` | Judul posisi (raw) |
| `role` | Kategori tech: `frontend`, `backend`, `data`, `ai/ml`, dll |
| `skills` | Daftar skill, dipisahkan koma, sudah dinormalisasi |
| `skills_count` | Jumlah skill |
| `location` | Nama kota/negara |
| `is_internship` | `True` untuk dataset Indo (semua magang), perlu di-flag untuk global |

---

## 7. Pertanyaan Bisnis yang Disarankan

### Per Dataset Indo
1. Role apa yang paling banyak tersedia untuk magang tech di Jawa?
2. Skill apa yang paling sering diminta untuk posisi magang tech?
3. Apakah ada perbedaan skill demand antara role `data` vs `ai/ml` vs `backend`?
4. Kota/wilayah mana yang paling banyak membuka lowongan magang tech?
5. Berapa rata-rata jumlah skill yang dibutuhkan per lowongan?

### Per Dataset Global
6. Role apa yang paling dominan di job market tech global?
7. Skill apa yang paling sering muncul di job posting tech global?
8. Bagaimana distribusi role/skill berdasarkan wilayah geografis?

### Comparative — Indo vs Global
9. Skill apa yang dominan di Indonesia tapi jarang di global, dan sebaliknya?
10. Apakah role yang tersedia di Jawa mencerminkan tren job market tech global?
11. Seberapa besar skill gap antara magang tech Indo vs job market tech global?
12. Role apa yang kemungkinan *undersupply* di Indonesia dibanding tren global?

---

## 8. Checklist Task untuk Data Scientist

### Dataset Indo ✅ Selesai
- [x] Cleaning `company_name` — pola "ulasan" + fallback dari URL
- [x] Drop kolom tidak diperlukan (`location_raw`, `description_raw`, dll)
- [x] Handle missing `skills` — roadmap mapping + hardcoded fallback
- [x] Drop baris yang tidak bisa di-handle

### Dataset Global (Kaggle)
- [ ] Download dataset: [Job Descriptions 2025 – Tech & Non-Tech Roles](https://www.kaggle.com/datasets/adityarajsrv/job-descriptions-2025-tech-and-non-tech-roles)
- [ ] Filter hanya tech roles (buang non-tech)
- [ ] Normalisasi skill (contoh: `ReactJS`, `React.js`, `React JS` → `react`)
- [ ] Mapping judul ke kategori `role` yang sama dengan dataset Indo
- [ ] Tambahkan kolom `dataset_source = 'global'` dan `is_internship = False`

### Feature Alignment
- [ ] Samakan nama dan format kolom antar kedua dataset
- [ ] Pastikan kolom `skills` menggunakan format dan vocabulary yang konsisten
- [ ] Gabungkan kedua dataset menjadi satu dataframe dengan kolom `dataset_source`

### EDA & Analisis
- [ ] EDA Dataset Indo (`Local_EDA.ipynb`)
- [ ] EDA Dataset Global
- [ ] Comparative EDA: Indo vs Global
- [ ] Insight per dataset + comparative insight
- [ ] Visualisasi explanatory (menjawab pertanyaan bisnis, bukan sekadar bar chart)

### Output Akhir
- [ ] Dashboard interaktif dengan Streamlit
- [ ] Pastikan data siap untuk tahap modeling (rekomendasi magang) jika diperlukan ke depan

---

## 9. Referensi: Top 10 Skills Dataset Indo (Cleaned)

| Rank | Skill | Frekuensi |
|---|---|---|
| 1 | sql | 69 |
| 2 | database | 58 |
| 3 | javascript | 57 |
| 4 | python | 55 |
| 5 | java | 52 |
| 6 | git | 51 |
| 7 | css | 50 |
| 8 | security | 47 |
| 9 | api | 37 |
| 10 | react | 37 |

---

## 10. Cara Menjalankan Scraper (Jika Perlu Tambah Data Indo)

```bash
# Install dependencies
pip install playwright pandas

# Install browser chromium
playwright install chromium

# Jalankan scraper
cd scrapper
python main.py
```

Output: file CSV baru di `data/magangin_jobs_YYYYMMDD_HHMM.csv`

> **Note:** Scraper berjalan dengan mode `headless=False` — browser akan terbuka. Pastikan koneksi internet stabil. Estimasi waktu: ~15–30 menit tergantung jumlah lowongan.

### Cara Update Roadmap Skills (Opsional)
```bash
cd scrapper/roadmap
python fetch_roadmap.py
```
Output: update `skills_per_role.json` di `scrapper/roadmap/output/`

---

*Dokumen ini diupdate berdasarkan state pipeline per 10 Mei 2026 — dataset `magangin_jobs_20260510_1527.csv` (189 lowongan) + cleaning via `Local_cleaning.ipynb`.*

## 11. A/B Testing Implementation

# Magang-in AI — Skill Matching Engine

Platform pencocokan skill mahasiswa dengan lowongan magang teknologi di Pulau Jawa.

## 📊 Hasil A/B Testing

| Metric | Top 3 | Top 5 | Improvement |
|--------|-------|-------|-------------|
| Final Score | 0.4479 | 0.5193 | **+15.94%** |
| Coverage Score | 0.2880 | 0.4459 | **+54.86%** |

**Kesimpulan:** Top 5 skill lebih baik dari Top 3 skill (p < 0.05)

<img width="2083" height="1475" alt="ab_test_visualization" src="https://github.com/user-attachments/assets/77147167-a087-4761-9aa5-4f75266bcc06" />



