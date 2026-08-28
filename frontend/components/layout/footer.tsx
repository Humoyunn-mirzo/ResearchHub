'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">ResearchHub</h3>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-foreground">
                  {t('footer.browseProjects')}
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="text-muted-foreground hover:text-foreground">
                  {t('footer.rankings')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  {t('footer.about')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          {t('footer.rights', { year: currentYear })}
        </div>
      </div>
    </footer>
  )
}
