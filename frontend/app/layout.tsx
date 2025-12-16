import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header, Footer } from '@/components/layout'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={inter.className}>
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
