'use client'

import { ProjectsList } from '@/components/shared/projects-list'
import { Button } from '@/components/ui'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const canCreateProject = user?.role === 'PROFESSOR' || user?.role === 'ADMIN'

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Research Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Explore cutting-edge research opportunities from top universities
          </p>
        </div>
        {canCreateProject && (
          <Link href="/dashboard/professor/projects/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        )}
      </div>
      <ProjectsList />
    </div>
  )
}
