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
    "sql": ["sql"],
    "excel": ["excel"],
    "javascript": ["javascript", "js"],
    "html": ["html"],
    "css": ["css"],
    "react": ["react"],
    "node": ["node", "nodejs"],
    "api": ["api"],
    "git": ["git", "github"],
    "docker": ["docker"]
}

# =========================
# HELPERS
# =========================

def clean_link(link):
    return link.split("?")[0]


def map_to_roadmap(title):
    title = title.lower()

    for role, keywords in roadmap_roles.items():
        for k in keywords:
            if k in title:
                return role

    return "other"


def score_job(title):
    """
    SIMPLE scoring (NO HARD FILTERING)
    """
    score = 0
    title = title.lower()

    if "intern" in title or "magang" in title:
        score += 3

    # soft signal
    tech_keywords = ["developer", "engineer", "data", "software", "it"]
    for k in tech_keywords:
        if k in title:
            score += 1

    return score


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
        page.goto(link, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        desc = page.inner_text("main").lower()

        page.close()
        return desc

    except Exception as e:
        print("desc error:", e)
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
# MAIN PIPELINE (NO HARD FILTER)
# =========================

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # 🔥 BROAD SEARCH (no strict filter)
    page.goto(
        "https://glints.com/id/opportunities/jobs/explore?keyword=internship",
        timeout=60000
    )

    page.wait_for_timeout(5000)

    # scroll to load more jobs
    for _ in range(6):
        page.mouse.wheel(0, 5000)
        page.wait_for_timeout(1500)

    jobs = page.query_selector_all('a[href*="/opportunities/jobs/"]')

    print(f"Total jobs found: {len(jobs)}\n")

    results = []
    seen = set()

    for job in jobs:
        try:
            title = job.inner_text().strip().lower()
            link = job.get_attribute("href")

            if not link:
                continue

            full_link = "https://glints.com" + clean_link(link)

            if full_link in seen:
                continue
            seen.add(full_link)

            # ❗ ONLY LIGHT FILTER (NOT HARD)
            if not ("intern" in title or "magang" in title):
                continue

            role = map_to_roadmap(title)
            score = score_job(title)
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
                "score": score,
                "it_score": it_score,
                "skills": skills,
                "location": location,
                "jogja_tag": jogja_tag
            })

        except Exception as e:
            print("job error:", e)
            continue

    page.close()

    # =========================
    # RANKING (NOT FILTERING)
    # =========================

    results = sorted(
        results,
        key=lambda x: (
            len(x["skills"]),
            x["it_score"],
            x["score"]
        ),
        reverse=True
    )

    print(f"Internship jobs collected: {len(results)}\n")

    for job in results[:20]:
        print(f"[IT:{job['it_score']}][S:{job['score']}] ({job['role']}) {job['title']}")
        print("Skills:", job["skills"])
        print(job["link"], "\n")

    browser.close()
