'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, type ProjectFilters } from '@/core/services'
import { ProjectCard } from '@/components/shared/project-card'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'

type SortOption = 'newest' | 'oldest' | 'popular'

export function ProjectsList() {
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
  })
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
  }

  const handleStatusFilter = (status: 'OPEN' | 'CLOSED' | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }))
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
            placeholder="Search projects by title, keywords, professor name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filter Panel and Sorting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>

          {/* Status Filters */}
          <div className="flex gap-2">
            <Button
              variant={filters.status === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(undefined)}
            >
              All
            </Button>
            <Button
              variant={filters.status === 'OPEN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('OPEN')}
            >
              Open
            </Button>
            <Button
              variant={filters.status === 'CLOSED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('CLOSED')}
            >
              Closed
            </Button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-muted-foreground">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Discipline/Category</label>
                <Input placeholder="e.g., Biology, CS..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Professor/Department</label>
                <Input placeholder="Search professor..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">University</label>
                <Input placeholder="Search university..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Tags/Skills</label>
                <Input placeholder="e.g., Machine Learning..." />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.total} projects
        </p>
      )}

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
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
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
          <p className="text-muted-foreground">No projects found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}
