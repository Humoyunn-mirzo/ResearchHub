import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - ResearchHub',
  description: 'Learn more about ResearchHub and our mission',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">About ResearchHub</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground">
          ResearchHub is a comprehensive platform connecting students, professors, and
          administrators across universities for collaborative research opportunities.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Our Mission</h2>
        <p>
          To democratize access to research opportunities and foster collaboration between students
          and faculty members across academic institutions worldwide.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Features</h2>
        <ul>
          <li>Browse and discover research projects from top universities</li>
          <li>Connect with leading professors and researchers</li>
          <li>Apply to projects that match your interests and skills</li>
          <li>Track your applications and research progress</li>
          <li>Build your academic portfolio</li>
        </ul>

        <h2 className="mt-8 text-2xl font-semibold">For Professors</h2>
        <p>
          ResearchHub provides professors with tools to create, manage, and promote their research
          projects, review student applications, and build their research teams efficiently.
        </p>

        <h2 className="mt-8 text-2xl font-semibold">Contact Us</h2>
        <p>
          Have questions or feedback? Reach out to us at{' '}
          <a href="mailto:support@researchhub.com" className="text-primary hover:underline">
            support@researchhub.com
          </a>
        </p>
      </div>
    </div>
  )
}
