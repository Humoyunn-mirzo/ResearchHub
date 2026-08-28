'use client'

import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ArrowLeft, Languages, Settings as SettingsIcon } from 'lucide-react'
import { LanguageToggle, ThemeToggle } from '@/components/layout'
import { useTranslation } from '@/lib/i18n'

export default function SettingsPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg border p-2 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settingsPage.title')}</h1>
          <p className="text-muted-foreground">{t('settingsPage.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              {t('settingsPage.appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settingsPage.theme')}</p>
              <p className="text-sm text-muted-foreground">{t('settingsPage.themeHint')}</p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('settingsPage.language')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('language.description')}</p>
            <LanguageToggle variant="inline" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
