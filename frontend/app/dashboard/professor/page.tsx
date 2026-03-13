'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, fetchApplications } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import Link from 'next/link'
import { BookOpen, Users, FileText, Plus, History, AlertCircle } from 'lucide-react'

export default function ProfessorDashboard() {
  const { user } = useAuthStore()
  const isPending = user?.role === 'PROFESSOR' && user?.professorStatus === 'PENDING'

  const {
    data: myProjects,
    error: projectsError,
    refetch: refetchProjects,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', 'my', user?.id],
    queryFn: () =>
      fetchProjects(user?.id ? { professorId: user.id, limit: 50 } : {}),
    enabled: !!user?.id && !isPending,
  })

  const { data: applications } = useQuery({
    queryKey: ['applications', 'for-my-projects', user?.id],
    queryFn: () => fetchApplications({ myProjects: true, limit: 100 }),
    enabled: !!user?.id && !isPending,
  })

  const myApplications = applications?.data ?? []
  const pendingApplications = myApplications.filter((a) => a.status === 'PENDING').length

  const activeProjects = myProjects?.data.filter((p) => p.status === 'OPEN') ?? []
  const pastProjects = myProjects?.data.filter((p) => p.status === 'CLOSED') ?? []

  const stats = {
    totalProjects: myProjects?.data.length || 0,
    openProjects: activeProjects.length,
    pastProjects: pastProjects.length,
    pendingApplications,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {isPending && (
        <Card className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500/30">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Your account is pending approval. An admin will review your CV and approve your account. You can view the dashboard but cannot create projects or manage applications until you are approved.
            </p>
          </CardContent>
        </Card>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Professor Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        {!isPending && (
          <Link href="/dashboard/professor/projects/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Active Research</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research History</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pastProjects}</div>
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

      {/* Active Research */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Active Research</h2>
        {isProjectsError && (
          <Card className="mb-4 border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">
                Failed to load projects. {projectsError instanceof Error ? projectsError.message : 'Please try again.'}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchProjects()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        {activeProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeProjects.map((project) => (
              <Card key={project.id} className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <Badge variant="default">Open</Badge>
                  </div>
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
                    {!isPending && (
                      <Link
                        href={`/dashboard/professor/projects/${project.id}/applications`}
                        className="flex-1"
                      >
                        <Button className="w-full">Applications</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isProjectsError && myProjects ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">No active projects. {!isPending && 'Create one or '}view your research history below.</p>
              {!isPending && (
                <Link href="/dashboard/professor/projects/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Research History (past/closed projects remain in account) */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold flex items-center gap-2">
          <History className="h-6 w-6" />
          Research History
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Your previous research projects stay in your account for reference.
        </p>
        {pastProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {pastProjects.map((project) => (
              <Card key={project.id} className="transition-all duration-200 ease-out hover:shadow-md border-muted">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                    <Badge variant="secondary">Closed</Badge>
                  </div>
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
                    {!isPending && (
                      <Link
                        href={`/dashboard/professor/projects/${project.id}/applications`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">Applications</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No past projects yet. Closed projects will appear here and remain in your account.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
