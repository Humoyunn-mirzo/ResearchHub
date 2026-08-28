'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApplications, fetchProjects } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import Link from 'next/link'
import { BookOpen, FileText, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from '@/lib/i18n'

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const { data: applications } = useQuery({
    queryKey: ['applications', 'my', user?.id],
    queryFn: () =>
      fetchApplications(user?.id ? { studentId: user.id, limit: 50 } : {}),
    enabled: !!user?.id,
  })

  const {
    data: projects,
    error: projectsError,
    refetch: refetchProjects,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', 'open'],
    queryFn: () => fetchProjects({ status: 'OPEN', limit: 6 }),
  })

  const stats = {
    pending: applications?.data.filter((a) => a.status === 'PENDING').length || 0,
    accepted: applications?.data.filter((a) => a.status === 'ACCEPTED').length || 0,
    total: applications?.data.length || 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{t('student.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('dashboard.welcomeBack', { name: user?.name ?? '' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('student.totalApplications')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('student.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('student.accepted')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Applications */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">{t('student.myApplications')}</h2>
        {applications && applications.data.length > 0 ? (
          <div className="space-y-4">
            {applications.data.slice(0, 5).map((application) => (
              <Card key={application.id}>
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex-1">
                    <h3 className="font-semibold">{application.project?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('student.appliedOn', {
                        date: format(new Date(application.createdAt), 'MMM d, yyyy'),
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      application.status === 'ACCEPTED'
                        ? 'default'
                        : application.status === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {application.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('student.noApplications')}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('student.availableProjects')}</h2>
          <Link href="/projects">
            <Button variant="outline">{t('common.viewAll')}</Button>
          </Link>
        </div>
        {isProjectsError && (
          <Card className="mb-4 border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">
                {t('student.loadProjectsFailed')}{' '}
                {projectsError instanceof Error ? projectsError.message : t('student.tryAgain')}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchProjects()}>
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        )}
        {projects && projects.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((project) => (
              <Card key={project.id} className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <Link href={`/projects/${project.id}`} className="mt-4 block">
                    <Button variant="outline" className="w-full">
                      {t('common.viewDetails')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('student.noProjects')}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
