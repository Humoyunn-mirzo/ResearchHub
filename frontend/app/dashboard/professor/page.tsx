'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, fetchApplications, fetchProfessorById } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { ProfessorProfileCard } from '@/components/professor/professor-profile-card'
import Link from 'next/link'
import { BookOpen, Users, FileText, Plus, History, AlertCircle } from 'lucide-react'

export default function ProfessorDashboard() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const isPending = user?.role === 'PROFESSOR' && user?.professorStatus === 'PENDING'

  const { data: professor } = useQuery({
    queryKey: ['professor', user?.id],
    queryFn: () => fetchProfessorById(user!.id),
    enabled: !!user?.id && user?.role === 'PROFESSOR',
  })

  const {
    data: myProjects,
    error: projectsError,
    refetch: refetchProjects,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', 'my', user?.id],
    queryFn: () => fetchProjects(user?.id ? { professorId: user.id, limit: 50 } : {}),
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
        <Card className="mb-6 border-amber-500/50 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {t('professor.pendingNotice')}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{t('professor.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('dashboard.welcomeBack', { name: user?.name ?? '' })}
          </p>
        </div>
        {!isPending && (
          <Link href="/dashboard/professor/projects/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {t('professor.createProject')}
            </Button>
          </Link>
        )}
      </div>

      {/* Profile summary */}
      {professor && <ProfessorProfileCard professor={professor} />}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('professor.totalProjects')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('professor.activeResearch')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('professor.researchHistory')}</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pastProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('professor.pendingApplications')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Research */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('professor.activeResearch')}</h2>
        {isProjectsError && (
          <Card className="mb-4 border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">
                {t('professor.loadProjectsFailed')}{' '}
                {projectsError instanceof Error ? projectsError.message : t('professor.tryAgain')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetchProjects()}
              >
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        )}
        {activeProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeProjects.map((project) => (
              <Card
                key={project.id}
                className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <Badge variant="default">{t('projects.statusOpen')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t('professor.view')}
                      </Button>
                    </Link>
                    {!isPending && (
                      <Link
                        href={`/dashboard/professor/projects/${project.id}/applications`}
                        className="flex-1"
                      >
                        <Button className="w-full">{t('professor.applications')}</Button>
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
              <p className="mb-4 text-muted-foreground">
                {t('professor.noActiveProjects')}{' '}
                {!isPending && t('professor.noActiveProjectsHint')}
              </p>
              {!isPending && (
                <Link href="/dashboard/professor/projects/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('professor.createNewProject')}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Research History (past/closed projects remain in account) */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <History className="h-6 w-6" />
          {t('professor.researchHistory')}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">{t('professor.historyHint')}</p>
        {pastProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {pastProjects.map((project) => (
              <Card
                key={project.id}
                className="border-muted transition-all duration-200 ease-out hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                    <Badge variant="secondary">{t('projects.statusClosed')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t('professor.view')}
                      </Button>
                    </Link>
                    {!isPending && (
                      <Link
                        href={`/dashboard/professor/projects/${project.id}/applications`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          {t('professor.applications')}
                        </Button>
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
              <p className="text-muted-foreground">{t('professor.noPastProjects')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
