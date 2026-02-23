'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, type ProjectFilters } from '@/core/services'
import { ProjectCard } from '@/components/shared/project-card'
import { Badge, Button, Input } from '@/components/ui'
import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { env } from '@/lib/env'
import { mockProjects } from '@/core/services/mock-db'

export function ProjectsList() {
  const { user, isAuthenticated } = useAuthStore()
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
    status: 'OPEN',
    sort: 'newest',
  })
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 15 * 1000,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
  }

  const tagOptions =
    env.NEXT_PUBLIC_DATA_MODE === 'mock'
      ? Array.from(new Set(mockProjects.flatMap((p) => p.tags))).sort()
      : ['Machine Learning', 'Climate', 'NLP', 'Policy', 'Data Visualization', 'Research Impact', 'Biology', 'Engineering', 'Security', 'HCI', 'Economics']

  const selectedTags = filters.tags ?? []

  const toggleTag = (tag: string) => {
    setFilters((prev) => {
      const tags = prev.tags ?? []
      const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
      return { ...prev, tags: next.length ? next : undefined, page: 1 }
    })
  }

  if (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        <p className="font-medium">Failed to load projects. Please try again.</p>
        <p className="mt-2 text-sm opacity-90">{errMsg}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {data ? (
            <>
              Showing <span className="font-medium text-foreground">{data.data.length}</span> of{' '}
              <span className="font-medium text-foreground">{data.total}</span> projects
            </>
          ) : (
            <span>Browse projects and filter by topic.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAuthenticated && user?.role === 'PROFESSOR' && (
            <Link href="/dashboard/professor/projects/new">
              <Button>+ Create project</Button>
            </Link>
          )}
        </div>
      </div>

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
      <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
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
                const { status: _status, ...rest } = filters
                setFilters({ ...rest, page: 1 })
              }}
            >
              All
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort</span>
            <select
              value={filters.sort ?? 'newest'}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value as 'newest' | 'oldest', page: 1 }))
              }
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Topics</span>
          <div className="flex flex-wrap gap-2">
            {tagOptions.slice(0, 12).map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    active ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>

          {selectedTags.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary">{selectedTags.length} selected</Badge>
              <Button
                variant="outline"
                onClick={() => setFilters((prev) => ({ ...prev, tags: undefined, page: 1 }))}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {(filters.search || (filters.tags && filters.tags.length > 0) || filters.status) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && <Badge variant="outline">Search: “{filters.search}”</Badge>}
          {filters.status && <Badge variant="outline">Status: {filters.status}</Badge>}
          {filters.tags?.map((t) => (
            <button key={t} type="button" onClick={() => toggleTag(t)}>
              <Badge variant="outline" className="hover:bg-accent">
                {t} ×
              </Badge>
            </button>
          ))}
        </div>
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
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground">
                Page <span className="mx-1 font-medium text-foreground">{data.page}</span> of{' '}
                <span className="ml-1 font-medium text-foreground">
                  {Math.ceil(data.total / data.limit)}
                </span>
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
