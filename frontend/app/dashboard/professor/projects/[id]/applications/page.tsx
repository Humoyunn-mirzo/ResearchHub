'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchProjectById, fetchApplications } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import Link from 'next/link'
import { ArrowLeft, LayoutDashboard, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useEffect } from 'react'

export default function ProjectApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const projectId = params.id as string

  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectById(projectId),
  })

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', projectId],
    queryFn: () => fetchApplications({ projectId, limit: 100 }),
    enabled: !!projectId,
  })

  const applications = applicationsData?.data ?? []
  const isOwner = isAuthenticated && user?.role === 'PROFESSOR' && project?.professorId === user?.id

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'PROFESSOR') {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, user?.role, router])

  if (projectLoading || !project) {
    if (projectError) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
            Failed to load project
          </div>
          <Link href="/dashboard/professor">
            <Button variant="outline" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
          You do not have permission to view applications for this project.
        </div>
        <Link href="/dashboard/professor">
          <Button variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to project
            </Button>
          </Link>
          <Link href="/dashboard/professor">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
        <p className="mt-2 text-muted-foreground">
          Applications for this research project
        </p>
      </div>

      {appsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : applications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {app.student?.name ?? 'Unknown student'}
                    </div>
                    {app.student?.email && (
                      <div className="text-sm text-muted-foreground">{app.student.email}</div>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                      Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.status === 'ACCEPTED'
                        ? 'default'
                        : app.status === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Applications will appear here when students apply to this project.
            </p>
            <Link href={`/projects/${projectId}`}>
              <Button variant="outline" className="mt-4">
                View project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
