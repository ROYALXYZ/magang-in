"""
preprocessing.py — MagangIn
Fungsi utama: Data preprocessing — skill extraction, location detection,
role mapping, scoring, filtering, dan output CSV.
"""

import re
import csv
from collections import Counter
from datetime import datetime

from scrapper.config import (
    ROADMAP_ROLES, TITLE_SKILL_HINTS,
    SKILLS_DB, NORMALIZATION_MAP, SHORT_SKILL_KEYWORDS,
    TARGET_CITIES, JABODETABEK, JOGJA, JAWA_BARAT, JAWA_TENGAH, JAWA_TIMUR, BANTEN,
    TECH_SIGNALS, TECH_ROLES, JAWA_REGIONS,
)

# =========================
# ROLE MAPPING
# =========================

def map_to_roadmap(title_and_desc: str) -> str:
    """Map ke roadmap role dengan priority match agar tidak salah detect."""
    text = title_and_desc.lower()

    PRIORITY = ["backend", "frontend", "fullstack", "mobile", "devops",
                "ai/ml", "data", "qa", "cyber", "ui/ux"]

    for role in PRIORITY:
        for k in ROADMAP_ROLES.get(role, []):
            if k in text:
                return role

    for role, keywords in ROADMAP_ROLES.items():
        if role in PRIORITY:
            continue
        for k in keywords:
            if k in text:
                return role

    return "other"


# =========================
# SKILL EXTRACTION
# =========================

def extract_skills(text: str) -> list[str]:
    """
    Ekstrak skill dari teks dengan word boundary untuk keyword pendek.
    Mencegah false positive seperti:
      - "ios" match di "various", "previous"
      - "go"  match di "go to the office"
    Normalize hasil: power bi → powerbi, node.js → node, dll.
    """
    found = set()
    text  = text.lower()

    for skill, keywords in SKILLS_DB.items():
        for k in keywords:
            k_clean = k.strip()
            if k_clean in SHORT_SKILL_KEYWORDS or len(k_clean) <= 3:
                pattern = rf'\b{re.escape(k_clean)}\b'
                if re.search(pattern, text):
                    found.add(skill)
            else:
                if k_clean in text:
                    found.add(skill)

    normalized = set()
    for skill in found:
        normalized.add(NORMALIZATION_MAP.get(skill, skill))

    return sorted(normalized)


def infer_from_title(title: str, role: str) -> list[str]:
    """
    Infer skills based on job title and detected role if extraction from desc failed.
    """
    inferred = set()
    title_lower = title.lower()

    # Match role specific hints
    if role in TITLE_SKILL_HINTS:
        inferred.update(TITLE_SKILL_HINTS[role])

    # Direct match in title using existing extractor
    title_skills = extract_skills(title_lower)
    inferred.update(title_skills)

    return sorted(list(inferred))


# =========================
# LOCATION DETECTION
# =========================

def detect_location(text: str) -> tuple[str, str]:
    """Return (city, region) — region: Jabodetabek/Banten/Jawa Barat/Jawa Tengah/Jawa Timur/Yogyakarta/Indonesia"""
    text = text.lower()
    for city, hints in TARGET_CITIES.items():
        for hint in hints:
            if hint in text:
                if city in JABODETABEK:
                    region = "Jabodetabek"
                elif city in BANTEN:
                    region = "Banten"
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
    """Advanced location detection dengan 3 layer fallback."""

    # Layer 0: Remote check (highest priority if explicitly stated)
    full_text = f"{title} {location_raw} {desc}".lower()
    if any(k in full_text for k in ["remote", "work from home", "wfh", "anywhere"]):
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

    # Layer 3: Fallback ke bagian awal & akhir desc
    desc_start_end = f"{desc[:500]} {desc[-500:]}"
    city, region = detect_location(desc_start_end)
    if city != "unknown":
        return city, region

    # Layer 4: Default
    return "unknown", "Indonesia"


# =========================
# SCORING
# =========================

def compute_score(job: dict) -> int:
    score = 0

    score += job["skills_count"] * 3

    if job["role"] != "other":
        score += 2

    tech_words = ["developer", "engineer", "data", "software", "analyst", "programmer"]
    if any(k in job["title"].lower() for k in tech_words):
        score += 2

    if any(k in job["title"].lower() for k in ["intern", "magang", "praktik"]):
        score += 3

    if job["region"] == "Yogyakarta":
        score += 5   # Prioritas utama
    elif job["region"] == "Jabodetabek":
        score += 2

    return score


# =========================
# FILTERING
# =========================

def filter_tech(jobs: list[dict]) -> list[dict]:
    """Keep jobs whose role maps to a roadmap.sh path."""
    before = len(jobs)
    result = [j for j in jobs if j["role"] in TECH_ROLES]
    print(f"Filter tech-only   : {len(result)} lolos, {before - len(result)} dibuang (no roadmap path)")
    return result


def filter_jawa(jobs: list[dict]) -> list[dict]:
    """Buang job yang lokasinya di luar Jawa atau unknown."""
    before = len(jobs)
    result = [j for j in jobs if j["region"] in JAWA_REGIONS]
    print(f"Filter Jawa-only   : {len(result)} lolos, {before - len(result)} dibuang (luar Jawa/unknown)")
    return result


# =========================
# OUTPUT
# =========================

def save_to_csv(results: list[dict]) -> str | None:
    if not results:
        print("\n[INFO] Tidak ada data untuk disimpan.")
        return None

    filename = f"data/magangin_jobs_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"

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


def print_summary(enriched: list[dict]):
    """Print ringkasan distribusi region dan role."""
    print(f"\n{'='*65}")
    print(f"TOTAL LOWONGAN UNIK  : {len(enriched)}")

    regions = Counter(j["region"] for j in enriched)
    roles   = Counter(j["role"]   for j in enriched)

    print("\nDistribusi Region:")
    for region, count in regions.most_common():
        print(f"  {region:<25} : {count}")

    print("\nDistribusi Role:")
    for role, count in roles.most_common(10):
        print(f"  {role:<25} : {count}")

    print(f"\n--- TOP 10 LOWONGAN ---")
    for job in enriched[:10]:
        print(f"\n  [{job['score']}pts] {job['title']}")
        print(f"  Company  : {job['company_name']}")
        print(f"  Role     : {job['role']}")
        print(f"  Skills   : {', '.join(job['skills'][:5]) or '-'}")
        print(f"  Location : {job['location_city']} → [{job['region']}]")
        print(f"  Link     : {job['link']}")


# =========================
# ENTRY POINT
# =========================

def run_preprocessing(raw_jobs: list[dict]) -> list[dict]:
    """
    Terima raw enriched jobs dari scrapper, lakukan:
    filtering → scoring → sorting → summary → simpan CSV.
    Return: final clean job list
    """
    # 1. Filter tech-only
    jobs = filter_tech(raw_jobs)

    # 2. Filter Jawa-only
    jobs = filter_jawa(jobs)

    # 3. Enrichment & Scoring
    for job in jobs:
        # Fallback: jika skill kosong, coba infer dari title
        if not job.get("skills"):
            job["skills"] = infer_from_title(job["title"], job["role"])
            job["skills_count"] = len(job["skills"])
            
        job["score"] = compute_score(job)
    
    jobs = sorted(jobs, key=lambda x: x["score"], reverse=True)

    # 4. Summary & preview
    print_summary(jobs)

    # 5. Simpan CSV
    save_to_csv(jobs)

    return jobs
