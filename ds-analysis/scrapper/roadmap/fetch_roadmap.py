import os
import json
import requests
import time
import re

# Configuration
ROADMAP_ROLES = [
    "frontend", "backend", "fullstack", "devops", "python", "javascript",
    "typescript", "react", "nodejs", "android", "ios", "flutter",
    "data-analyst", "ai-data-scientist", "mlops", "cyber-security",
    "qa", "ux-design", "docker", "kubernetes"
]

# Mapping specific roles to their URL paths if different
ROLE_URL_OVERRIDE = {
    "fullstack": "full-stack",
}

BLACKLIST_TERMS = [
    "learn", "watch", "read", "visit", "overview", "introduction", "documentation",
    "official docs", "read article", "watch video", "visit website", "learn more"
]

ROLE_MAPPING = {
    "frontend": "frontend",
    "backend": "backend",
    "fullstack": "fullstack",
    "devops": "devops",
    "docker": "devops",
    "kubernetes": "devops",
    "python": "backend",
    "javascript": "backend",
    "typescript": "backend",
    "nodejs": "backend",
    "react": "frontend",
    "android": "mobile",
    "ios": "mobile",
    "flutter": "mobile",
    "data-analyst": "data",
    "ai-data-scientist": "data",
    "mlops": "ai/ml",
    "cyber-security": "cyber",
    "qa": "qa",
    "ux-design": "ui/ux"
}

NORMALIZATION_MAP = {
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    "node.js": "nodejs",
    "node js": "nodejs",
    "postgres": "postgresql",
    "js": "javascript",
    "ts": "typescript",
    "k8s": "kubernetes",
    "uiux": "ui/ux"
}

SHORT_SKILL_KEYWORDS = [
    "sql", "aws", "gcp", "css", "html", "php", "ios", "go", "r", "c#", "c++"
]

RAW_DIR = "scrapper/roadmap/raw"
OUTPUT_DIR = "scrapper/roadmap/output"

def clean_skill_name(name):
    if not name:
        return None
    # Lowercase, strip, remove extra spaces
    name = name.lower().strip()
    name = re.sub(r'\s+', ' ', name)
    
    # Ignore if too short or pure number
    if len(name) < 2 or name.isdigit():
        return None
        
    # Blacklist check
    for term in BLACKLIST_TERMS:
        if term in name:
            return None
            
    return name

def extract_from_node(node, skills):
    """Recursive parser for roadmap JSON nodes"""
    if isinstance(node, dict):
        # Look for labels, titles, text
        for key in ["label", "title", "text"]:
            if key in node and isinstance(node[key], str):
                cleaned = clean_skill_name(node[key])
                if cleaned:
                    skills.add(cleaned)
        
        # Recurse into children and items
        for key in ["items", "children"]:
            if key in node and isinstance(node[key], (list, dict)):
                extract_from_node(node[key], skills)
        
        # Also check all values if it's a dict just in case
        for value in node.values():
            if isinstance(value, (dict, list)):
                extract_from_node(value, skills)
                
    elif isinstance(node, list):
        for item in node:
            extract_from_node(item, skills)

def fetch_role_data(role):
    url_role = ROLE_URL_OVERRIDE.get(role, role)
    # The repository seems to be hosted/redirected to nilbuild/developer-roadmap
    patterns = [
        f"https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/src/data/roadmaps/{url_role}/{url_role}.json",
        f"https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/src/data/roadmaps/{url_role}/roadmap.json"
    ]
    
    for url in patterns:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            continue
    return None

def generate_config_update(all_skills_per_role):
    skills_db = {}
    role_keywords = {}
    title_skill_hints = {}
    
    # 1. Generate SKILLS_DB and ROLE_KEYWORDS
    for role, skills in all_skills_per_role.items():
        mapped_role = ROLE_MAPPING.get(role, "other")
        
        if mapped_role not in role_keywords:
            role_keywords[mapped_role] = set()
        
        for s in skills:
            # Skill DB mapping
            if s not in skills_db:
                skills_db[s] = set()
            skills_db[s].add(mapped_role)
            
            # Role Keywords
            role_keywords[mapped_role].add(s)

    # 2. Add aliases to normalization map (variants)
    final_norm_map = NORMALIZATION_MAP.copy()
    for skill in list(skills_db.keys()):
        # Generate dot variants (e.g., nodejs -> node.js)
        # This is a simple heuristic
        pass

    # 3. Detect short valid skills
    detected_short = set(SHORT_SKILL_KEYWORDS)
    for s in skills_db.keys():
        if len(s) <= 3:
            detected_short.add(s)

    # 4. Generate Title Skill Hints (Using top skills per role as generic hints)
    for role, skills in all_skills_per_role.items():
        # Just take first 10 for simplicity in hints
        title_skill_hints[role.replace('-', ' ')] = skills[:10]

    # Convert sets to sorted lists for JSON/Python output
    skills_db_output = {k: sorted(list(v)) for k, v in sorted(skills_db.items())}
    role_keywords_output = {k: sorted(list(v)) for k, v in sorted(role_keywords.items())}
    
    config_content = f"""\"\"\"
config_update.py — Generated from roadmap.sh
Merge these into scrapper/config.py
\"\"\"

SKILLS_DB = {json.dumps(skills_db_output, indent=4)}

NORMALIZATION_MAP = {json.dumps(final_norm_map, indent=4)}

SHORT_SKILL_KEYWORDS = {sorted(list(detected_short))}

ROLE_KEYWORDS = {json.dumps(role_keywords_output, indent=4)}

TITLE_SKILL_HINTS = {json.dumps(title_skill_hints, indent=4)}
"""
    with open(os.path.join(OUTPUT_DIR, "config_update.py"), "w") as f:
        f.write(config_content)
    
    return len(skills_db), len(final_norm_map), len(title_skill_hints)

def main():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    all_skills_per_role = {}
    success_count = 0
    fail_count = 0
    
    print("Starting roadmap.sh fetch...")
    
    for role in ROADMAP_ROLES:
        print(f"Fetching {role}...", end=" ", flush=True)
        data = fetch_role_data(role)
        
        if data:
            success_count += 1
            # Save raw
            with open(os.path.join(RAW_DIR, f"{role}.json"), "w") as f:
                json.dump(data, f, indent=2)
            
            # Parse
            skills = set()
            extract_from_node(data, skills)
            all_skills_per_role[role] = sorted(list(skills))
            print(f"DONE ({len(skills)} skills)")
        else:
            fail_count += 1
            print("FAILED (404)")
            
        time.sleep(0.5)

    # Save skills_per_role.json
    with open(os.path.join(OUTPUT_DIR, "skills_per_role.json"), "w") as f:
        json.dump(all_skills_per_role, f, indent=2)
        
    total_unique_skills, total_aliases, total_hints = generate_config_update(all_skills_per_role)
    
    # Summary
    print("\n" + "="*30)
    print("ROADMAP FETCH SUMMARY")
    print("="*30)
    print(f"Roles fetched: {len(ROADMAP_ROLES)}")
    print(f"Roles succeeded: {success_count}")
    print(f"Roles failed: {fail_count}")
    print(f"\nTotal unique skills extracted: {total_unique_skills}")
    print(f"Total aliases generated: {total_aliases}")
    print(f"Total title fallback mappings: {total_hints}")
    
    print("\nSkills per role:")
    for role, skills in all_skills_per_role.items():
        print(f"  {role:<20}: {len(skills)}")

if __name__ == "__main__":
    main()
