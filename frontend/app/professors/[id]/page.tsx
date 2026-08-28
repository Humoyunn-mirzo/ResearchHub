'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchProfessorById, fetchProjects } from '@/core/services'
import { useAuthStore } from '@/lib/auth'
import { useTranslation } from '@/lib/i18n'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
  GraduationCap,
  MessageCircle,
} from 'lucide-react'
import { ProjectCard } from '@/components/shared/project-card'
import { ProfessorAvatar } from '@/components/professor/professor-avatar'

export default function ProfessorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
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
            {t('common.back')}
          </Button>
        </Link>
        <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-medium">{t('professorProfile.loadError')}</p>
          <p className="mt-2 text-sm opacity-90">
            {error instanceof Error ? error.message : t('professorProfile.loadErrorHint')}
          </p>
        </div>
      </div>
    )
  }

  const allProjects = projectsData?.data ?? []
  const openProjects = allProjects.filter((p) => p.status === 'OPEN')
  const closedProjects = allProjects.filter((p) => p.status === 'CLOSED')

  const subtitle = [professor.title, professor.department, professor.fieldOfStudy]
    .filter(Boolean)
    .join(' · ')

  const interests = (professor.researchInterests ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const contactRows = [
    { icon: Mail, value: professor.email, href: `mailto:${professor.email}` },
    { icon: Phone, value: professor.phone, href: `tel:${professor.phone ?? ''}` },
    { icon: MapPin, value: professor.officeLocation, href: null },
    { icon: Globe, value: professor.websiteUrl, href: professor.websiteUrl },
  ].filter((row) => Boolean(row.value))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('nav.projects')}
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <ProfessorAvatar
                professorId={professor.id}
                name={professor.name}
                hasPicture={professor.hasProfilePicture}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl">{professor.name}</CardTitle>
                {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {professor.professorStatus === 'PENDING' && (
                    <Badge variant="secondary">{t('professorProfile.pending')}</Badge>
                  )}
                  {professor.professorStatus === 'CONFIRMED' && (
                    <Badge variant="outline">{t('professorProfile.verified')}</Badge>
                  )}
                  {professor.universityName && (
                    <Badge variant="secondary">
                      <Building2 className="mr-1 h-3 w-3" />
                      {professor.universityName}
                    </Badge>
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
                {t('professorProfile.message')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactRows.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {contactRows.map((row) => {
                const Icon = row.icon
                return (
                  <div key={row.value} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {row.href ? (
                      <a
                        href={row.href}
                        className="truncate text-primary hover:underline"
                        {...(row.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="truncate">{row.value}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {professor.bio && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {professor.bio}
            </p>
          )}
          {interests.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
              {interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{professor.rankingScore}</span>{' '}
                <span className="text-muted-foreground">{t('professorProfile.rankingScore')}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{professor.totalProjects}</span>{' '}
                <span className="text-muted-foreground">{t('professorProfile.projects')}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">{professor.studentsSupervised}</span>{' '}
                <span className="text-muted-foreground">
                  {t('professorProfile.studentsSupervised')}
                </span>
              </span>
            </div>
          </div>
          {professor.acceptanceRate != null && (
            <p className="text-sm text-muted-foreground">
              {t('professorProfile.acceptanceRate')}{' '}
              <span className="font-medium text-foreground">
                {(professor.acceptanceRate * 100).toFixed(0)}%
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold">{t('professorProfile.openListings')}</h2>
          {openProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('professorProfile.noOpenListings')}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {openProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">{t('professorProfile.projectHistory')}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('professorProfile.projectHistoryHint')}
          </p>
          {closedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('professorProfile.noClosedProjects')}
            </p>
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
