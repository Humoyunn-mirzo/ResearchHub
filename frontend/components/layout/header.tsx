'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/lib/auth'
import { useTranslation } from '@/lib/i18n'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { AccountMenu } from './account-menu'
import { LanguageToggle } from './language-toggle'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: t('nav.projects'), href: '/projects' },
    { name: t('nav.rankings'), href: '/rankings' },
    { name: t('nav.about'), href: '/about' },
    ...(user?.role === 'STUDENT' || user?.role === 'PROFESSOR'
      ? [{ name: t('nav.messages'), href: '/dashboard/messages' as const }]
      : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="text-xl font-bold">
            ResearchHub
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">{t('nav.toggleMenu')}</span>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold leading-6 ${
                pathname === item.href ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-4">
          <LanguageToggle />
          <ThemeToggle />
          {isAuthenticated && user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">{t('nav.dashboard')}</Button>
              </Link>
              <AccountMenu />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">{t('nav.signIn')}</Button>
              </Link>
              <Link href="/register">
                <Button>{t('nav.signUp')}</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-2 px-4 pb-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t pt-4">
              <div className="flex justify-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              {isAuthenticated && user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <div className="mt-2">
                    <AccountMenu onNavigate={() => setMobileMenuOpen(false)} />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="mt-2 w-full">{t('nav.signUp')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
