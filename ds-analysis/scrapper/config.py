"""
config.py — MagangIn
Semua konstanta & konfigurasi terpusat di sini.
Tidak ada logic bisnis, tidak ada I/O.
"""

import csv
import os

# =========================
# SKILL VOCABULARY (single source of truth)
# =========================

def _load_skill_vocabulary() -> set:
    """Load daftar valid skills dari skill_vocabulary.csv."""
    vocab_path = os.path.join(os.path.dirname(__file__), "skill_vocabulary.csv")
    skills = set()
    try:
        with open(vocab_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                skill = row["skill"].strip().lower()
                if skill:
                    skills.add(skill)
    except FileNotFoundError:
        print(f"[WARNING] skill_vocabulary.csv tidak ditemukan di {vocab_path}")
    return skills

VALID_SKILLS: set = _load_skill_vocabulary()

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
# Catatan: Semua skill key HARUS ada di skill_vocabulary.csv.
# VALID_SKILLS (di-load dari CSV) adalah single source of truth.
# Skill yang tidak ada di vocabulary akan difilter otomatis di extract_skills().

# Keywords pendek (≤ 4 char) yang butuh word boundary agar tidak false positive
SHORT_SKILL_KEYWORDS = {
    "go", "ios", "r", "c", "ts", "js", "qa", "aws", "gcp", "sql", "php", "c", "git"
}

# Hints untuk inferensi skill dari Job Title (jika deskripsi minim)
# Semua nilai di sini HARUS ada di skill_vocabulary.csv
TITLE_SKILL_HINTS = {
    "data": ["sql", "python", "tableau", "powerbi", "pandas", "numpy", "r"],
    "frontend": ["html", "css", "javascript", "react", "vue", "tailwind"],
    "backend": ["python", "node", "sql", "api", "docker", "laravel"],
    "fullstack": ["javascript", "react", "node", "sql", "git"],
    "mobile": ["flutter", "android", "ios", "kotlin", "swift", "react native"],
    "ui/ux": ["figma", "adobexd", "design system", "user research"],
    "devops": ["docker", "kubernetes", "aws", "cicd", "linux", "ansible", "terraform"],
    "qa": ["selenium", "appium", "testing", "automation", "quality assurance"],
    "cyber": ["security", "penetration", "network security", "wireshark", "networking"],
    "ai/ml": ["python", "tensorflow", "pytorch", "sklearn", "pandas", "numpy"],
}

SKILLS_DB = {
    # Languages (semua ada di vocabulary)
    "python":           ["python"],
    "javascript":       ["javascript", "js", "es6", "vanilla js", "ecmascript"],
    "typescript":       ["typescript", "ts"],
    "java":             ["java", "java se", "java ee", "java spring"],
    "kotlin":           ["kotlin"],
    "swift":            ["swift", "swiftui"],
    "php":              ["php", "php8", "php7"],
    "go":               ["golang", "go"],
    "rust":             ["rust"],
    "cpp":              ["c++", "cpp", "c plus plus"],
    "c":                ["\bc\b"],   # handled via word boundary in extract_skills
    "r":                ["rstudio", "r programming", "tidyverse", "ggplot"],
    "scala":            ["scala", "akka"],

    # Web Frontend
    "html":             ["html", "html5", "html/css", "semantic html"],
    "css":              ["css", "scss", "sass", "css3", "bootstrap", "material ui", "material design"],
    "tailwind":         ["tailwind", "tailwindcss", "tailwind css"],
    "react":            ["react", "reactjs", "react.js", "hooks", "redux", "react hooks", "react context", "react query"],
    "vue":              ["vue", "vuejs", "vue.js", "vuex", "pinia", "nuxt"],
    "angular":          ["angular", "angularjs", "angular.js", "rxjs", "ngrx"],
    "nextjs":           ["next.js", "nextjs", "next js"],
    "astro":            ["astro"],

    # Web Backend
    "node":             ["node", "nodejs", "node.js", "bun", "deno"],
    "django":           ["django", "django rest framework", "drf"],
    "fastapi":          ["fastapi", "fast api"],
    "flask":            ["flask"],
    "laravel":          ["laravel", "lumen"],
    "springboot":       ["spring boot", "springboot", "spring framework", "spring mvc", "spring security"],
    "express":          ["express", "expressjs", "express.js"],
    "aspnet":           ["asp.net", "aspnet", ".net", "dotnet", "c# asp", "asp.net core", ".net core"],
    "ruby on rails":    ["ruby on rails", "rails", "ruby"],

    # Data & ML
    "sql":              ["sql", "mysql", "postgresql", "postgres", "sqlite", "mariadb", "oracle", "sql server", "ms sql", "t-sql", "pl/sql"],
    "nosql":            ["nosql", "cassandra", "dynamodb", "couchdb", "hbase"],
    "pandas":           ["pandas", "dataframe"],
    "numpy":            ["numpy"],
    "tensorflow":       ["tensorflow", "keras", "tf", "tensorflow lite"],
    "pytorch":          ["pytorch", "torch"],
    "sklearn":          ["scikit-learn", "sklearn", "scikit learn"],
    "spark":            ["apache spark", "pyspark", "spark streaming", "databricks"],
    "tableau":          ["tableau", "tableau desktop", "tableau server"],
    "powerbi":          ["power bi", "powerbi", "power business intelligence", "microsoft power bi"],

    # Mobile
    "flutter":          ["flutter", "dart"],
    "android":          ["android", "android studio", "android sdk", "android development"],
    "ios":              ["ios", "xcode", "swiftui", "uikit", "ios development"],
    "react native":     ["react native", "react-native", "expo"],

    # DevOps & Cloud
    "docker":           ["docker", "dockerfile", "docker compose", "docker-compose", "container", "containerization", "podman"],
    "kubernetes":       ["kubernetes", "k8s", "helm", "kubectl", "openshift", "container orchestration"],
    "git":              ["git", "github", "gitlab", "version control", "bitbucket", "source control", "git flow", "git branching"],
    "linux":            ["linux", "ubuntu", "debian", "centos", "redhat", "unix", "fedora", "bash scripting"],
    "bash":             ["bash", "shell script", "shell scripting", "zsh", "powershell", "command line"],
    "aws":              ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks", "rds", "sqs", "cloudwatch", "aws cloud"],
    "gcp":              ["gcp", "google cloud", "google cloud platform", "bigquery", "cloud run", "gke", "pubsub", "vertex ai"],
    "azure":            ["azure", "microsoft azure", "azure devops", "aks", "azure functions", "azure cloud"],
    "cicd":             ["ci/cd", "github actions", "jenkins", "gitlab ci", "circleci", "travis ci", "argocd", "continuous integration", "continuous deployment", "continuous delivery", "pipeline automation"],
    "terraform":        ["terraform", "infrastructure as code", "iac", "pulumi"],
    "ansible":          ["ansible", "playbook", "configuration management"],
    "cloud":            ["cloud computing", "serverless", "cloud native", "hybrid cloud", "multi cloud", "cloud infrastructure"],

    # Design & UX
    "figma":            ["figma", "figma design"],
    "adobexd":          ["adobe xd", "adobe experience design", "xd"],
    "design system":    ["design system", "component library", "storybook", "atomic design", "design token"],
    "user research":    ["user research", "usability testing", "ux research", "user interview", "user testing", "persona", "user journey"],
    "accessibility":    ["accessibility", "wcag", "a11y", "screen reader", "inclusive design"],

    # Database
    "mongodb":          ["mongodb", "mongo", "mongoose", "mongodb atlas"],
    "redis":            ["redis", "redis cache", "memcached", "redis cluster"],
    "firebase":         ["firebase", "firestore", "firebase realtime", "firebase auth"],
    "elasticsearch":    ["elasticsearch", "elastic search", "kibana", "elk stack", "opensearch", "logstash"],
    "database":         ["database design", "database management", "dbms", "relational database", "rdbms", "db design", "data modeling", "erd"],

    # Networking & Security
    "security":         ["cybersecurity", "encryption", "ssl", "tls", "oauth", "jwt", "information security", "infosec", "siem", "soc", "iam", "zero trust", "it security"],
    "network security": ["network security", "firewall", "ids", "ips", "intrusion detection", "nmap", "packet analysis"],
    "networking":       ["tcp/ip", "dns", "ssh", "vpn", "networking", "network protocol", "lan", "wan", "network administration"],
    "penetration":      ["penetration testing", "pentest", "ethical hacking", "vulnerability assessment", "kali linux", "burp suite", "metasploit"],
    "wireshark":        ["wireshark", "tcpdump", "network analysis", "packet capture"],

    # General & Practices
    "api":              ["rest api", "restful", "restful api", "webhook", "api integration", "api design", "openapi", "swagger", "api development"],
    "graphql":          ["graphql", "graph ql"],
    "apollo":           ["apollo graphql", "apollo client", "apollo server"],
    "agile":            ["agile", "scrum", "kanban", "jira", "sprint", "backlog", "standup", "retrospective", "agile methodology", "safe agile"],
    "postman":          ["postman", "insomnia", "api client", "api testing tool"],
    "jest":             ["jest", "vitest", "mocha", "jasmine", "chai"],
    "selenium":         ["selenium", "selenium webdriver", "selenium grid"],
    "appium":           ["appium", "mobile automation"],
    "testing":          ["unit test", "integration test", "e2e testing", "cypress", "playwright", "end-to-end", "test driven", "tdd", "bdd", "test case", "regression testing", "functional testing"],
    "automation":       ["test automation", "automation testing", "robotic process", "rpa", "automated testing", "automation framework", "qa automation"],
    "quality assurance":["quality assurance", "qa testing", "software testing", "qc", "quality control", "test planning", "test strategy"],
    "bitbucket":        ["bitbucket", "bitbucket pipeline"],
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
