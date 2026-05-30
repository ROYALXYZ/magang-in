import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import https from 'https';
import 'dotenv/config';
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CSV_URL = 'https://raw.githubusercontent.com/ferastoro/magangin-ds-analysis/main/data/magangin_jobs_cleaned.csv';

// Role to skill category mapping
const roleToCategory = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'fullstack': 'Frontend',
    'data': 'Data Science',
    'ai/ml': 'AI',
    'devops': 'Backend',
    'mobile': 'Frontend',
    'qa': 'Other',
    'ui/ux': 'Design',
    'cyber': 'Other',
    'it-general': 'Other',
};

// Role to major mapping
const roleToMajor = {
    'frontend': 'Teknik Informatika',
    'backend': 'Teknik Informatika',
    'fullstack': 'Teknik Informatika',
    'data': 'Sistem Informasi',
    'ai/ml': 'Teknik Informatika',
    'devops': 'Teknik Informatika',
    'mobile': 'Teknik Informatika',
    'qa': 'Sistem Informasi',
    'ui/ux': 'Desain Komunikasi Visual',
    'cyber': 'Teknik Informatika',
    'it-general': 'Teknik Informatika',
};

function fetchCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return fetchCSV(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function capitalizeSkill(skill) {
    const specialCases = {
        'html': 'HTML', 'css': 'CSS', 'sql': 'SQL', 'nosql': 'NoSQL',
        'api': 'API', 'aws': 'AWS', 'gcp': 'GCP', 'cicd': 'CI/CD',
        'ios': 'iOS', 'ui/ux': 'UI/UX', 'php': 'PHP', 'r': 'R',
        'javascript': 'JavaScript', 'typescript': 'TypeScript',
        'react': 'React', 'vue': 'Vue.js', 'angular': 'Angular',
        'node': 'Node.js', 'express': 'Express.js', 'nextjs': 'Next.js',
        'python': 'Python', 'django': 'Django', 'flask': 'Flask',
        'fastapi': 'FastAPI', 'java': 'Java', 'go': 'Go', 'rust': 'Rust',
        'docker': 'Docker', 'kubernetes': 'Kubernetes', 'git': 'Git',
        'mongodb': 'MongoDB', 'redis': 'Redis', 'postgresql': 'PostgreSQL',
        'graphql': 'GraphQL', 'tailwind': 'Tailwind CSS',
        'flutter': 'Flutter', 'kotlin': 'Kotlin', 'swift': 'Swift',
        'react native': 'React Native', 'laravel': 'Laravel',
        'springboot': 'Spring Boot', 'tensorflow': 'TensorFlow',
        'pytorch': 'PyTorch', 'pandas': 'Pandas', 'numpy': 'NumPy',
        'sklearn': 'Scikit-learn', 'figma': 'Figma',
        'selenium': 'Selenium', 'jest': 'Jest', 'postman': 'Postman',
        'linux': 'Linux', 'bash': 'Bash', 'terraform': 'Terraform',
        'ansible': 'Ansible', 'azure': 'Azure', 'firebase': 'Firebase',
        'elasticsearch': 'Elasticsearch', 'spark': 'Apache Spark',
        'powerbi': 'Power BI', 'tableau': 'Tableau', 'scala': 'Scala',
        'ruby on rails': 'Ruby on Rails', 'aspnet': 'ASP.NET',
        'wireshark': 'Wireshark', 'appium': 'Appium',
        'adobexd': 'Adobe XD', 'agile': 'Agile',
        'testing': 'Testing', 'automation': 'Automation',
        'security': 'Security', 'networking': 'Networking',
        'penetration': 'Penetration Testing',
        'network security': 'Network Security',
        'quality assurance': 'Quality Assurance',
        'user research': 'User Research',
        'design system': 'Design System',
        'accessibility': 'Accessibility',
        'database': 'Database', 'cloud': 'Cloud Computing',
    };

    return specialCases[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1);
}

async function main() {
    console.log('Fetching CSV data from GitHub...');
    const csvContent = await fetchCSV(CSV_URL);
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    console.log(`Parsed ${lines.length - 1} rows from CSV`);

    // 1. Create or get a system mitra user for seeding
    let mitraUser = await prisma.user.findFirst({ where: { email: 'mitra@gmail.com' } });
    if (!mitraUser) {
        console.error('ERROR: User mitra@gmail.com tidak ditemukan. Pastikan akun sudah terdaftar.');
        process.exit(1);
    }
    console.log(`Using mitra: ${mitraUser.name} (${mitraUser.email})`);


    // 2. Collect all unique skills from the dataset
    const allSkills = new Set();
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 10) continue;

        const [source, title, link, company_name, skills, skills_count, role, location_city, region, roadmap_url] = cols;

        const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
        skillList.forEach(s => allSkills.add(s.toLowerCase()));

        rows.push({ source, title, link, company_name, skills: skillList, role, location_city, region, roadmap_url });
    }

    console.log(`Found ${allSkills.size} unique skills`);

    // 3. Upsert all skills into master Skill table
    const skillMap = new Map(); // lowercase name -> skill record
    for (const rawSkill of allSkills) {
        const displayName = capitalizeSkill(rawSkill);
        const category = null; // Will be set based on context

        const skill = await prisma.skill.upsert({
            where: { name: displayName },
            update: {},
            create: {
                name: displayName,
                category: getCategoryForSkill(rawSkill),
            }
        });
        skillMap.set(rawSkill, skill);
    }
    console.log(`Upserted ${skillMap.size} skills into master table`);

    // 4. Upsert locations
    const uniqueRegions = [...new Set(rows.map(r => r.region))];
    for (const region of uniqueRegions) {
        if (!region) continue;
        await prisma.masterLocation.upsert({
            where: { name: region.toUpperCase() },
            update: {},
            create: { name: region.toUpperCase() }
        });
    }
    const uniqueCities = [...new Set(rows.map(r => r.location_city))];
    for (const city of uniqueCities) {
        if (!city) continue;
        const cityName = city.charAt(0).toUpperCase() + city.slice(1);
        await prisma.masterLocation.upsert({
            where: { name: cityName },
            update: {},
            create: { name: cityName }
        });
    }
    console.log('Upserted locations');

    // 5. Insert internships
    let created = 0;
    let skipped = 0;

    for (const row of rows) {
        // Check if internship with same title + company already exists
        const existing = await prisma.internship.findFirst({
            where: { title: row.title, company: row.company_name }
        });
        if (existing) {
            skipped++;
            continue;
        }

        const locationDisplay = row.location_city
            ? row.location_city.charAt(0).toUpperCase() + row.location_city.slice(1)
            : row.region;

        const internship = await prisma.internship.create({
            data: {
                title: row.title,
                company: row.company_name,
                location: locationDisplay,
                type: row.region === 'Remote' ? 'Remote' : 'On-site',
                duration: '3-6 Bulan',
                level: 'Internship',
                major: roleToMajor[row.role] || 'Teknik Informatika',
                description: `Lowongan magang ${row.title} di ${row.company_name}. Posisi ini membutuhkan keahlian di bidang ${row.role}. Lokasi: ${locationDisplay}, ${row.region}.`,
                skillsRequired: row.skills.map(s => capitalizeSkill(s)).join(', '),
                requirements: `Mahasiswa aktif semester 5-8\nMemiliki keahlian ${row.skills.slice(0, 3).map(s => capitalizeSkill(s)).join(', ')}\nBersedia magang minimal 3 bulan\nMemiliki motivasi belajar yang tinggi`,
                benefits: 'Sertifikat, Uang saku, Mentoring, Networking, Portfolio project',
                mitraId: mitraUser.id,
                isClosed: false,
            }
        });

        // Create InternshipSkill relations
        for (const rawSkill of row.skills) {
            const skill = skillMap.get(rawSkill.toLowerCase());
            if (!skill) continue;

            await prisma.internshipSkill.create({
                data: {
                    internshipId: internship.id,
                    skillId: skill.id,
                }
            }).catch(() => { }); // Skip duplicates
        }

        // Create Roadmap entry if roadmap_url exists
        if (row.roadmap_url) {
            await prisma.roadmap.create({
                data: {
                    internshipId: internship.id,
                    title: `Roadmap ${row.role.charAt(0).toUpperCase() + row.role.slice(1)}`,
                    contentUrl: row.roadmap_url,
                    orderIndex: 0,
                }
            });
        }

        created++;
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created} internships`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Total skills in DB: ${skillMap.size}`);
}

function getCategoryForSkill(skill) {
    const frontendSkills = ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'nextjs', 'tailwind', 'flutter', 'react native', 'kotlin', 'swift', 'android', 'ios'];
    const backendSkills = ['node', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'go', 'rust', 'php', 'laravel', 'springboot', 'ruby on rails', 'aspnet', 'scala', 'graphql', 'api', 'sql', 'nosql', 'mongodb', 'redis', 'postgresql', 'database', 'elasticsearch'];
    const aiSkills = ['tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'spark', 'r', 'powerbi', 'tableau'];
    const devopsSkills = ['docker', 'kubernetes', 'aws', 'gcp', 'azure', 'cicd', 'terraform', 'ansible', 'linux', 'bash', 'cloud', 'firebase'];
    const designSkills = ['figma', 'adobexd', 'design system', 'user research', 'accessibility'];

    if (frontendSkills.includes(skill)) return 'Frontend';
    if (backendSkills.includes(skill)) return 'Backend';
    if (aiSkills.includes(skill)) return 'Data Science';
    if (devopsSkills.includes(skill)) return 'DevOps';
    if (designSkills.includes(skill)) return 'Design';
    return 'Other';
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
