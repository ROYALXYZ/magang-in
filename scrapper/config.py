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
        "https://glints.com/id/opportunities/jobs/explore?keyword=fullstack+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=mobile+developer+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=qa+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=ui+ux+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=machine+learning+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=devops+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=cybersecurity+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=web+developer+intern&locationName=Indonesia",
        "https://glints.com/id/opportunities/jobs/explore?keyword=it+intern&locationName=Indonesia",
    ],
    "kalibrr": [
        "https://www.kalibrr.com/job-board/te/tech-internship/1",
        "https://www.kalibrr.com/job-board/te/data-internship/1",
        "https://www.kalibrr.com/job-board/te/it-internship/1",
        "https://www.kalibrr.com/job-board/te/engineering-internship/1",
        "https://www.kalibrr.com/job-board/te/software-engineering-internship/1",
        "https://www.kalibrr.com/job-board/te/design-internship/1",
        "https://www.kalibrr.com/job-board/te/it-software-internship/1",
        "https://www.kalibrr.com/job-board/te/data-science-internship/1",
        "https://www.kalibrr.com/job-board/te/quality-assurance-internship/1",
    ],
    "jobstreet": [
        "https://id.jobstreet.com/id/internship-jobs",
        "https://id.jobstreet.com/id/software-engineer-intern-jobs",
        "https://id.jobstreet.com/id/data-intern-jobs",
        "https://id.jobstreet.com/id/frontend-intern-jobs",
        "https://id.jobstreet.com/id/backend-intern-jobs",
        "https://id.jobstreet.com/id/fullstack-intern-jobs",
        "https://id.jobstreet.com/id/devops-intern-jobs",
        "https://id.jobstreet.com/id/cyber-security-intern-jobs",
        "https://id.jobstreet.com/id/machine-learning-intern-jobs",
        "https://id.jobstreet.com/id/qa-intern-jobs",
        "https://id.jobstreet.com/id/ui-ux-intern-jobs",
        "https://id.jobstreet.com/id/it-intern-jobs",
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
SHORT_SKILL_KEYWORDS = {
    "go", "ios", "r", "c", "ts", "js", "qa", "s3", "aws", "gcp", "sql", "php", "c#", "c++", "git", "npm"
}

# Hints untuk inferensi skill dari Job Title (jika deskripsi minim)
TITLE_SKILL_HINTS = {
    "data analyst": ["sql", "excel", "python", "tableau", "powerbi"],
    "frontend": ["html", "css", "javascript", "react", "vue", "tailwind"],
    "backend": ["python", "nodejs", "sql", "api", "docker", "laravel"],
    "fullstack": ["javascript", "react", "nodejs", "sql", "git"],
    "mobile": ["flutter", "android", "ios", "kotlin", "swift"],
    "ui/ux": ["figma", "adobexd", "design system", "user research"],
    "devops": ["docker", "kubernetes", "aws", "cicd", "linux"],
    "qa": ["selenium", "appium", "testing", "automation", "quality assurance"],
    "cyber": ["security", "penetration", "network security", "wireshark"],
}

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
    
    # Roadmap.sh Enriched Skills
    "accessibility": ["accessibility"],
    "ansible":      ["ansible"],
    "apollo":       ["apollo"],
    "astro":        ["astro"],
    "bash":         ["bash", "shell"],
    "bitbucket":    ["bitbucket"],
    "ci/cd":        ["jenkins", "github actions", "gitlab ci", "circleci", "travis ci"],
    "cloud":        ["cloud computing", "serverless"],
    "css":          ["css", "scss", "sass", "tailwind", "bootstrap", "material ui"],
    "database":     ["mysql", "postgresql", "mongodb", "redis", "elasticsearch", "sqlite", "oracle", "sql server"],
    "graphql":      ["graphql", "apollo"],
    "jest":         ["jest"],
    "kubernetes":   ["kubernetes", "k8s", "helm"],
    "linux":        ["linux", "ubuntu", "debian", "centos", "redhat"],
    "monitoring":   ["prometheus", "grafana", "new relic", "datadog"],
    "networking":   ["tcp/ip", "dns", "http", "https", "ssh"],
    "nosql":        ["nosql", "mongodb", "cassandra", "dynamodb"],
    "react":        ["react", "reactjs", "hooks", "redux", "context api"],
    "security":     ["security", "cybersecurity", "encryption", "ssl", "oauth", "jwt"],
    "testing":      ["unit test", "integration test", "e2e testing", "cypress", "playwright"],
    "typescript":   ["typescript", "ts"],
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
    # Jabodetabek (Banten & DKI & Jabar parts)
    "jakarta":    ["jakarta", "dki jakarta", "jkt"],
    "kepulauan seribu": ["kepulauan seribu"],
    "bogor":      ["bogor", "bgr", "cibinong"],
    "depok":      ["depok", "dpk"],
    "tangerang":  ["tangerang", "tangsel", "banten", "tgr"],
    "bekasi":     ["bekasi", "bks", "cikarang"],
    
    # Banten (Non-Jabodetabek)
    "serang":     ["serang"],
    "cilegon":    ["cilegon"],
    "pandeglang": ["pandeglang"],
    "lebak":      ["lebak", "rangkasbitung"],

    # DI Yogyakarta
    "yogyakarta": ["yogyakarta", "jogja", "diy"],
    "sleman":     ["sleman"],
    "bantul":     ["bantul"],
    "gunungkidul": ["gunungkidul", "gunung kidul", "wonosari"],
    "kulon progo": ["kulon progo", "wates"],

    # Jawa Barat
    "bandung":    ["bandung", "bdg", "cimahi", "soreang", "ngamprah"],
    "cirebon":    ["cirebon", "sumber"],
    "karawang":   ["karawang"],
    "sukabumi":   ["sukabumi", "pelabuhanratu"],
    "tasikmalaya": ["tasikmalaya", "singaparna"],
    "banjar":     ["banjar"],
    "ciamis":     ["ciamis"],
    "cianjur":    ["cianjur"],
    "garut":      ["garut"],
    "indramayu":  ["indramayu"],
    "kuningan":   ["kuningan"],
    "majalengka": ["majalengka"],
    "pangandaran": ["pangandaran"],
    "purwakarta": ["purwakarta"],
    "subang":     ["subang"],
    "sumedang":   ["sumedang"],

    # Jawa Tengah
    "semarang":   ["semarang", "smg", "ungkaran"],
    "surakarta":  ["surakarta", "solo"],
    "salatiga":   ["salatiga"],
    "magelang":   ["magelang", "mungkid"],
    "pekalongan": ["pekalongan", "kajen"],
    "tegal":      ["tegal", "slawi"],
    "banjarnegara": ["banjarnegara"],
    "banyumas":   ["banyumas", "purwokerto"],
    "batang":     ["batang"],
    "blora":      ["blora"],
    "boyolali":   ["boyolali"],
    "brebes":     ["brebes"],
    "cilacap":    ["cilacap"],
    "demak":      ["demak"],
    "grobogan":   ["grobogan", "purwodadi"],
    "jepara":     ["jepara"],
    "karanganyar": ["karanganyar"],
    "kebumen":    ["kebumen"],
    "kendal":     ["kendal"],
    "klaten":     ["klaten"],
    "kudus":      ["kudus"],
    "pati":       ["pati"],
    "pemalang":   ["pemalang"],
    "purbalingga": ["purbalingga"],
    "purworejo":  ["purworejo"],
    "rembang":    ["rembang"],
    "sragen":     ["sragen"],
    "sukoharjo":  ["sukoharjo"],
    "temanggung": ["temanggung"],
    "wonogiri":   ["wonogiri"],
    "wonosobo":   ["wonosobo"],

    # Jawa Timur
    "surabaya":   ["surabaya", "sby"],
    "malang":     ["malang", "mlg", "kepanjen"],
    "sidoarjo":   ["sidoarjo"],
    "batu":       ["batu"],
    "blitar":     ["blitar", "kanigoro"],
    "kediri":     ["kediri", "pare"],
    "madiun":     ["madiun", "caruban"],
    "mojokerto":  ["mojokerto", "mojosari"],
    "pasuruan":   ["pasuruan", "bangil"],
    "probolinggo": ["probolinggo", "kraksaan"],
    "bangkalan":  ["bangkalan"],
    "banyuwangi": ["banyuwangi"],
    "bojonegoro": ["bojonegoro"],
    "bondowoso":  ["bondowoso"],
    "gresik":     ["gresik"],
    "jember":     ["jember"],
    "jombang":    ["jombang"],
    "lamongan":   ["lamongan"],
    "lumajang":   ["lumajang"],
    "magetan":    ["magetan"],
    "nganjuk":    ["nganjuk"],
    "ngawi":      ["ngawi"],
    "pacitan":    ["pacitan"],
    "pamekasan":  ["pamekasan"],
    "ponorogo":   ["ponorogo"],
    "sampang":    ["sampang"],
    "situbondo":  ["situbondo"],
    "sumenep":    ["sumenep"],
    "trenggalek": ["trenggalek"],
    "tuban":      ["tuban"],
    "tulungagung": ["tulungagung"],
}

JABODETABEK  = {"jakarta", "kepulauan seribu", "bogor", "depok", "tangerang", "bekasi"}
BANTEN       = {"serang", "cilegon", "pandeglang", "lebak"}
JAWA_BARAT   = {"bandung", "cirebon", "karawang", "sukabumi", "tasikmalaya", "banjar", "ciamis", "cianjur", "garut", "indramayu", "kuningan", "majalengka", "pangandaran", "purwakarta", "subang", "sumedang"}
JAWA_TENGAH  = {"semarang", "surakarta", "salatiga", "magelang", "pekalongan", "tegal", "banjarnegara", "banyumas", "batang", "blora", "boyolali", "brebes", "cilacap", "demak", "grobogan", "jepara", "karanganyar", "kebumen", "kendal", "klaten", "kudus", "pati", "pemalang", "purbalingga", "purworejo", "rembang", "sragen", "sukoharjo", "temanggung", "wonogiri", "wonosobo"}
JAWA_TIMUR   = {"surabaya", "malang", "sidoarjo", "batu", "blitar", "kediri", "madiun", "mojokerto", "pasuruan", "probolinggo", "bangkalan", "banyuwangi", "bojonegoro", "bondowoso", "gresik", "jember", "jombang", "lamongan", "lumajang", "magetan", "nganjuk", "ngawi", "pacitan", "pamekasan", "ponorogo", "sampang", "situbondo", "sumenep", "trenggalek", "tuban", "tulungagung"}
JOGJA        = {"yogyakarta", "sleman", "bantul", "gunungkidul", "kulon progo"}
ALL_JAWA     = JABODETABEK | BANTEN | JAWA_BARAT | JAWA_TENGAH | JAWA_TIMUR | JOGJA

JAWA_REGIONS = {"Jabodetabek", "Banten", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Yogyakarta", "Remote"}

# =========================
# POST-ENRICH FILTER
# =========================

EXCLUDE_PHRASES  = ["data entry", "admin data", "updating data"]   # hard kill
EXCLUDE_KEYWORDS = ["admin", "marketing", "hr", "finance", "legal", "operation", "procurement"]
