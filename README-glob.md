# 🚀 Magang-In: Global vs Local Tech Market Analysis
Proyek ini bertujuan untuk melakukan perbandingan standar kompetensi antara pasar kerja teknologi Global dan Lokal (Indonesia). Hasil analisis ini digunakan sebagai basis data untuk sistem rekomendasi pada platform Magang-In agar mahasiswa dapat mempersiapkan diri sesuai standar industri internasional.

📂 Struktur Folder
data/: Berisi dataset mentah dan hasil pembersihan.

job_dataset.csv: Dataset global (Kaggle).

magangin_jobs_cleaned.csv: Dataset lokal tim Magang-In.

global_jobs_cleaned.csv: Hasil akhir pembersihan data global.

notebooks/:

01_Global_preprocessing_cleaning.ipynb: Tahap pembersihan data global.

02_Global_EDA.ipynb: Tahap analisis visual dan perbandingan.

📊 Temuan Utama (Key Insights)
Berdasarkan analisis Exploratory Data Analysis (EDA) yang dilakukan, ditemukan beberapa poin krusial:

Rata-rata Skill Global: 13.16 skill per lowongan.

Rata-rata Skill Lokal: 5.23 skill per lowongan.

Kesenjangan Kompetensi: Terdapat selisih sebesar 7.93 skill antara standar global dan lokal.

Skill Paling Dicari: Python, Git, Java, Docker, dan AWS mendominasi permintaan pasar global.

🛠️ Cara Penggunaan
Pastikan semua file di folder data/ sudah tersedia.

Jalankan notebook 01_Global_preprocessing_cleaning.ipynb untuk melakukan standarisasi data.

Jalankan notebook 02_Global_EDA.ipynb untuk melihat visualisasi dan hasil perbandingan.

🎯 Kesimpulan
Industri global menuntut kualifikasi yang jauh lebih kompleks dibandingkan industri lokal. Proyek Magang-In berkomitmen untuk menjembatani gap ini dengan memberikan rekomendasi pelatihan yang relevan bagi mahasiswa agar siap bersaing di level internasional.
