"use client"

import { GrowthData, Skill, Goal, Achievement } from './types'
import { generateId } from './utils'

const STORAGE_KEY = 'growth-journey-data'

const defaultData: GrowthData = {
  skills: [],
  goals: [],
  achievements: [],
  isPublic: false,
  userName: 'Growth Explorer',
}

export function loadData(): GrowthData {
  if (typeof window === 'undefined') return defaultData
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
  return defaultData
}

export function saveData(data: GrowthData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save data:', error)
  }
}

export function addSkill(data: GrowthData, skill: Omit<Skill, 'id' | 'createdAt' | 'history'>): GrowthData {
  const newSkill: Skill = {
    ...skill,
    id: generateId(),
    createdAt: new Date().toISOString(),
    history: [{ date: new Date().toISOString(), level: skill.currentLevel }],
  }
  const newData = { ...data, skills: [...data.skills, newSkill] }
  saveData(newData)
  return newData
}

export function updateSkillLevel(data: GrowthData, skillId: string, newLevel: number): GrowthData {
  const newData = {
    ...data,
    skills: data.skills.map(skill => 
      skill.id === skillId 
        ? {
            ...skill,
            currentLevel: newLevel,
            history: [...skill.history, { date: new Date().toISOString(), level: newLevel }],
          }
        : skill
    ),
  }
  saveData(newData)
  return newData
}

export function deleteSkill(data: GrowthData, skillId: string): GrowthData {
  const newData = { ...data, skills: data.skills.filter(s => s.id !== skillId) }
  saveData(newData)
  return newData
}

export function addGoal(data: GrowthData, goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>): GrowthData {
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    createdAt: new Date().toISOString(),
    completed: false,
  }
  const newData = { ...data, goals: [...data.goals, newGoal] }
  saveData(newData)
  return newData
}

export function toggleGoalComplete(data: GrowthData, goalId: string): GrowthData {
  const newData = {
    ...data,
    goals: data.goals.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date().toISOString() : undefined,
          }
        : goal
    ),
  }
  saveData(newData)
  return newData
}

export function deleteGoal(data: GrowthData, goalId: string): GrowthData {
  const newData = { ...data, goals: data.goals.filter(g => g.id !== goalId) }
  saveData(newData)
  return newData
}

export function addAchievement(data: GrowthData, achievement: Omit<Achievement, 'id'>): GrowthData {
  const newAchievement: Achievement = {
    ...achievement,
    id: generateId(),
  }
  const newData = { ...data, achievements: [newAchievement, ...data.achievements] }
  saveData(newData)
  return newData
}

export function deleteAchievement(data: GrowthData, achievementId: string): GrowthData {
  const newData = { ...data, achievements: data.achievements.filter(a => a.id !== achievementId) }
  saveData(newData)
  return newData
}

export function updateSettings(data: GrowthData, settings: { isPublic?: boolean; userName?: string }): GrowthData {
  const newData = { ...data, ...settings }
  saveData(newData)
  return newData
}
