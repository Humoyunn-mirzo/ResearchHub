import { ProjectsList } from '@/components/shared/projects-list'

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Research Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Browse, search, and filter opportunities from professors across universities.
        </p>
      </div>
      <ProjectsList />
    </div>
  )
}
