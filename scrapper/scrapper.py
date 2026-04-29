"""
scrapper.py — MagangIn
Fungsi utama: Web scraping dari Glints, Kalibrr, dan JobStreet.
Menggunakan Playwright untuk browser automation.
"""

import re
import time
import json as _json
from datetime import datetime
from playwright.sync_api import sync_playwright

from .config import (
    SOURCES,
    ROADMAP_ROLES, ROADMAP_LINKS,
    SKILLS_DB, NORMALIZATION_MAP, SHORT_SKILL_KEYWORDS,
    TARGET_CITIES, JABODETABEK, JOGJA, JAWA_BARAT, JAWA_TENGAH, JAWA_TIMUR,
    TECH_SIGNALS, EXCLUDE_PHRASES,
)
from .preprocessing import (
    extract_skills,
    detect_location_advanced,
    map_to_roadmap,
)

# =========================
# HELPERS
# =========================

def clean_link(link: str) -> str:
    return link.split("?")[0]


def extract_company_from_url(url: str, source: str) -> str:
    """
    Ekstrak nama perusahaan dari pola URL — fallback kalau selector gagal.
    Kalibrr: /id-ID/c/nama-perusahaan/jobs/...
    Glints:  /id/companies/nama-perusahaan/...
    """
    if source == "kalibrr":
        match = re.search(r'/c/([^/]+)/jobs/', url)
        if match:
            return match.group(1).replace("-", " ").title()
    elif source == "glints":
        match = re.search(r'/companies?/([^/]+)', url)
        if match:
            return match.group(1).replace("-", " ").title()
    return "N/A"


def now_str() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


# =========================
# SCRAPER PER SOURCE
# =========================

def scrape_glints(page) -> list[dict]:
    print("\n🔍 Scraping Glints...")
    results = []

    for url in SOURCES["glints"]:
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(7000)  # lebih lama biar JS selesai render

            # Scroll lebih dalam + jeda bervariasi agar lebih natural
            for i in range(15):
                page.mouse.wheel(0, 4000)
                page.wait_for_timeout(1800 if i % 3 != 0 else 3000)

            selectors = [
                '[data-cy="job-card"]',
                '.JobCardsc__JobcardContainer',
                'a[href*="/opportunities/jobs/"][class*="Card"]',
                'a[href*="/opportunities/jobs/"]',  # fallback
            ]

            jobs_els = []
            for sel in selectors:
                jobs_els = page.query_selector_all(sel)
                if jobs_els:
                    keyword = url.split('keyword=')[1].split('&')[0] if 'keyword=' in url else 'glints'
                    print(f"  [{keyword}] Selector '{sel}' → {len(jobs_els)} elemen")
                    break

            for el in jobs_els:
                try:
                    text = el.inner_text().strip()
                    link = el.get_attribute("href") or ""

                    if not link:
                        a = el.query_selector("a")
                        link = a.get_attribute("href") if a else ""

                    if not link or "/opportunities/jobs/" not in link:
                        continue

                    lines = [l.strip() for l in text.split("\n") if l.strip()]
                    title = lines[0] if lines else text[:80]

                    if not any(k in title.lower() for k in ["intern", "magang", "praktik"]):
                        continue

                    full_link = ("https://glints.com" + link) if link.startswith("/") else link
                    full_link = clean_link(full_link)

                    location_el = (
                        el.query_selector('[class*="LocationSpan"] a')
                        or el.query_selector('[class*="location"]')
                        or el.query_selector('[data-cy="job-location"]')
                    )
                    location_raw = location_el.inner_text().strip() if location_el else ""

                    results.append({
                        "source":       "glints",
                        "title":        title,
                        "link":         full_link,
                        "location_raw": location_raw,
                    })
                except Exception:
                    continue

        except Exception as e:
            print(f"  [WARN] Gagal scrape Glints URL: {url[:60]}... → {e}")
            continue
        finally:
            # Jeda antar URL Glints — kurangi kemungkinan rate-limit
            time.sleep(4)

    print(f"  ✅ Raw jobs dari Glints: {len(results)}")
    return results


def scrape_kalibrr(page) -> list[dict]:
    print("\n🔍 Scraping Kalibrr...")
    results = []

    for url in SOURCES["kalibrr"]:
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(6000)

            for i in range(10):
                page.mouse.wheel(0, 4500)
                page.wait_for_timeout(2000 if i % 2 == 0 else 2500)

            jobs_els = page.query_selector_all("a[href*='/c/']")
            url_type = url.split('/job-board/te/')[1].split('/')[0] if '/job-board/te/' in url else 'kalibrr'
            print(f"  [{url_type}] → {len(jobs_els)} elemen")

            for el in jobs_els:
                try:
                    title = el.inner_text().strip()
                    link  = el.get_attribute("href") or ""

                    if not link or not title:
                        continue

                    if not any(k in title.lower() for k in ["intern", "magang", "praktik"]):
                        continue

                    full_link = ("https://www.kalibrr.com" + link) if link.startswith("/") else link
                    full_link = clean_link(full_link)

                    results.append({
                        "source":       "kalibrr",
                        "title":        title,
                        "link":         full_link,
                        "location_raw": "",
                    })
                except Exception:
                    continue

        except Exception as e:
            print(f"  [WARN] Gagal scrape Kalibrr URL: {url[:60]}... → {e}")
            continue
        finally:
            time.sleep(3)

    print(f"  ✅ Raw jobs dari Kalibrr: {len(results)}")
    return results


def scrape_jobstreet(page) -> list[dict]:
    print("\n🔍 Scraping JobStreet...")
    results = []

    urls = SOURCES.get("jobstreet", [])
    INTERN_URLS = {u for u in urls if "intern" in u}

    for url in urls:
        is_intern_url = url in INTERN_URLS
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(6000)

            # Tutup modal login kalau muncul
            try:
                close_btn = page.query_selector("button[aria-label='Close']")
                if close_btn:
                    close_btn.click()
                    page.wait_for_timeout(1000)
            except Exception:
                pass

            for i in range(10):
                page.mouse.wheel(0, 5000)
                page.wait_for_timeout(2000 if i % 3 != 0 else 3000)

            jobs_els = page.query_selector_all("article")
            keyword = url.split('/id/')[-1]
            print(f"  [{keyword}] → {len(jobs_els)} elemen")

            for el in jobs_els:
                try:
                    title_el = el.query_selector("a[data-automation='jobTitle']")
                    if not title_el:
                        title_el = el.query_selector("h3 a[id^='job-title-']")
                    if not title_el:
                        title_el = el.query_selector("h3 a")
                    if not title_el:
                        continue

                    title = title_el.inner_text().strip()
                    link  = title_el.get_attribute("href") or ""

                    if link and not link.startswith("http"):
                        link = "https://id.jobstreet.com" + link

                    if not title or not link:
                        continue

                    if not is_intern_url:
                        if not any(k in title.lower() for k in ["intern", "magang", "internship", "praktik"]):
                            continue

                    full_link = clean_link(link)

                    loc_el     = el.query_selector("[data-automation='jobLocation']")
                    location   = loc_el.inner_text().strip() if loc_el else ""

                    company_el  = el.query_selector("[data-automation='advertiser-name']")
                    company_raw = company_el.inner_text().strip() if company_el else ""
                    # Bersihkan noise "18 ulasan" yang muncul dari widget rating
                    company     = re.sub(r'\s*\d+\s*ulasan', '', company_raw, flags=re.IGNORECASE).strip()

                    results.append({
                        "source":       "jobstreet",
                        "title":        title,
                        "link":         full_link,
                        "location_raw": location,
                        "company_name": company,
                    })

                except Exception:
                    continue

        except Exception as e:
            print(f"  [WARN] Gagal scrape JobStreet URL: {url[:60]}... → {e}")
        finally:
            time.sleep(3)

    print(f"  ✅ Raw jobs dari JobStreet: {len(results)}")
    return results


# =========================
# ENRICHMENT
# =========================

def _try_enrich_page(browser, job: dict, attempt: int = 1) -> tuple:
    """
    Satu kali attempt untuk buka halaman detail dan ekstrak data.
    Return: (desc, company, loc_detail, success)
    """
    desc       = ""
    company    = ""
    loc_detail = ""
    success    = False

    try:
        page = browser.new_page()
        try:
            page.goto(job["link"], timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(5000)

            # ── Priority 0: JSON-LD structured data ──
            try:
                ld_jsons = page.eval_on_selector_all(
                    'script[type="application/ld+json"]',
                    'els => els.map(e => e.textContent)'
                )
                for ld_str in ld_jsons:
                    try:
                        ld = _json.loads(ld_str)
                        if isinstance(ld, list):
                            ld = ld[0]
                        job_loc = ld.get("jobLocation") or ld.get("location") or {}
                        if isinstance(job_loc, list):
                            job_loc = job_loc[0]
                        addr = job_loc.get("address") or job_loc.get("name") or ""
                        if isinstance(addr, dict):
                            addr = " ".join(filter(None, [
                                addr.get("addressLocality", ""),
                                addr.get("addressRegion", ""),
                                addr.get("addressCountry", ""),
                            ]))
                        if addr:
                            loc_detail += " " + str(addr)
                    except Exception:
                        continue
            except Exception:
                pass

            # ── Priority 1: Dedicated location selectors ──
            if not loc_detail.strip():
                loc_selectors = [
                    '[data-cy="job-location"]',
                    '[class*="JobLocation"]',
                    '[class*="job-location"]',
                    '[itemprop="jobLocation"]',
                    '[itemprop="addressLocality"]',
                    'a[href*="/locations/"]',
                    '[class*="LocationSpan"]',
                    '.k-text-subdued',
                ]
                for sel in loc_selectors:
                    try:
                        els = page.query_selector_all(sel)
                        for el in els:
                            txt = el.inner_text().strip()
                            if 2 < len(txt) < 60:
                                loc_detail += " " + txt
                    except Exception:
                        continue

            # ── Description ──
            desc_selectors = [
                '[data-automation="jobAdDetails"]',  # JobStreet (terkonfirmasi dari inspeksi DOM)
                '[data-cy="job-description"]',
                '[class*="JobDescription"]',
                '[class*="job-description"]',
                '[class*="Description__Content"]',
                '.ql-editor',
                '[class*="description"]',
                'main',
            ]
            for sel in desc_selectors:
                try:
                    el = page.query_selector(sel)
                    if el:
                        candidate = el.inner_text().strip()
                        if len(candidate) > 200:
                            desc = candidate
                            break
                except Exception:
                    continue
            if not desc:
                try:
                    desc = page.inner_text("body") or ""
                except Exception:
                    pass

            # ── Company ──
            for sel in [
                '[data-automation="advertiser-name"]',  # JobStreet (list & detail page)
                '[data-cy="company-name"]',
                '.company-name', '.CompanyName',
                'a[href*="/company/"]',
                'a[href*="/companies/"]',
            ]:
                try:
                    el = page.query_selector(sel)
                    if el:
                        raw = el.inner_text().strip()
                        # Bersihkan noise "18 ulasan" yang sama seperti di scrape_jobstreet()
                        company = re.sub(r'\s*\d+\s*ulasan', '', raw, flags=re.IGNORECASE).strip()
                        if company:
                            break
                except Exception:
                    continue

            # Dianggap sukses kalau dapet deskripsi yang cukup panjang
            success = len(desc) > 200

        finally:
            page.close()

    except Exception as e:
        print(f"  [WARN] Attempt {attempt} gagal enrich: {job['link'][:60]}... → {e}")

    return desc, company, loc_detail, success


MAX_ENRICH_RETRIES = 3


def enrich(browser, job: dict) -> dict:
    """
    Buka halaman detail job dengan retry, ekstrak:
    description_raw, company_name, location, skills, role
    """
    desc       = ""
    company    = ""
    loc_detail = ""

    for attempt in range(1, MAX_ENRICH_RETRIES + 1):
        desc, company, loc_detail, success = _try_enrich_page(browser, job, attempt)
        if success:
            break
        if attempt < MAX_ENRICH_RETRIES:
            wait = 3 * attempt
            print(f"  [RETRY] Akan coba lagi dalam {wait}s...")
            time.sleep(wait)

    if not desc:
        print(f"  [DROP-RISK] Deskripsi kosong setelah {MAX_ENRICH_RETRIES}x: {job['title'][:50]}")

    # Deteksi lokasi, skill, role — pakai preprocessing
    location_raw = job.get("location_raw", "") + " " + loc_detail
    city, region = detect_location_advanced(job["title"], location_raw, desc)
    skills       = extract_skills(desc)
    role         = map_to_roadmap(job["title"] + " " + desc[:500])  # lebih banyak konteks

    job["company_name"]    = company or job.get("company_name") or extract_company_from_url(job["link"], job["source"])
    job["description_raw"] = desc[:5000].strip()  # simpan lebih banyak teks untuk skill extraction
    job["skills"]          = skills
    job["skills_count"]    = len(skills)
    job["role"]            = role
    job["location_city"]   = city
    job["region"]          = region
    job["jogja_tag"]       = (city == "yogyakarta")
    job["jabodetabek_tag"] = (region == "Jabodetabek")
    job["scraped_at"]      = now_str()
    job["roadmap_url"]     = ROADMAP_LINKS.get(role, "")

    # Post-enrich: fokus pada job dengan skill roadmap.sh
    title_lower = job["title"].lower()
    if any(phrase in title_lower for phrase in EXCLUDE_PHRASES):
        job["is_tech"] = False
    else:
        job["is_tech"] = (
            job["skills_count"] >= 1
            or bool(job.get("roadmap_url"))
            or any(k in title_lower for k in TECH_SIGNALS)
        )

    return job


# =========================
# ENTRY POINT
# =========================

def run_scraping() -> list[dict]:
    """
    Jalankan semua scraper dan enrichment.
    Return: list of enriched job dicts (hanya is_tech=True)
    """
    import pandas as pd
    import os

    print("=" * 65)
    print("MAGANG-IN Scraper v2.3 — Glints + Kalibrr + JobStreet")
    print("=" * 65)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page    = browser.new_page()

        # 1. SCRAPE
        raw_jobs  = []
        raw_jobs += scrape_glints(page)
        raw_jobs += scrape_kalibrr(page)
        raw_jobs += scrape_jobstreet(page)
        print(f"\nTotal raw jobs: {len(raw_jobs)}")

        # 2. DEDUP berdasarkan URL
        seen, unique = set(), []
        for job in raw_jobs:
            if job["link"] not in seen:
                seen.add(job["link"])
                unique.append(job)
        print(f"Setelah dedup: {len(unique)}")

        # 2.5 SAVE RAW — simpan sebelum enrich supaya data tidak hilang
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        data_dir  = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        os.makedirs(data_dir, exist_ok=True)
        raw_path  = os.path.join(data_dir, f"raw_jobs_{timestamp}.csv")
        pd.DataFrame(unique).to_csv(raw_path, index=False)
        print(f"💾 Raw jobs disimpan ke: {raw_path}")

        # 3. ENRICH (sequential — Playwright sync API tidak thread-safe)
        print(f"\nEnriching {len(unique)} jobs...")
        enriched = []
        dropped  = []
        for i, job in enumerate(unique, 1):
            print(f"  [{i}/{len(unique)}] Enriching: {job['title'][:50]}...")
            job = enrich(browser, job)
            if job.get("is_tech", False):
                enriched.append(job)
            else:
                dropped.append(job)
            time.sleep(1.5)  # jeda antar enrich — lebih manusiawi, kurangi rate-limit risk

        browser.close()

    # Log dropped jobs
    if dropped:
        print(f"\n⚠️  {len(dropped)} job DIBUANG (is_tech=False):")
        for d in dropped:
            reason = []
            if d.get("skills_count", 0) == 0:
                reason.append("no skills")
            if d.get("role") == "other":
                reason.append("role=other")
            if not d.get("description_raw"):
                reason.append("no description")
            print(f"   ✗ {d['title'][:50]:50s} | {', '.join(reason) or 'excluded by filter'}")

    print(f"\n✅ Scraping selesai. {len(enriched)} tech jobs ditemukan (dari {len(unique)} unique).")
    return enriched
