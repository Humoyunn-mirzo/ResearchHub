'use client'

import { useState } from 'react'
import { Card, CardContent, Badge } from '@/components/ui'
import { Trophy, Medal, Award, GraduationCap, Users, BookOpen, Building2 } from 'lucide-react'

type RankingCategory = 'students' | 'professors' | 'projects' | 'universities'

export default function RankingsPage() {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>('students')

  // Mock data - replace with actual API calls
  const mockStudents = [
    { id: 1, name: 'Alice Johnson', university: 'MIT', projects: 5, points: 120 },
    { id: 2, name: 'Bob Smith', university: 'Stanford', projects: 4, points: 95 },
    { id: 3, name: 'Carol Williams', university: 'Harvard', projects: 4, points: 88 },
    { id: 4, name: 'David Brown', university: 'UC Berkeley', projects: 3, points: 75 },
    { id: 5, name: 'Emma Davis', university: 'Yale', projects: 3, points: 70 },
  ]

  const mockProfessors = [
    { id: 1, name: 'Dr. Sarah Chen', affiliation: 'MIT - Computer Science', projects: 8, students: 30 },
    { id: 2, name: 'Prof. Michael Lee', affiliation: 'Stanford - Biology', projects: 7, students: 25 },
    { id: 3, name: 'Dr. Jennifer Park', affiliation: 'Harvard - Physics', projects: 6, students: 22 },
    { id: 4, name: 'Prof. Robert Kim', affiliation: 'UC Berkeley - Engineering', projects: 5, students: 18 },
    { id: 5, name: 'Dr. Lisa Anderson', affiliation: 'Yale - Chemistry', projects: 5, students: 16 },
  ]

  const mockProjects = [
    { id: 1, title: 'AI for Climate Change', professor: 'Dr. Sarah Chen', applicants: 45 },
    { id: 2, title: 'Quantum Computing Research', professor: 'Prof. Michael Lee', applicants: 38 },
    { id: 3, title: 'Biomedical Engineering', professor: 'Dr. Jennifer Park', applicants: 32 },
    { id: 4, title: 'Renewable Energy Systems', professor: 'Prof. Robert Kim', applicants: 28 },
    { id: 5, title: 'Data Science Applications', professor: 'Dr. Lisa Anderson', applicants: 25 },
  ]

  const mockUniversities = [
    { id: 1, name: 'MIT', projects: 45, users: 320 },
    { id: 2, name: 'Stanford', projects: 42, users: 295 },
    { id: 3, name: 'Harvard', projects: 38, users: 280 },
    { id: 4, name: 'UC Berkeley', projects: 35, users: 265 },
    { id: 5, name: 'Yale', projects: 32, users: 240 },
  ]

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="flex h-6 w-6 items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>
  }

  const categories = [
    { id: 'students' as RankingCategory, label: 'Top Students', icon: GraduationCap },
    { id: 'professors' as RankingCategory, label: 'Top Professors', icon: Users },
    { id: 'projects' as RankingCategory, label: 'Top Projects', icon: BookOpen },
    { id: 'universities' as RankingCategory, label: 'Top Universities', icon: Building2 },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Rankings</h1>
        <p className="mt-2 text-muted-foreground">
          Top performers and active contributors in the research community
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  activeCategory === category.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-muted-foreground/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {activeCategory === 'students' && (
          <>
            {mockStudents.map((student, index) => (
              <Card key={student.id} className={index < 3 ? 'border-primary/50' : ''}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.university}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Projects: </span>
                      <span className="font-semibold">{student.projects}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Points: </span>
                      <span className="font-semibold">{student.points}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeCategory === 'professors' && (
          <>
            {mockProfessors.map((professor, index) => (
              <Card key={professor.id} className={index < 3 ? 'border-primary/50' : ''}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{professor.name}</h3>
                    <p className="text-sm text-muted-foreground">{professor.affiliation}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Projects: </span>
                      <span className="font-semibold">{professor.projects}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Students: </span>
                      <span className="font-semibold">{professor.students}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeCategory === 'projects' && (
          <>
            {mockProjects.map((project, index) => (
              <Card key={project.id} className={index < 3 ? 'border-primary/50' : ''}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">by {project.professor}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Applicants: </span>
                    <span className="font-semibold">{project.applicants}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeCategory === 'universities' && (
          <>
            {mockUniversities.map((university, index) => (
              <Card key={university.id} className={index < 3 ? 'border-primary/50' : ''}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{university.name}</h3>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Projects: </span>
                      <span className="font-semibold">{university.projects}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Users: </span>
                      <span className="font-semibold">{university.users}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {mockStudents.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Rankings will appear once there&apos;s activity.</p>
        </div>
      )}
    </div>
  )
}
