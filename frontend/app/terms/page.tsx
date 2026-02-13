import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - ResearchHub',
  description: 'Terms of service for ResearchHub',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground">
          By using ResearchHub, you agree to these terms of service.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Acceptable Use</h2>
        <p>
          You agree to use the platform for legitimate research collaboration purposes only. Do not
          submit false information, spam, or content that violates academic integrity.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Account Responsibility</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity under your account.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Contact</h2>
        <p>
          For questions about these terms, contact us at{' '}
          <a href="mailto:legal@researchhub.com" className="text-primary hover:underline">
            legal@researchhub.com
          </a>
        </p>
      </div>
    </div>
  )
}
