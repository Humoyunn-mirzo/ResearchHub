'use client'

import { ProjectsList } from '@/components/shared/projects-list'
import { useTranslation } from '@/lib/i18n'

export default function ProjectsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{t('projects.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('projects.subtitle')}</p>
      </div>
      <ProjectsList />
    </div>
  )
}
