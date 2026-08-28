'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
import { SessionSync } from '@/components/auth/session-sync'
import { I18nProvider, type Locale } from '@/lib/i18n'

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode
  locale?: Locale
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLocale={locale}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionSync />
          {children}
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
