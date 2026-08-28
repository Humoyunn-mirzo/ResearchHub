import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Header, Footer } from '@/components/layout'
import { LOCALE_COOKIE, localeFromCookieValue } from '@/lib/i18n'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ResearchHub - Connect, Collaborate, Discover',
  description: 'Platform connecting students and professors for research collaboration',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = localeFromCookieValue(cookieStore.get(LOCALE_COOKIE)?.value)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans">
        <Providers locale={locale}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
