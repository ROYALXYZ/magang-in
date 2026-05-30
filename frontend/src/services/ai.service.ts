import api from './api'
import type { ScanCVResponse, MatchInternshipResponse } from '../types'

export interface PredictResponse {
  message: string
  prediction: {
    match_score?: number
    similarity_score?: number
    coverage_score?: number
    matched_skills?: string[]
    missing_skills?: string[]
  }
}

export interface NormalizeResponse {
  message: string
  normalized: {
    original: string
    normalized: string
  }[]
}

export interface AISkillsResponse {
  message: string
  skills: string[]
}

export interface AIHealthResponse {
  message: string
  status: {
    status?: string
    model_loaded?: boolean
  }
}

export const aiService = {
  // Upload CV untuk ekstraksi skill oleh AI
  scanCV: (cvFile: File) => {
    const formData = new FormData()
    formData.append('file', cvFile)

    return api.post<ScanCVResponse>(
      '/ai/scan-cv',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // CV processing bisa lama
      }
    )
  },

  // Matching skill user dengan lowongan
  matchInternship: (userSkills?: string[]) =>
    api.post<MatchInternshipResponse>(
      '/ai/match-internship',
      { userSkills },
      { timeout: 30000 }
    ),

  // Predict match score untuk specific internship
  predictMatch: (internshipId: string, userSkills?: string[]) =>
    api.post<PredictResponse>(
      '/ai/predict',
      { internshipId, userSkills },
      { timeout: 30000 }
    ),

  // Normalize skill names
  normalizeSkills: (skills: string[]) =>
    api.post<NormalizeResponse>(
      '/ai/normalize-skills',
      { skills },
      { timeout: 15000 }
    ),

  // Get AI master skills
  getAISkills: () =>
    api.get<AISkillsResponse>('/ai/skills', { timeout: 15000 }),

  // Health check AI service
  checkHealth: () =>
    api.get<AIHealthResponse>('/ai/health', { timeout: 10000 }),
}
