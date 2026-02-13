import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - ResearchHub',
  description: 'Privacy policy for ResearchHub',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground">
          This page describes how ResearchHub collects, uses, and protects your personal information.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Information We Collect</h2>
        <p>
          We collect information you provide when registering, applying to projects, or contacting
          us. This may include your name, email address, university affiliation, and application
          materials.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">How We Use Your Information</h2>
        <p>
          Your information is used to facilitate research collaborations, match students with
          professors, and improve our platform. We do not sell your personal data to third parties.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Contact</h2>
        <p>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:privacy@researchhub.com" className="text-primary hover:underline">
            privacy@researchhub.com
          </a>
        </p>
      </div>
    </div>
  )
}
