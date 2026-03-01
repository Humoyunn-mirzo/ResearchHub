import type { Metadata } from 'next'
import './globals.css'
import { Header, Footer } from '@/components/layout'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ResearchHub - Connect, Collaborate, Discover',
  description: 'Platform connecting students and professors for research collaboration',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
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
