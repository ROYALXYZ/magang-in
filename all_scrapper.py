"""
MagangIn Scraper v2.2 — Role Fix + Jawa Filter
v2.2: priority role mapping, data entry hard-filter, Jawa-only filter
"""

import re
import time
import csv
from datetime import datetime
from playwright.sync_api import sync_playwright

# =========================
# CONFIG
# =========================

SOURCES = {
    "glints": [
        "https://glints.com/id/opportunities/jobs/explore?keyword=software+engineer+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=data+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=frontend+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=backend+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=mobile+developer+intern&locationName=Indonesia",
    ],
    "kalibrr": [
        "https://www.kalibrr.com/job-board/te/tech-internship/1",
        "https://www.kalibrr.com/job-board/te/data-internship/1",
        "https://www.kalibrr.com/job-board/te/it-internship/1",
    ],
    "jobstreet": [
        "https://id.jobstreet.com/id/internship-jobs",
        "https://id.jobstreet.com/id/software-engineer-intern-jobs",
        "https://id.jobstreet.com/id/data-intern-jobs",
    ],
}

ROADMAP_ROLES = {
    # Tech roles
    "frontend":  ["frontend", "front end", "front-end", "react", "vue", "angular",
                  "web developer", "ui developer"],
    "backend":   ["backend", "back end", "back-end", "api developer", "laravel",
                  "django", "spring", "node developer"],
    "fullstack": ["fullstack", "full stack", "full-stack"],
    "data":      ["data analyst", "data scientist", "data engineer", "data intern",
                  "business intelligence", "bi analyst", "tech data", "data & analytics"],
    "ai/ml":     ["machine learning", "artificial intelligence", "deep learning",
                  "nlp", "computer vision", "ml engineer", "ai engineer"],
    "devops":    ["devops", "cloud engineer", "site reliability", "sre", "infrastructure",
                  "platform engineer"],
    "mobile":    ["mobile developer", "android developer", "ios developer",
                  "flutter developer", "kotlin", "swift"],
    "qa":        ["qa engineer", "quality assurance", "software tester", "automation tester"],
    "ui/ux":     ["ui/ux", "ui ux", "product designer", "ux designer", "ui designer",
                  "product design", "interaction design"],
    "cyber":     ["cybersecurity", "information security", "it security",
                  "penetration", "network security", "cyber"],
    "it-general":["it support", "it intern", "information technology", "software engineer",
                  "programmer", "software developer"],
    # Non-tech (untuk filter & insight)
    "finance":   ["finance", "accounting", "akuntan", "actuary", "tax", "pajak",
                  "treasury", "audit"],
    "legal":     ["legal", "advocate", "hukum", "paralegal", "compliance"],
    "creative":  ["video editor", "graphic designer", "graphic design", "content creator",
                  "videographer", "illustrator", "animator", "motion graphic"],
    "marketing": ["marketing", "digital marketing", "social media", "brand",
                  "digital acquisition", "growth"],
    "design":    ["drafter", "arsitek", "architect", "interior", "product design"],
    "ops":       ["operation", "procurement", "corporate operation", "supply chain",
                  "estimator", "logistic"],
}

# Tech signals — strict filter untuk internship yang pasti tech
TECH_SIGNALS = [
    "software", "developer", "engineer", "data", "frontend", "backend",
    "fullstack", "devops", "android", "ios", "flutter", "mobile",
    "qa", "tester", "cyber", "security", "ui/ux", "ux", "machine learning",
    "ai ", "ml ", "cloud", "it ", "tech", "programmer", "react", "vue",
    "angular", "python", "java", "node", "laravel", "django", "kotlin",
    "analytics", "bi analyst", "power bi", "tableau", "etl", "pipeline",
]

# Roadmap URLs — setiap role punya link langsung ke roadmap.sh
ROADMAP_LINKS = {
    "frontend":   "https://roadmap.sh/frontend",
    "backend":    "https://roadmap.sh/backend",
    "fullstack":  "https://roadmap.sh/full-stack",
    "devops":     "https://roadmap.sh/devops",
    "data":       "https://roadmap.sh/data-analyst",
    "ai/ml":      "https://roadmap.sh/ai-data-scientist",
    "data-eng":   "https://roadmap.sh/data-engineer",
    "android":    "https://roadmap.sh/android",
    "ios":        "https://roadmap.sh/ios",
    "qa":         "https://roadmap.sh/qa",
    "cyber":      "https://roadmap.sh/cyber-security",
    "ui/ux":      "https://roadmap.sh/ux-design",
    "mlops":      "https://roadmap.sh/mlops",
    "bi":         "https://roadmap.sh/bi-analyst",
    "it-general": "https://roadmap.sh/computer-science",
    "mobile":     "https://roadmap.sh/android",
}

# Expanded skills_db — lebih komprehensif untuk kebutuhan DS & tech
SKILLS_DB = {
    # Languages
    "python":       ["python"],
    "javascript":   ["javascript", "js", "es6"],
    "typescript":   ["typescript"],
    "java":         ["java"],
    "kotlin":       ["kotlin"],
    "swift":        ["swift"],
    "php":          ["php"],
    "go":           ["golang", "go"],           # "go" → word boundary
    "rust":         ["rust"],
    "cpp":          ["c++", "cpp"],
    "c":            ["c"],                       # "c" → word boundary
    "r":            ["r", "rstudio", "r programming"],  # "r" → word boundary

    # Web Frontend
    "html":         ["html"],
    "css":          ["css", "scss", "sass", "tailwind"],
    "react":        ["react", "reactjs", "react.js"],
    "vue":          ["vue", "vuejs", "vue.js"],
    "angular":      ["angular"],
    "nextjs":       ["next.js", "nextjs"],

    # Web Backend
    "node":         ["node", "nodejs", "node.js"],
    "django":       ["django"],
    "fastapi":      ["fastapi", "fast api"],
    "flask":        ["flask"],
    "laravel":      ["laravel"],
    "springboot":   ["spring boot", "springboot"],
    "express":      ["express", "expressjs"],

    # Data & ML
    "sql":          ["sql", "mysql", "postgresql", "sqlite"],
    "pandas":       ["pandas"],
    "numpy":        ["numpy"],
    "tensorflow":   ["tensorflow", "keras"],
    "pytorch":      ["pytorch"],
    "sklearn":      ["scikit-learn", "sklearn"],
    "spark":        ["apache spark", "pyspark"],
    "tableau":      ["tableau"],
    "powerbi":      ["power bi", "powerbi"],
    "excel":        ["excel", "spreadsheet"],
    "jupyter":      ["jupyter", "notebook"],

    # Mobile
    "flutter":      ["flutter"],
    "android":      ["android", "android studio"],
    "ios":          ["ios", "xcode"],           # "ios" → word boundary
    "reactnative":  ["react native"],

    # DevOps & Cloud
    "docker":       ["docker", "dockerfile", "container"],
    "kubernetes":   ["kubernetes", "k8s"],
    "git":          ["git", "github", "gitlab", "version control"],
    "linux":        ["linux", "ubuntu", "bash", "shell"],
    "aws":          ["aws", "amazon web services", "ec2", "s3"],
    "gcp":          ["gcp", "google cloud"],
    "azure":        ["azure", "microsoft azure"],
    "cicd":         ["ci/cd", "github actions", "jenkins", "pipeline"],

    # Design
    "figma":        ["figma"],
    "adobexd":      ["adobe xd"],
    "canva":        ["canva"],

    # Database
    "mongodb":      ["mongodb", "mongo"],
    "redis":        ["redis"],
    "firebase":     ["firebase"],
    "elasticsearch":["elasticsearch"],

    # General
    "api":          ["rest api", "restful", "graphql", "webhook"],
    "agile":        ["agile", "scrum", "kanban", "jira"],
    "postman":      ["postman"],
}

# Normalization map — gabungkan variasi nama skill yg sama
NORMALIZATION_MAP = {
    "power bi": "powerbi",
    "node.js": "node",
    "nodejs": "node",
    "reactjs": "react",
    "react.js": "react",
    "vuejs": "vue",
    "vue.js": "vue",
    "next.js": "nextjs",
}

TARGET_CITIES = {
    # Jabodetabek (Top priority for tech)
    "jakarta":    ["jakarta", "dki jakarta", "jkt"],
    "bogor":      ["bogor", "bgr"],
    "depok":      ["depok", "dpk"],
    "tangerang":  ["tangerang", "tangsel", "banten", "tgr"],
    "bekasi":     ["bekasi", "bks", "cikarang"],
    
    # DI Yogyakarta
    "yogyakarta": ["yogyakarta", "jogja", "sleman", "bantul", "gunung kidul", "kulon progo", "diy"],
    
    # Jawa Barat & Banten  
    "bandung":    ["bandung", "bdg", "cimahi"],
    "cirebon":    ["cirebon"],
    "karawang":   ["karawang"],
    
    # Jawa Tengah
    "semarang":   ["semarang", "smg"],
    "surakarta":  ["surakarta", "solo", "sukoharjo"],
    "purwokerto": ["purwokerto", "banyumas"],
    
    # Jawa Timur
    "surabaya":   ["surabaya", "sby"],
    "malang":     ["malang", "mlg", "batu"],
    "sidoarjo":   ["sidoarjo"],
    
}

JABODETABEK  = {"jakarta", "bogor", "depok", "tangerang", "bekasi"}
JAWA_BARAT   = {"bandung", "cirebon", "karawang"}
JAWA_TENGAH  = {"semarang", "surakarta", "purwokerto"}
JAWA_TIMUR   = {"surabaya", "malang", "sidoarjo"}
JOGJA        = {"yogyakarta"}
ALL_JAWA     = JABODETABEK | JAWA_BARAT | JAWA_TENGAH | JAWA_TIMUR | JOGJA

# =========================
# HELPERS
# =========================

def clean_link(link: str) -> str:
    return link.split("?")[0]

def map_to_roadmap(title_and_desc: str) -> str:
    """Map ke roadmap role dengan priority match agar tidak salah detect."""
    text = title_and_desc.lower()

    # Priority check dulu — ini yang paling sering salah detect
    PRIORITY = ["backend", "frontend", "fullstack", "mobile", "devops",
                "ai/ml", "data", "qa", "cyber", "ui/ux"]
    for role in PRIORITY:
        for k in ROADMAP_ROLES.get(role, []):
            if k in text:
                return role

    # Fallback ke semua role lainnya
    for role, keywords in ROADMAP_ROLES.items():
        if role in PRIORITY:
            continue  # sudah di-check
        for k in keywords:
            if k in text:
                return role
    return "other"


# Keywords pendek (≤ 4 char) yang butuh word boundary agar tidak false positive
# Contoh: "go" match "go to", "ios" match "various", "r" match "require"
SHORT_SKILL_KEYWORDS = {"go", "ios", "r", "c", "ts", "js", "qa", "s3"}

def extract_skills(text: str) -> list[str]:
    """
    Ekstrak skill dari teks dengan word boundary untuk keyword pendek.
    Mencegah false positive seperti:
      - "ios" match di "various", "previous"
      - "go"  match di "go to the office"
      - "angular" match di "triangular"
    Normalize hasil: power bi → powerbi, node.js → node, etc
    """
    found = set()
    text = text.lower()
    for skill, keywords in SKILLS_DB.items():
        for k in keywords:
            k_clean = k.strip()
            if k_clean in SHORT_SKILL_KEYWORDS or len(k_clean) <= 3:
                # Pakai word boundary untuk keyword pendek / ambigu
                pattern = rf'\b{re.escape(k_clean)}\b'
                if re.search(pattern, text):
                    found.add(skill)
            else:
                # Keyword panjang cukup pakai substring match
                if k_clean in text:
                    found.add(skill)
    
    # Normalisasi skill names
    normalized = set()
    for skill in found:
        normalized.add(NORMALIZATION_MAP.get(skill, skill))
    
    return sorted(normalized)


def detect_location(text: str) -> tuple[str, str]:
    """Return (city, region) — region: Jabodetabek/Jawa Barat/Jawa Tengah/Jawa Timur/Yogyakarta/Indonesia"""
    text = text.lower()
    for city, hints in TARGET_CITIES.items():
        for hint in hints:
            if hint in text:
                if city in JABODETABEK:
                    region = "Jabodetabek"
                elif city in JOGJA:
                    region = "Yogyakarta"
                elif city in JAWA_BARAT:
                    region = "Jawa Barat"
                elif city in JAWA_TENGAH:
                    region = "Jawa Tengah"
                elif city in JAWA_TIMUR:
                    region = "Jawa Timur"
                else:
                    region = "Indonesia"
                return city, region
    return "unknown", "unknown"

def detect_location_advanced(title: str, location_raw: str, desc: str) -> tuple[str, str]:
    """Advanced location detection dengan 3 layer fallback"""
    
    # Layer 0: Remote check (highest priority if explicitly stated)
    full_text = f"{title} {location_raw} {desc}".lower()
    if any(k in full_text for k in ["remote", "work from home", "wfh", "anywhere"]):
        # Still try to find base city if remote
        city, _ = detect_location(full_text)
        return city if city != "unknown" else "remote", "Remote"

    # Layer 1: Prioritas location_raw dari card (paling reliable)
    if location_raw:
        city, region = detect_location(location_raw)
        if city != "unknown":
            return city, region
            
    # Layer 2: Fallback ke title
    city, region = detect_location(title)
    if city != "unknown":
        return city, region
    
    # Layer 3: Fallback ke full desc (hanya cari di 500 karakter pertama karena biasanya lokasi ada di atas/bawah)
    desc_start_end = f"{desc[:500]} {desc[-500:]}"
    city, region = detect_location(desc_start_end)
    if city != "unknown":
        return city, region
    
    # Layer 4: Default ke Indonesia (jangan "unknown")
    return "unknown", "Indonesia"

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
# SCRAPER CORE
# =========================

def scrape_glints(page) -> list[dict]:
    print("\n🔍 Scraping Glints...")
    results = []
    
    for url in SOURCES["glints"]:
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(5000)

            # Scroll untuk load lebih banyak jobs
            for _ in range(7):
                page.mouse.wheel(0, 5000)
                page.wait_for_timeout(1500)

            # Selector yang lebih spesifik untuk job card Glints
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
                        # Coba cari <a> di dalam card
                        a = el.query_selector("a")
                        link = a.get_attribute("href") if a else ""

                    if not link or "/opportunities/jobs/" not in link:
                        continue

                    # Ambil title dari teks pertama (baris pertama card)
                    lines = [l.strip() for l in text.split("\n") if l.strip()]
                    title = lines[0] if lines else text[:80]

                    # Scrape level: filter hanya intern/magang (tech filter dilakukan post-enrich)
                    if not any(k in title.lower() for k in ["intern", "magang", "praktik"]):
                        continue

                    full_link = ("https://glints.com" + link) if link.startswith("/") else link
                    full_link = clean_link(full_link)

                    # Step 1: Ambil lokasi dari card — jangan tunggu enrich
                    location_el = el.query_selector('[class*="LocationSpan"] a') or el.query_selector('[class*="location"]') or el.query_selector('[data-cy="job-location"]')
                    location_raw = location_el.inner_text().strip() if location_el else ""

                    results.append({
                        "source":        "glints",
                        "title":         title,
                        "link":          full_link,
                        "location_raw":  location_raw,
                    })
                except Exception:
                    continue
        except Exception as e:
            print(f"  [WARN] Gagal scrape Glints URL: {url[:60]}... → {e}")
            continue

    print(f"  ✅ Raw jobs dari Glints: {len(results)}")
    return results


def scrape_kalibrr(page) -> list[dict]:
    print("\n🔍 Scraping Kalibrr...")
    results = []
    
    for url in SOURCES["kalibrr"]:
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(5000)

            for _ in range(5):
                page.mouse.wheel(0, 5000)
                page.wait_for_timeout(1500)

            jobs_els = page.query_selector_all("a[href*='/c/']")

            url_type = url.split('/job-board/te/')[1].split('/')[0] if '/job-board/te/' in url else 'kalibrr'
            print(f"  [{url_type}] → {len(jobs_els)} elemen")

            for el in jobs_els:
                try:
                    title = el.inner_text().strip()
                    link  = el.get_attribute("href") or ""

                    if not link or not title:
                        continue

                    # Scrape level: filter hanya intern/magang (tech filter dilakukan post-enrich)
                    if not any(k in title.lower() for k in ["intern", "magang", "praktik"]):
                        continue

                    full_link = ("https://www.kalibrr.com" + link) if link.startswith("/") else link
                    full_link = clean_link(full_link)

                    results.append({
                        "source":        "kalibrr",
                        "title":         title,
                        "link":          full_link,
                        "location_raw":  "",
                    })
                except Exception:
                    continue
        except Exception as e:
            print(f"  [WARN] Gagal scrape Kalibrr URL: {url[:60]}... → {e}")
            continue

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
            page.wait_for_timeout(5000)

            # Tutup modal login kalau muncul
            try:
                close_btn = page.query_selector("button[aria-label='Close']")
                if close_btn:
                    close_btn.click()
                    page.wait_for_timeout(800)
            except Exception:
                pass

            # Scroll supaya lebih banyak job yang load
            for _ in range(4):
                page.mouse.wheel(0, 5000)
                page.wait_for_timeout(1200)

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
                    link = title_el.get_attribute("href") or ""
                    
                    if link and not link.startswith("http"):
                        link = "https://id.jobstreet.com" + link

                    if not title or not link:
                        continue

                    if not is_intern_url:
                        if not any(k in title.lower() for k in ["intern", "magang", "internship", "praktik"]):
                            continue

                    full_link = clean_link(link)

                    loc_el = el.query_selector("[data-automation='jobLocation']")
                    location = loc_el.inner_text().strip() if loc_el else ""

                    company_el = el.query_selector("[data-automation='jobCompany']")
                    company = company_el.inner_text().strip() if company_el else ""

                    results.append({
                        "source": "jobstreet",
                        "title": title,
                        "link": full_link,
                        "location_raw": location,
                        "company_name": company, # Already populated, will be persisted if enrich fails
                    })

                except Exception:
                    continue

        except Exception as e:
            print(f"  [WARN] Gagal scrape JobStreet URL: {url[:60]}... → {e}")

    print(f"  ✅ Raw jobs dari JobStreet: {len(results)}")
    return results

# =========================
# ENRICHMENT
# =========================

def enrich(browser, job: dict) -> dict:
    """
    Buka halaman detail job, ekstrak:
    - description_raw, company_name, location, skills, role
    """
    desc = ""
    company = ""

    loc_detail = ""
    try:
        page = browser.new_page()
        try:
            page.goto(job["link"], timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(3000)

            # ── Priority 0: JSON-LD structured data (paling reliable) ──
            try:
                ld_jsons = page.eval_on_selector_all(
                    'script[type="application/ld+json"]',
                    'els => els.map(e => e.textContent)'
                )
                import json as _json
                for ld_str in ld_jsons:
                    try:
                        ld = _json.loads(ld_str)
                        # Bisa nested list
                        if isinstance(ld, list): ld = ld[0]
                        # JobPosting schema
                        job_loc = ld.get("jobLocation") or ld.get("location") or {}
                        if isinstance(job_loc, list): job_loc = job_loc[0]
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
            desc = ""
            desc_selectors = [
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
                '[data-cy="company-name"]',
                '.company-name', '.CompanyName',
                'a[href*="/company/"]',
                'a[href*="/companies/"]',
            ]:
                try:
                    el = page.query_selector(sel)
                    if el:
                        company = el.inner_text().strip()
                        break
                except Exception:
                    continue

        finally:
            page.close()  # ← selalu close, bahkan kalau error

    except Exception as e:
        print(f"  [WARN] Gagal enrich: {job['link'][:60]}... → {e}")

    # Step 2: Advanced location detection dengan fallback layers
    location_raw = job.get("location_raw", "") + " " + loc_detail
    city, region = detect_location_advanced(job["title"], location_raw, desc)
    
    skills       = extract_skills(desc)
    
    # Role mapping dengan description untuk akurasi lebih tinggi
    role         = map_to_roadmap(job["title"] + " " + desc[:300])

    job["company_name"]      = company or job.get("company_name") or extract_company_from_url(job["link"], job["source"])
    job["description_raw"]   = desc[:2000].strip()  # cap 2000 char untuk CSV
    job["skills"]            = skills
    job["skills_count"]      = len(skills)
    job["role"]              = role
    job["location_city"]     = city
    job["region"]            = region
    job["jogja_tag"]         = (city == "yogyakarta")
    job["jabodetabek_tag"]   = (region == "Jabodetabek")
    job["scraped_at"]        = now_str()
    
    # Tambah roadmap URL berdasarkan role yang ter-detect
    job["roadmap_url"]       = ROADMAP_LINKS.get(role, "")
    
    # Post-enrich filter: perketat tech filtering
    EXCLUDE_PHRASES = ["data entry", "admin data", "updating data"]  # hard kill
    EXCLUDE_KEYWORDS = ["admin", "marketing", "hr", "finance", "legal", "operation", "procurement"]
    title_lower = job["title"].lower()

    if any(phrase in title_lower for phrase in EXCLUDE_PHRASES):
        job["is_tech"] = False
    elif any(x in title_lower for x in EXCLUDE_KEYWORDS):
        job["is_tech"] = False
    else:
        job["is_tech"] = (role != "other" and job["skills_count"] >= 1) or any(k in title_lower for k in TECH_SIGNALS)

    return job

# =========================
# SCORING
# =========================

def compute_score(job: dict) -> int:
    score = 0

    # Sinyal skill
    score += job["skills_count"] * 3

    # Sinyal role
    if job["role"] != "other":
        score += 2

    # Sinyal IT / tech
    tech_words = ["developer", "engineer", "data", "software", "analyst", "programmer"]
    if any(k in job["title"].lower() for k in tech_words):
        score += 2

    # Sinyal internship
    if any(k in job["title"].lower() for k in ["intern", "magang", "praktik"]):
        score += 3

    # Boost lokasi target
    if job["region"] == "Yogyakarta":
        score += 5  # Prioritas utama
    elif job["region"] == "Jabodetabek":
        score += 2

    return score

# =========================
# OUTPUT
# =========================

def save_to_csv(results: list[dict]):
    if not results:
        print("\n[INFO] Tidak ada data untuk disimpan.")
        return

    filename = f"magangin_jobs_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"

    # Flatten skills list → string untuk CSV
    rows = []
    for r in results:
        row = r.copy()
        row["skills"] = ", ".join(r["skills"]) if isinstance(r["skills"], list) else r["skills"]
        rows.append(row)

    keys = rows[0].keys()
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Saved → {filename}  ({len(rows)} lowongan)")
    return filename

# =========================
# MAIN PIPELINE
# =========================

def main():
    print("=" * 65)
    print("MAGANG-IN Scraper v2.2 — Glints + Kalibrr")
    print("=" * 65)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page    = browser.new_page()

        # 1. SCRAPE
        raw_jobs = []
        raw_jobs += scrape_glints(page)
        raw_jobs += scrape_kalibrr(page)
        raw_jobs += scrape_jobstreet(page)

        print(f"\nTotal raw jobs: {len(raw_jobs)}")

        # 2. DEDUP
        seen     = set()
        unique   = []
        for job in raw_jobs:
            if job["link"] not in seen:
                seen.add(job["link"])
                unique.append(job)

        print(f"Setelah dedup: {len(unique)}")

        # 3. ENRICH (sequential — Playwright sync API tidak thread-safe)
        print(f"\nEnriching {len(unique)} jobs...")
        enriched = []
        for i, job in enumerate(unique, 1):
            print(f"  [{i}/{len(unique)}] Enriching: {job['title'][:50]}...")
            job = enrich(browser, job)
            if job.get("is_tech", False):
                enriched.append(job)
            time.sleep(0.5)  # rate limit ringan

        browser.close()
        # Step 5: Filter tech-only roles — buang non-tech
        TECH_ROLES = {
            "frontend", "backend", "fullstack", "data", "ai/ml",
            "devops", "mobile", "qa", "ui/ux", "cyber", "it-general", "mlops", "bi"
        }
        enriched_tech = [j for j in enriched if j["role"] in TECH_ROLES]
        print(f"\nSetelah filter tech-only: {len(enriched_tech)} dari {len(enriched)}")
        enriched = enriched_tech

        # ── Filter Jawa-only ──
        JAWA_REGIONS = {"Jabodetabek", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Yogyakarta", "Remote"}
        enriched_jawa = [j for j in enriched if j["region"] in JAWA_REGIONS]
        non_jawa_count = len(enriched) - len(enriched_jawa)
        print(f"Filter Jawa-only   : {len(enriched_jawa)} lolos, {non_jawa_count} dibuang (luar Jawa/unknown)")
        enriched = enriched_jawa
    # 4. SCORE & SORT
    for job in enriched:
        job["score"] = compute_score(job)

    enriched = sorted(enriched, key=lambda x: x["score"], reverse=True)

    # 5. SUMMARY
    print(f"\n{'='*65}")
    print(f"TOTAL LOWONGAN UNIK  : {len(enriched)}")

    from collections import Counter
    regions = Counter(j["region"] for j in enriched)
    roles   = Counter(j["role"]   for j in enriched)

    print("\nDistribusi Region:")
    for region, count in regions.most_common():
        print(f"  {region:<25} : {count}")

    print("\nDistribusi Role:")
    for role, count in roles.most_common(10):
        print(f"  {role:<25} : {count}")

    # 6. PREVIEW TOP 10
    print(f"\n--- TOP 10 LOWONGAN ---")
    for job in enriched[:10]:
        print(f"\n  [{job['score']}pts] {job['title']}")
        print(f"  Company  : {job['company_name']}")
        print(f"  Role     : {job['role']}")
        print(f"  Skills   : {', '.join(job['skills'][:5]) or '-'}")
        print(f"  Location : {job['location_city']} → [{job['region']}]")
        print(f"  Link     : {job['link']}")

    # 7. SIMPAN
    save_to_csv(enriched)


if __name__ == "__main__":
    main()

# =========================
# CARA PAKAI:
#   pip install playwright pandas
#   playwright install chromium
#   python scraper_magangin_v2.py
#
# Output: CSV siap untuk EDA & feeding ke AI Engineer
# =========================