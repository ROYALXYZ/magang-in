from playwright.sync_api import sync_playwright

# =========================
# CONFIG
# =========================

roadmap_roles = {
    "frontend": ["frontend", "react", "web"],
    "backend": ["backend", "api", "server"],
    "fullstack": ["fullstack"],
    "data": ["data", "analyst"],
    "ai/ml": ["machine learning", "artificial intelligence"],
    "devops": ["devops"],
    "mobile": ["android", "ios"],
    "qa": ["qa", "tester"]
}

skills_db = {
    "python": ["python"],
    "sql": ["sql", "mysql", "postgres"],
    "excel": ["excel"],
    "javascript": ["javascript", "js"],
    "html": ["html"],
    "css": ["css"],
    "react": ["react"],
    "node": ["node", "nodejs"],
    "api": ["api", "rest api"],
    "git": ["git", "github"],
    "docker": ["docker"]
}

# =========================
# HELPERS
# =========================

def map_to_roadmap(title):
    title = title.lower()

    for role, keywords in roadmap_roles.items():
        for k in keywords:
            if k in title:
                return role

    return "other"


def it_relevance_score(title):
    score = 0
    title = title.lower()

    strong = ["developer", "engineer", "backend", "frontend", "data"]
    weak = ["it", "software", "system"]

    for k in strong:
        if k in title:
            score += 2

    for k in weak:
        if k in title:
            score += 1

    return score


def get_job_description(browser, link):
    try:
        page = browser.new_page()
        page.goto(link, timeout=60000)
        page.wait_for_timeout(2500)

        desc = page.inner_text("body").lower()

        page.close()
        return desc

    except Exception as e:
        print("DESC ERROR:", e)
        return ""


def extract_skills(desc):
    found = set()
    desc = desc.lower()

    for skill, keywords in skills_db.items():
        for k in keywords:
            if k in desc:
                found.add(skill)

    return list(found)


def detect_location(text: str) -> str:
    t = (text or "").lower()

    # Jogja / DIY signals
    jogja_keywords = [
        "yogyakarta",
        "jogja",
        "d.i. yogyakarta",
        "di yogyakarta",
        "diy",
        "sleman",
        "bantul",
        "gunungkidul",
        "kulon progo",
        "kulonprogo",
        "wates",
    ]

    for k in jogja_keywords:
        if k in t:
            return "yogyakarta"

    # Minimal fallback cities (extendable)
    city_map = {
        "jakarta": ["jakarta", "dki jakarta"],
        "bandung": ["bandung"],
        "surabaya": ["surabaya"],
        "semarang": ["semarang"],
        "solo": ["surakarta", "solo"],
        "malang": ["malang"],
        "bali": ["denpasar", "bali"],
    }

    for city, keys in city_map.items():
        for k in keys:
            if k in t:
                return city

    return "unknown"

# =========================
# MAIN SCRAPER
# =========================

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # 🔥 BROAD SEARCH (no strict keyword filter)
    page.goto(
        "https://www.kalibrr.com/job-board/te/software-internship/1",
        timeout=60000
    )

    page.wait_for_timeout(5000)

    # scroll to load more jobs
    for _ in range(6):
        page.mouse.wheel(0, 5000)
        page.wait_for_timeout(1500)

    jobs = page.query_selector_all("a[href*='/c/']")

    print(f"Total jobs found (Kalibrr): {len(jobs)}\n")

    results = []
    seen = set()

    for job in jobs:
        try:
            title = job.inner_text().strip().lower()
            link = job.get_attribute("href")

            if not link:
                continue

            full_link = "https://www.kalibrr.com" + link

            if full_link in seen:
                continue
            seen.add(full_link)

            # 🔥 LIGHT FILTER ONLY
            if not ("intern" in title or "magang" in title):
                continue

            role = map_to_roadmap(title)
            it_score = it_relevance_score(title)

            desc = get_job_description(browser, full_link)
            skills = extract_skills(desc)
            combined_text = f"{title} {desc}"
            location = detect_location(combined_text)
            jogja_tag = location == "yogyakarta"

            results.append({
                "title": title,
                "link": full_link,
                "role": role,
                "it_score": it_score,
                "skills": skills,
                "location": location,
                "jogja_tag": jogja_tag
            })

        except Exception as e:
            print("JOB ERROR:", e)
            continue

    page.close()

    # =========================
    # RANKING (NOT FILTERING)
    # =========================

    results = sorted(
        results,
        key=lambda x: (len(x["skills"]), x["it_score"]),
        reverse=True
    )

    print(f"Relevant internship jobs (Kalibrr): {len(results)}\n")

    for job in results[:20]:
        print(f"[IT:{job['it_score']}] ({job['role']}) {job['title']}")
        print("Skills:", job["skills"])
        print(job["link"], "\n")

    browser.close()
