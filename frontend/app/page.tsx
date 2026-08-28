'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { ArrowRight, BookOpen, Users, TrendingUp } from 'lucide-react'
import { HomeHighlights } from '@/components/home/home-highlights'
import { useTranslation } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-primary/5 to-background py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-primary">{t('home.eyebrow')}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{t('home.subtitle')}</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/projects">
                <Button size="lg">
                  {t('home.browseProjects')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  {t('home.signUp')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="-mt-4 pb-8">
        <HomeHighlights />
      </div>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.whyTitle')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t('home.whySubtitle')}</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{t('home.feature1Title')}</h3>
              <p className="mt-2 text-muted-foreground">{t('home.feature1Body')}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{t('home.feature2Title')}</h3>
              <p className="mt-2 text-muted-foreground">{t('home.feature2Body')}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{t('home.feature3Title')}</h3>
              <p className="mt-2 text-muted-foreground">{t('home.feature3Body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">{t('home.ctaTitle')}</h2>
          <p className="mt-4 text-lg opacity-90">{t('home.ctaBody')}</p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                {t('home.ctaButton')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
