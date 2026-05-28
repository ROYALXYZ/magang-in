// ============ USER & AUTH ============

export interface User {
  id: string
  name: string | null
  email: string
  role: 'admin' | 'mitra' | 'pengguna'
  phone: string | null
  address: string | null
  education: string | null
  institution: string | null
  profileImage: string | null
}

export interface AuthResponse {
  _id: string
  name: string
  email: string
  role: string
  profileImage: string | null
  token: string
}

// ============ SKILLS ============

export interface Skill {
  id: string
  name: string
  category: string | null
}

export interface UserSkill {
  id: string
  userId: string
  skillId: string
  proficiency: string | null
  skill: Skill
}

// ============ INTERNSHIPS ============

export interface Internship {
  id: string
  title: string
  company: string
  location: string
  type: string | null
  duration: string | null
  level: string | null
  major: string | null
  requirements: string | null
  skillsRequired: string | null
  benefits: string | null
  description: string
  isClosed: boolean
  mitraId: string
  skills: InternshipSkill[]
  roadmaps?: Roadmap[]
  createdAt: string
  updatedAt: string
}

export interface InternshipSkill {
  id: string
  internshipId: string
  skillId: string
  skill: Skill
}

export interface Roadmap {
  id: string
  internshipId: string
  title: string
  contentUrl: string | null
  orderIndex: number
}

// ============ APPLICATIONS ============

export interface Application {
  id: string
  internshipId: string
  userId: string
  attachmentUrl: string | null
  coverLetter: string | null
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
  internship: {
    title: string
    company: string
    location: string
  }
}

export interface Applicant {
  id: string
  internshipId: string
  userId: string
  attachmentUrl: string | null
  coverLetter: string | null
  status: string
  createdAt: string
  applicant: {
    name: string
    email: string
    skills: UserSkill[]
  }
}

// ============ MASTER DATA ============

export interface MasterLocation {
  id: string
  name: string
}

export interface MasterMajor {
  id: string
  name: string
}

// ============ AI ============

export interface ScanCVResponse {
  message: string
  extractedSkills: string[]
  confidence: number
  raw?: Record<string, unknown>
}

export interface MatchResult {
  internshipId: string
  id?: string
  title: string
  company: string
  matchScore: number
  missingSkills: string[]
  matched_skills?: string[]
  missing_skills?: string[]
  match_category?: string
  roadmap_url?: string
  coverage_score?: number
  final_score?: number
  similarity_score?: number
  required_skills?: string[]
}

export interface MatchInternshipResponse {
  message: string
  matches: MatchResult[]
}

// ============ ADMIN ============

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  provider: string | null
  createdAt: string
}

export interface Article {
  id: string
  title: string
  content: string
  thumbnailUrl: string | null
  authorId: string
  createdAt: string
  updatedAt: string
}

// ============ API ERROR ============

export interface ApiError {
  status: number | null
  message: string
  isNetworkError: boolean
}
