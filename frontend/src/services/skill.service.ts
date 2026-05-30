import api from './api'
import type { Skill, UserSkill } from '../types'

export const skillService = {
  // Get semua master skill (public)
  getAll: () =>
    api.get<Skill[]>('/skills'),

  // Deklarasi 1 skill untuk user
  declare: (skillId: string, proficiency?: string) =>
    api.post<{ message: string; data: UserSkill }>('/skills/declare', { skillId, proficiency }),

  // Get skill milik user saat ini
  getMySkills: () =>
    api.get<UserSkill[]>('/skills/my-skills'),

  // Sync batch skill (replace semua skill user)
  sync: (skillIds: string[]) =>
    api.post<{ message: string; count: number }>('/skills/sync', { skillIds }),

  // Hapus 1 skill dari user
  delete: (skillId: string) =>
    api.delete<{ message: string }>(`/skills/${skillId}`),
}
