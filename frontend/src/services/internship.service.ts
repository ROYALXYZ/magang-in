import api from './api'
import type { Internship, MasterLocation } from '../types'

export const internshipService = {
  // Create lowongan baru (khusus Mitra)
  create: (data: Partial<Internship>) => 
    api.post<{ message: string; internship: Internship }>('/internships', data),

  // Update lowongan (khusus Mitra)
  update: (id: string, data: Partial<Internship>) =>
    api.put<{ message: string; internship: Internship }>(`/internships/mitra/${id}`, data),

  // Delete lowongan (khusus Mitra)
  delete: (id: string) =>
    api.delete<{ message: string }>(`/internships/mitra/${id}`),

  // Get semua lowongan milik mitra login
  getMyInternships: () =>
    api.get<Internship[]>('/internships/mitra/my-postings'),

  // Get pelamar pada lowongan tertentu (khusus Mitra)
  getApplicants: (internshipId: string) =>
    api.get<any[]>(`/internships/${internshipId}/applicants`),

  // Get SEMUA pelamar di semua lowongan mitra
  getAllMyApplicants: () =>
    api.get<any[]>('/internships/mitra/all-applicants'),

  // Update status pelamar (khusus Mitra)
  updateApplicationStatus: (applicationId: string, status: 'accepted' | 'rejected') =>
    api.patch<{ message: string }>(`/internships/applications/${applicationId}`, { status }),

  // Get detail lowongan
  getById: (id: string) =>
    api.get<Internship>(`/internships/${id}`),

  // Get semua lowongan (publik)
  getAll: () =>
    api.get<Internship[]>('/internships'),

  // Get daftar lokasi
  getLocations: () =>
    api.get<MasterLocation[]>('/internships/locations'),

  // Get daftar jurusan
  getMajors: () =>
    api.get<{ id: string; name: string }[]>('/internships/majors'),
}
