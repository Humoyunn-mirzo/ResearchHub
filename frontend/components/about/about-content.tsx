'use client'

import { useTranslation } from '@/lib/i18n'

export function AboutContent() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">{t('about.title')}</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground">{t('about.intro')}</p>

        <h2 className="mt-8 text-2xl font-semibold">{t('about.missionTitle')}</h2>
        <p>{t('about.missionBody')}</p>

        <h2 className="mt-8 text-2xl font-semibold">{t('about.featuresTitle')}</h2>
        <ul>
          <li>{t('about.feature1')}</li>
          <li>{t('about.feature2')}</li>
          <li>{t('about.feature3')}</li>
          <li>{t('about.feature4')}</li>
          <li>{t('about.feature5')}</li>
        </ul>

        <h2 className="mt-8 text-2xl font-semibold">{t('about.professorsTitle')}</h2>
        <p>{t('about.professorsBody')}</p>

        <h2 className="mt-8 text-2xl font-semibold">{t('about.contactTitle')}</h2>
        <p>
          {t('about.contactBody')}{' '}
          <a href="mailto:support@researchhub.com" className="text-primary hover:underline">
            support@researchhub.com
          </a>
        </p>
      </div>
    </div>
  )
}
