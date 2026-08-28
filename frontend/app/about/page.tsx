import type { Metadata } from 'next'
import { AboutContent } from '@/components/about/about-content'

export const metadata: Metadata = {
  title: 'About - ResearchHub',
  description: 'Learn more about ResearchHub and our mission',
}

export default function AboutPage() {
  return <AboutContent />
}
