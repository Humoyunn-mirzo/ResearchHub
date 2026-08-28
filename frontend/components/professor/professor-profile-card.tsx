'use client'

import Link from 'next/link'
import {
  Building2,
  GraduationCap,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
} from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { profileCompleteness, type ProfessorProfile } from '@/core/domain'
import { useTranslation } from '@/lib/i18n'
import { ProfessorAvatar } from './professor-avatar'

type ProfessorProfileCardProps = {
  professor: ProfessorProfile
  /** Bumped after an avatar upload so the image is refetched. */
  avatarVersion?: string | number
}

function splitInterests(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
}

export function ProfessorProfileCard({ professor, avatarVersion }: ProfessorProfileCardProps) {
  const { t } = useTranslation()
  const completeness = profileCompleteness(professor)
  const interests = splitInterests(professor.researchInterests)

  const contactRows = [
    { icon: Mail, value: professor.email, href: `mailto:${professor.email}` },
    { icon: Phone, value: professor.phone, href: `tel:${professor.phone ?? ''}` },
    { icon: MapPin, value: professor.officeLocation, href: null },
    { icon: Globe, value: professor.websiteUrl, href: professor.websiteUrl },
  ].filter((row) => Boolean(row.value))

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <ProfessorAvatar
            professorId={professor.id}
            name={professor.name}
            hasPicture={professor.hasProfilePicture}
            size="lg"
            version={avatarVersion}
          />

          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold">{professor.name}</h2>
                <p className="text-muted-foreground">
                  {[professor.title, professor.department].filter(Boolean).join(' · ') ||
                    t('common.notProvided')}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {professor.professorStatus === 'PENDING' ? (
                    <Badge variant="secondary">{t('professorProfile.pending')}</Badge>
                  ) : (
                    <Badge variant="outline">{t('professorProfile.verified')}</Badge>
                  )}
                  {professor.fieldOfStudy && (
                    <Badge variant="secondary">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {professor.fieldOfStudy}
                    </Badge>
                  )}
                  {professor.universityName && (
                    <Badge variant="secondary">
                      <Building2 className="mr-1 h-3 w-3" />
                      {professor.universityName}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/professor/profile">
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('professorProfile.editProfile')}
                  </Button>
                </Link>
                <Link href={`/professors/${professor.id}`}>
                  <Button variant="ghost" size="sm">
                    {t('professorProfile.viewPublic')}
                  </Button>
                </Link>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {professor.bio || t('professorProfile.noBio')}
            </p>

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

            {contactRows.length > 0 && (
              <div className="grid gap-2 border-t pt-4 sm:grid-cols-2">
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

            <div className="border-t pt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('professorProfile.completeness', { percent: completeness })}
                </span>
                <span className="text-muted-foreground">
                  {completeness === 100
                    ? t('professorProfile.completeHint')
                    : t('professorProfile.completenessHint')}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={completeness}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
