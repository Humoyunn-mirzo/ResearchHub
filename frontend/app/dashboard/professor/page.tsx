'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, fetchApplications } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import Link from 'next/link'
import { BookOpen, Users, FileText, Plus } from 'lucide-react'

export default function ProfessorDashboard() {
  const { user } = useAuthStore()

  const { data: myProjects } = useQuery({
    queryKey: ['projects', 'my'],
    queryFn: () => fetchProjects({ professorId: user?.id || '' }),
    enabled: !!user,
  })

  const { data: applications } = useQuery({
    queryKey: ['applications', 'for-my-projects'],
    queryFn: () => fetchApplications({ limit: 100 }),
    enabled: !!user,
  })

  const myProjectIds = new Set(myProjects?.data.map((p) => p.id) ?? [])
  const myApplications = applications?.data.filter((a) => myProjectIds.has(a.projectId)) ?? []
  const pendingApplications = myApplications.filter((a) => a.status === 'PENDING').length

  const stats = {
    totalProjects: myProjects?.data.length || 0,
    openProjects: myProjects?.data.filter((p) => p.status === 'OPEN').length || 0,
    pendingApplications,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Professor Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Link href="/dashboard/professor/projects/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Projects */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">My Projects</h2>
        {myProjects && myProjects.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {myProjects.data.map((project) => (
              <Card key={project.id} className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/professor/projects/${project.id}/applications`}
                      className="flex-1"
                    >
                      <Button className="w-full">Applications</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">You haven&apos;t created any projects yet</p>
              <Link href="/dashboard/professor/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
