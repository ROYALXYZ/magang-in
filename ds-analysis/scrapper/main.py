"""
all_scrapper.py — MagangIn Entry Point
Pipeline utama: jalankan scraping → preprocessing → simpan CSV.

Modul terpisah:
  config.py        → semua konstanta & konfigurasi
  scrapper.py      → web scraping (Playwright)
  preprocessing.py → data preprocessing, scoring, output CSV
"""

import sys, os
if __package__ is None or __package__ == "":
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from scrapper.scrapper import run_scraping
    from scrapper.preprocessing import run_preprocessing
else:
    from .scrapper import run_scraping
    from .preprocessing import run_preprocessing


def main():
    # 1. Scraping: ambil & enrich job dari semua sumber
    raw_jobs = run_scraping()

    # 2. Preprocessing: filter → scoring → sort → simpan CSV
    run_preprocessing(raw_jobs)


if __name__ == "__main__":
    main()