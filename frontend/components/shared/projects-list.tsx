'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, type ProjectFilters } from '@/core/services'
import { ProjectCard } from '@/components/shared/project-card'
import { Button, Input } from '@/components/ui'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function ProjectsList() {
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
    status: 'OPEN',
  })
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        Failed to load projects. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filters.status === 'OPEN' ? 'default' : 'outline'}
          onClick={() => setFilters((prev) => ({ ...prev, status: 'OPEN', page: 1 }))}
        >
          Open
        </Button>
        <Button
          variant={filters.status === 'CLOSED' ? 'default' : 'outline'}
          onClick={() => setFilters((prev) => ({ ...prev, status: 'CLOSED', page: 1 }))}
        >
          Closed
        </Button>
        <Button
          variant={filters.status === undefined ? 'default' : 'outline'}
          onClick={() => {
            const { status, ...rest } = filters
            setFilters({ ...rest, page: 1 })
          }}
        >
          All
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {data.total > data.limit && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                disabled={data.page >= Math.ceil(data.total / data.limit)}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  )
}
