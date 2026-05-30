import api from './api'
import type { AuthResponse, User } from '../types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }),

  getProfile: () =>
    api.get<User>('/auth/profile'),

  updateProfile: (data: {
    name?: string
    email?: string
    password?: string
    phone?: string
    address?: string
    education?: string
    institution?: string
    profileImage?: string
  }) => api.put<{ message: string; user: User }>('/auth/profile', data),

  logout: () =>
    api.post<{ message: string }>('/auth/logout'),

  requestMitra: (companyName: string, companyDesc?: string) =>
    api.post<{ message: string }>('/auth/request-mitra', { companyName, companyDesc }),
}
