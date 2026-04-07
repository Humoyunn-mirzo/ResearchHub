'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchProfessorById, fetchProjects } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ArrowLeft, BookOpen, Mail, User, TrendingUp, GraduationCap, MessageCircle } from 'lucide-react'
import { ProjectCard } from '@/components/shared/project-card'

export default function ProfessorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const id = params.id as string
  const canMessageProfessor = isAuthenticated && user?.role === 'STUDENT'

  const { data: professor, isLoading, error } = useQuery({
    queryKey: ['professor', id],
    queryFn: () => fetchProfessorById(id),
    enabled: !!id,
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'professor', id, 'all'],
    queryFn: () => fetchProjects({ professorId: id, limit: 48 }),
    enabled: !!id && !!professor,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-40 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !professor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <Link href="/projects">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Button>
        </Link>
        <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-medium">Could not load this professor profile.</p>
          <p className="mt-2 text-sm opacity-90">
            {error instanceof Error ? error.message : 'The link may be invalid or the profile was removed.'}
          </p>
        </div>
      </div>
    )
  }

  const allProjects = projectsData?.data ?? []
  const openProjects = allProjects.filter((p) => p.status === 'OPEN')
  const closedProjects = allProjects.filter((p) => p.status === 'CLOSED')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl">{professor.name}</CardTitle>
                {professor.fieldOfStudy && (
                  <p className="mt-1 text-muted-foreground">{professor.fieldOfStudy}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {professor.professorStatus === 'PENDING' && (
                    <Badge variant="secondary">Pending approval</Badge>
                  )}
                  {professor.professorStatus === 'CONFIRMED' && (
                    <Badge variant="outline">Verified professor</Badge>
                  )}
                </div>
              </div>
            </div>
            {canMessageProfessor && (
              <Button
                type="button"
                className="shrink-0"
                onClick={() => router.push(`/dashboard/messages?with=${professor.id}`)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {professor.email && (
            <a
              href={`mailto:${professor.email}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {professor.email}
            </a>
          )}
          {professor.bio && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{professor.bio}</p>
          )}
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{professor.rankingScore}</span>{' '}
                <span className="text-muted-foreground">ranking score</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{professor.totalProjects}</span>{' '}
                <span className="text-muted-foreground">projects</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{professor.studentsSupervised}</span>{' '}
                <span className="text-muted-foreground">students supervised</span>
              </span>
            </div>
          </div>
          {professor.acceptanceRate != null && (
            <p className="text-sm text-muted-foreground">
              Acceptance rate:{' '}
              <span className="font-medium text-foreground">
                {(professor.acceptanceRate * 100).toFixed(0)}%
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Open research listings</h2>
          {openProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open projects right now.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {openProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Project history</h2>
          <p className="mb-4 text-sm text-muted-foreground">Closed listings from this professor.</p>
          {closedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No closed projects to show.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {closedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
