"""
config.py — MagangIn
Semua konstanta & konfigurasi terpusat di sini.
Tidak ada logic bisnis, tidak ada I/O.
"""

# =========================
# SOURCE URLS
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

# =========================
# ROLE MAPPING
# =========================

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

# Tech signals — strict filter untuk internship yang pasti tech
TECH_SIGNALS = [
    "software", "developer", "engineer", "data", "frontend", "backend",
    "fullstack", "devops", "android", "ios", "flutter", "mobile",
    "qa", "tester", "cyber", "security", "ui/ux", "ux", "machine learning",
    "ai ", "ml ", "cloud", "it ", "tech", "programmer", "react", "vue",
    "angular", "python", "java", "node", "laravel", "django", "kotlin",
    "analytics", "bi analyst", "power bi", "tableau", "etl", "pipeline",
]

# Tech roles yang lolos filter akhir
TECH_ROLES = {
    "frontend", "backend", "fullstack", "data", "ai/ml",
    "devops", "mobile", "qa", "ui/ux", "cyber", "it-general", "mlops", "bi"
}

# =========================
# SKILLS DATABASE
# =========================

# Keywords pendek (≤ 4 char) yang butuh word boundary agar tidak false positive
SHORT_SKILL_KEYWORDS = {"go", "ios", "r", "c", "ts", "js", "qa", "s3"}

SKILLS_DB = {
    # Languages
    "python":       ["python"],
    "javascript":   ["javascript", "js", "es6"],
    "typescript":   ["typescript"],
    "java":         ["java"],
    "kotlin":       ["kotlin"],
    "swift":        ["swift"],
    "php":          ["php"],
    "go":           ["golang", "go"],
    "rust":         ["rust"],
    "cpp":          ["c++", "cpp"],
    "c":            ["c"],
    "r":            ["r", "rstudio", "r programming"],

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
    # "excel" removed — too common, pollutes tech filtering
    "jupyter":      ["jupyter", "notebook"],

    # Mobile
    "flutter":      ["flutter"],
    "android":      ["android", "android studio"],
    "ios":          ["ios", "xcode"],
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

# Normalization map — gabungkan variasi nama skill yang sama
NORMALIZATION_MAP = {
    "power bi": "powerbi",
    "node.js":  "node",
    "nodejs":   "node",
    "reactjs":  "react",
    "react.js": "react",
    "vuejs":    "vue",
    "vue.js":   "vue",
    "next.js":  "nextjs",
}

# =========================
# LOCATION CONFIG
# =========================

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

JAWA_REGIONS = {"Jabodetabek", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Yogyakarta", "Remote"}

# =========================
# POST-ENRICH FILTER
# =========================

EXCLUDE_PHRASES  = ["data entry", "admin data", "updating data"]   # hard kill
EXCLUDE_KEYWORDS = ["admin", "marketing", "hr", "finance", "legal", "operation", "procurement"]
