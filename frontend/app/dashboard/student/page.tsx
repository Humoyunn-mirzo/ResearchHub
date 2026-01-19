'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApplications, fetchProjects } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import Link from 'next/link'
import { BookOpen, FileText, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: applications } = useQuery({
    queryKey: ['applications', 'my'],
    queryFn: () => fetchApplications({ studentId: user?.id || '' }),
    enabled: !!user,
  })

  const { data: projects } = useQuery({
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
        <h1 className="text-4xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Applications */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">My Applications</h2>
        {applications && applications.data.length > 0 ? (
          <div className="space-y-4">
            {applications.data.slice(0, 5).map((application) => (
              <Card key={application.id}>
                <CardContent className="flex items-center justify-between pt-6">
                  <div className="flex-1">
                    <h3 className="font-semibold">{application.project?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
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
              You haven&apos;t applied to any projects yet
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommended Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Available Projects</h2>
          <Link href="/projects">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        {projects && projects.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <Link href={`/projects/${project.id}`} className="mt-4 block">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No projects available
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
