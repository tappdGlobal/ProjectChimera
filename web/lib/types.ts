export interface Skill {
  id: string
  name: string
  category: string
  currentLevel: number
  targetLevel: number
  createdAt: string
  history: { date: string; level: number }[]
}

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  category: 'milestone' | 'win' | 'learning'
}

export interface GrowthData {
  skills: Skill[]
  goals: Goal[]
  achievements: Achievement[]
  isPublic: boolean
  userName: string
}

export const SKILL_CATEGORIES = [
  'Technical',
  'Creative',
  'Leadership',
  'Communication',
  'Personal',
  'Health',
] as const

export const ACHIEVEMENT_CATEGORIES = [
  { value: 'milestone', label: 'Milestone', emoji: '🏆' },
  { value: 'win', label: 'Win', emoji: '⭐' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
] as const
