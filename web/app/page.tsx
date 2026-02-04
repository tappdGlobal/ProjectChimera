"use client"

import React, { useState, useEffect } from 'react'
import { 
  Target, Trophy, Sparkles, Calendar, Plus, X, Check, 
  TrendingUp, Star, BookOpen, Settings, Eye, EyeOff,
  ChevronRight, Trash2, Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, getDaysRemaining } from '@/lib/utils'
import { 
  GrowthData, Skill, Goal, Achievement, 
  SKILL_CATEGORIES, ACHIEVEMENT_CATEGORIES 
} from '@/lib/types'
import {
  loadData, saveData, addSkill, updateSkillLevel, deleteSkill,
  addGoal, toggleGoalComplete, deleteGoal,
  addAchievement, deleteAchievement, updateSettings
} from '@/lib/storage'

type TabType = 'overview' | 'skills' | 'goals' | 'achievements' | 'review'

export default function GrowthJourney() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [data, setData] = useState<GrowthData | null>(null)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddAchievement, setShowAddAchievement] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setData(loadData())
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your journey...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'skills', label: 'Skills', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'review', label: 'Year Review', icon: Calendar },
  ] as const

  const completedGoals = data.goals.filter(g => g.completed).length
  const totalGoals = data.goals.length
  const averageSkillProgress = data.skills.length > 0
    ? Math.round(data.skills.reduce((acc, s) => acc + (s.currentLevel / s.targetLevel) * 100, 0) / data.skills.length)
    : 0

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Growth Journey</h1>
                <p className="text-xs text-muted-foreground">{data.userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={data.isPublic ? 'success' : 'secondary'}>
                {data.isPublic ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                {data.isPublic ? 'Public' : 'Private'}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <OverviewSection 
            data={data} 
            completedGoals={completedGoals}
            totalGoals={totalGoals}
            averageSkillProgress={averageSkillProgress}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'skills' && (
          <SkillsSection 
            data={data} 
            setData={setData}
            showAdd={showAddSkill}
            setShowAdd={setShowAddSkill}
          />
        )}
        {activeTab === 'goals' && (
          <GoalsSection 
            data={data} 
            setData={setData}
            showAdd={showAddGoal}
            setShowAdd={setShowAddGoal}
          />
        )}
        {activeTab === 'achievements' && (
          <AchievementsSection 
            data={data} 
            setData={setData}
            showAdd={showAddAchievement}
            setShowAdd={setShowAddAchievement}
          />
        )}
        {activeTab === 'review' && (
          <YearReviewSection data={data} />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          data={data} 
          setData={setData} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </main>
  )
}

// Overview Section
function OverviewSection({ 
  data, 
  completedGoals, 
  totalGoals, 
  averageSkillProgress,
  onNavigate 
}: { 
  data: GrowthData
  completedGoals: number
  totalGoals: number
  averageSkillProgress: number
  onNavigate: (tab: TabType) => void
}) {
  const recentAchievements = data.achievements.slice(0, 3)
  const upcomingGoals = data.goals
    .filter(g => !g.completed)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills Tracked</p>
                <p className="text-3xl font-bold text-gradient">{data.skills.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress value={averageSkillProgress} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-2">{averageSkillProgress}% avg. progress</p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goals Completed</p>
                <p className="text-3xl font-bold text-success">{completedGoals}/{totalGoals}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
            <Progress value={totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0} color="success" className="mt-4" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-3xl font-bold text-gradient-accent">{data.achievements.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {ACHIEVEMENT_CATEGORIES.map(cat => {
                const count = data.achievements.filter(a => a.category === cat.value).length
                return (
                  <Badge key={cat.value} variant="secondary" className="text-xs">
                    {cat.emoji} {count}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Goals</CardTitle>
              <CardDescription>Stay focused on what matters</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('goals')}>
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming goals. Add one to get started!</p>
            ) : (
              <div className="space-y-3">
                {upcomingGoals.map(goal => {
                  const daysLeft = getDaysRemaining(goal.targetDate)
                  return (
                    <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold",
                        daysLeft <= 7 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                      )}>
                        {daysLeft}d
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">Due {formatDate(new Date(goal.targetDate))}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Wins</CardTitle>
              <CardDescription>Celebrate your progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('achievements')}>
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No achievements yet. Log your first win!</p>
            ) : (
              <div className="space-y-3">
                {recentAchievements.map(achievement => {
                  const category = ACHIEVEMENT_CATEGORIES.find(c => c.value === achievement.category)
                  return (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-lg">
                        {category?.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(new Date(achievement.date))}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Skills Section
function SkillsSection({ 
  data, 
  setData, 
  showAdd, 
  setShowAdd 
}: { 
  data: GrowthData
  setData: (d: GrowthData) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
}) {
  const [newSkill, setNewSkill] = useState({ name: '', category: SKILL_CATEGORIES[0], currentLevel: 1, targetLevel: 10 })
  const [editingSkill, setEditingSkill] = useState<string | null>(null)

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setData(addSkill(data, newSkill))
      setNewSkill({ name: '', category: SKILL_CATEGORIES[0], currentLevel: 1, targetLevel: 10 })
      setShowAdd(false)
    }
  }

  const handleUpdateLevel = (skillId: string, level: number) => {
    setData(updateSkillLevel(data, skillId, level))
    setEditingSkill(null)
  }

  const handleDeleteSkill = (skillId: string) => {
    setData(deleteSkill(data, skillId))
  }

  const groupedSkills = SKILL_CATEGORIES.reduce((acc, category) => {
    const skills = data.skills.filter(s => s.category === category)
    if (skills.length > 0) acc[category] = skills
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills</h2>
          <p className="text-muted-foreground">Track your learning progress</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Skill
        </Button>
      </div>

      {/* Add Skill Form */}
      {showAdd && (
        <Card className="border-primary/30 glow-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add New Skill</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Skill Name</label>
                <Input
                  placeholder="e.g., TypeScript, Public Speaking"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                >
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Current Level (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newSkill.currentLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, currentLevel: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Target Level (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newSkill.targetLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, targetLevel: Math.min(10, Math.max(1, parseInt(e.target.value) || 10)) })}
                />
              </div>
            </div>
            <Button onClick={handleAddSkill} className="mt-4 w-full">Add Skill</Button>
          </CardContent>
        </Card>
      )}

      {/* Skills List */}
      {Object.keys(groupedSkills).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No skills tracked yet</p>
            <Button variant="link" onClick={() => setShowAdd(true)}>Add your first skill</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map(skill => (
                  <Card key={skill.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{skill.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Started {formatDate(new Date(skill.createdAt))}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingSkill(editingSkill === skill.id ? null : skill.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteSkill(skill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Progress 
                        value={skill.currentLevel} 
                        max={skill.targetLevel} 
                        showLabel 
                      />
                      
                      {editingSkill === skill.id && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <label className="text-sm text-muted-foreground mb-2 block">Update Level</label>
                          <div className="flex gap-2">
                            {[...Array(10)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => handleUpdateLevel(skill.id, i + 1)}
                                className={cn(
                                  "h-8 w-8 rounded-lg text-sm font-medium transition-all",
                                  i + 1 <= skill.currentLevel
                                    ? "gradient-primary text-primary-foreground"
                                    : "bg-secondary hover:bg-secondary/80"
                                )}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Goals Section
function GoalsSection({ 
  data, 
  setData, 
  showAdd, 
  setShowAdd 
}: { 
  data: GrowthData
  setData: (d: GrowthData) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
}) {
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' })
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const dateInputRef = React.useRef<HTMLInputElement>(null)

  const handleAddGoal = () => {
    const dateValue = dateInputRef.current?.value || newGoal.targetDate
    if (newGoal.title.trim() && dateValue) {
      setData(addGoal(data, { ...newGoal, targetDate: dateValue }))
      setNewGoal({ title: '', description: '', targetDate: '' })
      if (dateInputRef.current) dateInputRef.current.value = ''
      setShowAdd(false)
    }
  }

  const filteredGoals = data.goals.filter(goal => {
    if (filter === 'active') return !goal.completed
    if (filter === 'completed') return goal.completed
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-muted-foreground">Set targets and track completion</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {showAdd && (
        <Card className="border-primary/30 glow-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add New Goal</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Goal Title</label>
                <Input
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description (optional)</label>
                <Input
                  placeholder="Add more details..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Target Date</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  defaultValue={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddGoal} className="mt-4 w-full">Add Goal</Button>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              filter === f
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No goals found</p>
            <Button variant="link" onClick={() => setShowAdd(true)}>Add your first goal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map(goal => {
            const daysLeft = getDaysRemaining(goal.targetDate)
            const isOverdue = daysLeft < 0 && !goal.completed
            
            return (
              <Card 
                key={goal.id} 
                className={cn(
                  "group transition-all",
                  goal.completed && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => setData(toggleGoalComplete(data, goal.id))}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                        goal.completed
                          ? "bg-success border-success text-success-foreground"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {goal.completed && <Check className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={cn(
                            "font-semibold",
                            goal.completed && "line-through text-muted-foreground"
                          )}>
                            {goal.title}
                          </h4>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive shrink-0"
                          onClick={() => setData(deleteGoal(data, goal.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={isOverdue ? 'destructive' : goal.completed ? 'success' : 'secondary'}>
                          {goal.completed 
                            ? `Completed ${formatDate(new Date(goal.completedAt!))}`
                            : isOverdue
                              ? `${Math.abs(daysLeft)} days overdue`
                              : `${daysLeft} days left`
                          }
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Due {formatDate(new Date(goal.targetDate))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Achievements Section
function AchievementsSection({ 
  data, 
  setData, 
  showAdd, 
  setShowAdd 
}: { 
  data: GrowthData
  setData: (d: GrowthData) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
}) {
  const [newAchievement, setNewAchievement] = useState({ 
    title: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    category: 'win' as Achievement['category']
  })

  const handleAddAchievement = () => {
    if (newAchievement.title.trim()) {
      setData(addAchievement(data, newAchievement))
      setNewAchievement({ 
        title: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0],
        category: 'win'
      })
      setShowAdd(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-muted-foreground">Log your wins and milestones</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Log Achievement
        </Button>
      </div>

      {/* Add Achievement Form */}
      {showAdd && (
        <Card className="border-accent/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Log New Achievement</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">What did you achieve?</label>
                <Input
                  placeholder="e.g., Launched my first website"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Details (optional)</label>
                <Input
                  placeholder="Add more context..."
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={newAchievement.date}
                    onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                  <div className="flex gap-2">
                    {ACHIEVEMENT_CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setNewAchievement({ ...newAchievement, category: cat.value as Achievement['category'] })}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          newAchievement.category === cat.value
                            ? "bg-accent/20 border border-accent text-accent"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        {cat.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleAddAchievement} variant="accent" className="mt-4 w-full">Log Achievement</Button>
          </CardContent>
        </Card>
      )}

      {/* Achievements List */}
      {data.achievements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No achievements logged yet</p>
            <Button variant="link" onClick={() => setShowAdd(true)}>Log your first win</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.achievements.map((achievement, index) => {
            const category = ACHIEVEMENT_CATEGORIES.find(c => c.value === achievement.category)
            return (
              <Card 
                key={achievement.id} 
                className="group animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl shrink-0">
                      {category?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{achievement.title}</h4>
                          {achievement.description && (
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive shrink-0"
                          onClick={() => setData(deleteAchievement(data, achievement.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="accent">{category?.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(new Date(achievement.date))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Year Review Section
function YearReviewSection({ data }: { data: GrowthData }) {
  const currentYear = new Date().getFullYear()
  
  const yearAchievements = data.achievements.filter(a => 
    new Date(a.date).getFullYear() === currentYear
  )
  
  const yearGoalsCompleted = data.goals.filter(g => 
    g.completed && g.completedAt && new Date(g.completedAt).getFullYear() === currentYear
  )
  
  const skillsGrowth = data.skills.map(skill => {
    const yearHistory = skill.history.filter(h => new Date(h.date).getFullYear() === currentYear)
    if (yearHistory.length < 2) return { ...skill, growth: 0 }
    const growth = yearHistory[yearHistory.length - 1].level - yearHistory[0].level
    return { ...skill, growth }
  }).filter(s => s.growth > 0)

  const totalGrowthPoints = skillsGrowth.reduce((acc, s) => acc + s.growth, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">{currentYear} Year in Review</h2>
        <p className="text-muted-foreground">A summary of your growth journey this year</p>
      </div>

      {/* Year Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <Trophy className="h-8 w-8 mx-auto text-accent mb-2" />
            <p className="text-3xl font-bold text-gradient-accent">{yearAchievements.length}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <Target className="h-8 w-8 mx-auto text-success mb-2" />
            <p className="text-3xl font-bold text-success">{yearGoalsCompleted.length}</p>
            <p className="text-sm text-muted-foreground">Goals Completed</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-gradient">{skillsGrowth.length}</p>
            <p className="text-sm text-muted-foreground">Skills Improved</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <Star className="h-8 w-8 mx-auto text-accent mb-2" />
            <p className="text-3xl font-bold text-gradient-accent">+{totalGrowthPoints}</p>
            <p className="text-sm text-muted-foreground">Levels Gained</p>
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Top Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yearAchievements.length === 0 ? (
              <p className="text-muted-foreground text-sm">No achievements this year yet</p>
            ) : (
              <div className="space-y-3">
                {yearAchievements.slice(0, 5).map(achievement => {
                  const category = ACHIEVEMENT_CATEGORIES.find(c => c.value === achievement.category)
                  return (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <span className="text-lg">{category?.emoji}</span>
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(new Date(achievement.date))}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Goals Crushed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yearGoalsCompleted.length === 0 ? (
              <p className="text-muted-foreground text-sm">No goals completed this year yet</p>
            ) : (
              <div className="space-y-3">
                {yearGoalsCompleted.slice(0, 5).map(goal => (
                  <div key={goal.id} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {formatDate(new Date(goal.completedAt!))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills Growth */}
      {skillsGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Skills Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillsGrowth.map(skill => (
                <div key={skill.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="default">+{skill.growth} levels</Badge>
                  </div>
                  <Progress value={skill.currentLevel} max={skill.targetLevel} showLabel />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="gradient-card border-primary/20 glow-primary">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-bold text-gradient mb-2">Keep Growing!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Every step forward, no matter how small, is progress. 
            Your journey is unique, and you are building something amazing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Modal
function SettingsModal({ 
  data, 
  setData, 
  onClose 
}: { 
  data: GrowthData
  setData: (d: GrowthData) => void
  onClose: () => void 
}) {
  const [userName, setUserName] = useState(data.userName)
  const [isPublic, setIsPublic] = useState(data.isPublic)

  const handleSave = () => {
    setData(updateSettings(data, { userName, isPublic }))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Customize your growth journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Portfolio Visibility</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPublic(false)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  !isPublic
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                )}
              >
                <EyeOff className="h-4 w-4" /> Private
              </button>
              <button
                onClick={() => setIsPublic(true)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  isPublic
                    ? "bg-success text-success-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                )}
              >
                <Eye className="h-4 w-4" /> Public
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isPublic 
                ? "Your growth journey will be visible to others as a portfolio"
                : "Your data stays private and only visible to you"
              }
            </p>
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  )
}
