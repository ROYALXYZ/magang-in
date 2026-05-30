import api from './api'
import type { AdminUser, Internship } from '../types'

export interface AdminStats {
  totalUsers: number
  totalMitra: number
  totalInternships: number
  totalApplications: number
  pendingApplications: number
  pendingMitraRequests?: number
}

export interface AdminInternship extends Internship {
  mitra: { name: string; email: string }
  _count: { applications: number }
}

export const adminService = {
  // === STATS ===
  getStats: () =>
    api.get<AdminStats>('/admin/stats'),

  getActivity: () =>
    api.get<{ type: string; text: string; time: string }[]>('/admin/activity'),

  getUserTrend: () =>
    api.get<{ day: string; count: number; date: string }[]>('/admin/trend/users'),

  getMonthlyGrowth: () =>
    api.get<{ month: string; newUsers: number; newInternships: number }[]>('/admin/report/monthly-growth'),

  getTopIndustries: () =>
    api.get<{ name: string; count: number; percentage: number }[]>('/admin/report/top-industries'),

  getApplicationInsights: () =>
    api.get<{ newApplicants: number; totalMatches: number; matchRate: number; totalApplications: number }>('/admin/report/application-insights'),

  // === USER MANAGEMENT ===
  getAllUsers: () =>
    api.get<AdminUser[]>('/admin/users'),

  updateUser: (id: string, data: {
    name?: string
    email?: string
    role?: string
    password?: string
  }) => api.put<{ message: string; user: AdminUser }>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<{ message: string }>(`/admin/users/${id}`),

  // === MITRA VERIFICATION ===
  getPendingMitra: () =>
    api.get<any[]>('/admin/mitra'),

  approveMitra: (id: string) =>
    api.post<{ message: string }>(`/admin/mitra/${id}/approve`),

  rejectMitra: (id: string) =>
    api.post<{ message: string }>(`/admin/mitra/${id}/reject`),

  // === INTERNSHIP MANAGEMENT ===
  getAllInternships: () =>
    api.get<AdminInternship[]>('/admin/internships'),

  toggleInternshipStatus: (id: string, isClosed: boolean) =>
    api.patch<{ message: string }>(`/admin/internships/${id}/status`, { isClosed }),

  // === ARTICLE MANAGEMENT ===
  createArticle: (data: {
    title: string
    content: string
    thumbnailUrl?: string
  }) => api.post<any>('/admin/articles', data),

  deleteArticle: (id: string) =>
    api.delete<{ message: string }>(`/admin/articles/${id}`),
}
