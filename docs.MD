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
Scraping Playwright
  ├── Glints
  ├── Kalibrr
  └── JobStreet
        ↓
  Enrichment (buka halaman detail)
        ↓
  Preprocessing & Scoring otomatis
        ↓
  magangin_jobs_YYYYMMDD_HHMM.csv
```

### Dua Dataset yang Digunakan
| Dataset | Sumber | Isi | Jumlah |
|---|---|---|---|
| **Dataset Indo** | Scraping (Glints, Kalibrr, JobStreet) | Lowongan magang tech di Jawa | 57 baris |
| **Dataset Global** | Kaggle — *Job Descriptions 2025: Tech & Non-Tech Roles* | Job posting tech global | ~ribuan baris |

### File yang Diserahkan
| File | Deskripsi |
|---|---|
| `magangin_jobs_20260420_2310.csv` | Dataset Indo hasil scraping |
| `all_scrapers.py` | Kode scraper + preprocessing lengkap |
| `eda_simpel.ipynb` | EDA awal — perlu dikembangkan |

---

## 3. Data Dictionary — Dataset Indo

**File:** `magangin_jobs_20260420_2310.csv`  
**Jumlah baris:** 57 | **Jumlah kolom:** 17

| # | Kolom | Tipe | Contoh Nilai | Deskripsi |
|---|---|---|---|---|
| 1 | `source` | string | `jobstreet`, `glints`, `kalibrr` | Platform asal lowongan |
| 2 | `title` | string | `Data Analyst Intern` | Judul posisi lowongan |
| 3 | `link` | string | `https://id.jobstreet.com/...` | URL halaman detail (sudah di-clean, tanpa query params) |
| 4 | `location_raw` | string | `Yogyakarta, DI Yogyakarta` | Teks lokasi mentah dari halaman. Bisa null — lihat Data Issues |
| 5 | `company_name` | string | `Tokopedia` | Nama perusahaan. Bisa null atau dirty — lihat Data Issues |
| 6 | `description_raw` | string | *(teks panjang)* | Deskripsi mentah dari halaman detail, dibatasi 2000 karakter. Masih mengandung boilerplate — lihat Data Issues |
| 7 | `skills` | string | `python, sql, pandas, git` | Skill yang terdeteksi dari deskripsi, dipisahkan koma. Diambil dari `SKILLS_DB` di scraper. Null jika tidak ada yang cocok |
| 8 | `skills_count` | integer | `5` | Jumlah skill terdeteksi. Range: 0–14 |
| 9 | `role` | string | `data` | Kategori roadmap IT hasil mapping otomatis dari judul. Lihat tabel role di bawah |
| 10 | `location_city` | string | `jakarta`, `yogyakarta`, `unknown` | Kota terdeteksi (lowercase). `unknown` jika gagal dideteksi |
| 11 | `region` | string | `Jabodetabek` | Wilayah hasil klasifikasi: `Jabodetabek`, `Yogyakarta`, `Jawa Barat`, `Jawa Tengah`, `Jawa Timur`, `Remote` |
| 12 | `jogja_tag` | boolean | `True` / `False` | `True` jika lokasi di wilayah DI Yogyakarta |
| 13 | `jabodetabek_tag` | boolean | `True` / `False` | `True` jika lokasi di wilayah Jabodetabek |
| 14 | `scraped_at` | datetime string | `2026-04-20 23:02:18` | Timestamp saat data diambil |
| 15 | `roadmap_url` | string | `https://roadmap.sh/data-analyst` | URL roadmap.sh relevan berdasarkan `role` |
| 16 | `is_tech` | boolean | `True` / `False` | `True` jika terklasifikasi sebagai posisi teknologi. Berbasis `role`, `skills_count`, dan keyword judul |
| 17 | `score` | integer | `42` | Skor relevansi. Range: 5–51. Formula: `skills_count × 3` + bonus role IT (+2) + bonus keyword teknis (+2) + bonus internship (+3) + bonus Yogyakarta (+5) / Jabodetabek (+2) |

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

## 4. Data Issues — Dataset Indo (Wajib Dibaca)

### ⚠️ Issue 1: `company_name` — Dirty Data (28 baris)
**Masalah:** Sebagian besar data dari JobStreet memiliki `company_name` berisi jumlah ulasan perusahaan (contoh: `"18 ulasan"`, `"185 ulasan"`) karena selector scraper menangkap elemen rating, bukan nama perusahaan.

**Rekomendasi:** Nilai yang mengandung kata `"ulasan"` diperlakukan sebagai null. Nama perusahaan asli bisa di-retrieve manual atau scraping ulang jika diperlukan untuk analisis company-level.

### ⚠️ Issue 2: `description_raw` — Masih Ada Boilerplate
**Masalah:** Kolom deskripsi masih mengandung elemen UI web seperti `"Lewati ke konten"`, `"JobStreet"`, `"Masuk"`, `"Simpan"`.

**Rekomendasi:** Lakukan text cleaning sebelum analisis NLP atau skill extraction tambahan.

### ⚠️ Issue 3: Missing Values
| Kolom | Jumlah Null | Penjelasan |
|---|---|---|
| `location_raw` | 15 (26%) | Kalibrr tidak menyediakan lokasi di halaman list. Gunakan `location_city` sebagai fallback |
| `company_name` | 6 | Selector gagal, tidak ada fallback |
| `skills` | 3 | Tidak ada keyword dari `SKILLS_DB` yang cocok di deskripsi |

### ℹ️ Issue 4: `score` Bukan Metrik Absolut
`score` adalah sistem ranking internal untuk mengurutkan lowongan — **bukan** ground truth kualitas. Jangan digunakan sebagai label untuk modeling tanpa validasi lebih lanjut.

---

## 5. Alur Kerja yang Diharapkan

```
Dataset Indo (CSV)              Dataset Global (Kaggle CSV)
       ↓                                  ↓
  Cleaning Indo                   Cleaning Global
  - fix company_name              - filter hanya tech roles
  - clean description_raw         - normalisasi skill
  - handle nulls                  - mapping ke role yang sama
       ↓                                  ↓
       └──────── Feature Alignment ───────┘
          (samakan: title, skills, role,
           location, dataset_source)
                    ↓
           EDA per Dataset
           - EDA Indo
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
| `skills` | Daftar skill, dipisahkan koma, sudah dinormalisasi (contoh: `ReactJS → react`) |
| `skills_count` | Jumlah skill |
| `location` | Nama kota/negara |
| `is_internship` | `True` untuk dataset Indo (semua magang), perlu di-flag untuk global |

---

## 6. Pertanyaan Bisnis yang Disarankan

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

## 7. Checklist Task untuk Data Scientist

### Dataset Indo
- [ ] Cleaning `company_name` — nilai dengan kata `"ulasan"` → null
- [ ] Cleaning `description_raw` — buang boilerplate web
- [ ] Handle missing values (`location_raw`, `skills`)

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
- [ ] EDA Dataset Indo (kembangkan dari `eda_simpel.ipynb`)
- [ ] EDA Dataset Global
- [ ] Comparative EDA: Indo vs Global
- [ ] Insight per dataset + comparative insight
- [ ] Visualisasi explanatory (menjawab pertanyaan bisnis, bukan sekadar bar chart)

### Output Akhir
- [ ] Dashboard interaktif dengan Streamlit
- [ ] Pastikan data siap untuk tahap modeling (rekomendasi magang) jika diperlukan ke depan

---

## 8. Referensi: Top 10 Skills Dataset Indo

| Rank | Skill | Frekuensi |
|---|---|---|
| 1 | sql | 31 |
| 2 | java | 27 |
| 3 | javascript | 22 |
| 4 | excel | 20 |
| 5 | python | 16 |
| 6 | git | 14 |
| 7 | react | 12 |
| 8 | css | 10 |
| 9 | html | 10 |
| 10 | php | 10 |

---

## 9. Cara Menjalankan Scraper (Jika Perlu Tambah Data Indo)

```bash
pip install playwright pandas
playwright install chromium
python all_scrapers.py
```

Output: file CSV baru dengan nama `magangin_jobs_YYYYMMDD_HHMM.csv`

> **Note:** Scraper berjalan dengan mode `headless=False` — browser akan terbuka. Pastikan koneksi internet stabil. Estimasi waktu: ~15–30 menit untuk 57+ lowongan.

---

*Dokumen ini dibuat berdasarkan analisis kode `all_scrapers.py` dan dataset `magangin_jobs_20260420_2310.csv` per 20 April 2026.*