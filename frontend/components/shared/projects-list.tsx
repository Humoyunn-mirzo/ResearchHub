'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProjects, fetchResearchTopics, type ProjectFilters } from '@/core/services'
import { ProjectCard } from '@/components/shared/project-card'
import { Badge, Button, Input } from '@/components/ui'
import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { useTranslation } from '@/lib/i18n'

export function ProjectsList() {
  const { user, isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
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

  const { data: researchTopics = [] } = useQuery({
    queryKey: ['research-topics'],
    queryFn: fetchResearchTopics,
    staleTime: 60 * 1000,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
  }

  const topicNames = researchTopics.map((t) => t.name)
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
        <p className="font-medium">{t('projects.loadFailed')}</p>
        <p className="mt-2 text-sm opacity-90">{errMsg}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          {t('common.retry')}
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
            <span>{t('projects.showing', { shown: data.data.length, total: data.total })}</span>
          ) : (
            <span>{t('projects.browseHint')}</span>
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
            {t('common.refresh')}
          </Button>
          {isAuthenticated && user?.role === 'PROFESSOR' && (
            <Link href="/dashboard/professor/projects/new">
              <Button>{t('projects.create')}</Button>
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
            placeholder={t('projects.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">{t('common.search')}</Button>
      </form>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t('common.status')}</span>
          <div className="flex gap-2">
            <Button
              variant={filters.status === 'OPEN' ? 'default' : 'outline'}
              onClick={() => setFilters((prev) => ({ ...prev, status: 'OPEN', page: 1 }))}
            >
              {t('common.open')}
            </Button>
            <Button
              variant={filters.status === 'CLOSED' ? 'default' : 'outline'}
              onClick={() => setFilters((prev) => ({ ...prev, status: 'CLOSED', page: 1 }))}
            >
              {t('common.closed')}
            </Button>
            <Button
              variant={filters.status === undefined ? 'default' : 'outline'}
              onClick={() => {
                const { status: _status, ...rest } = filters
                setFilters({ ...rest, page: 1 })
              }}
            >
              {t('common.all')}
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{t('common.sort')}</span>
            <select
              value={filters.sort ?? 'newest'}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value as 'newest' | 'oldest', page: 1 }))
              }
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="newest">{t('common.newest')}</option>
              <option value="oldest">{t('common.oldest')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t('projects.topics')}</span>
          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {topicNames.length === 0 ? (
              <span className="text-sm text-muted-foreground">{t('projects.noTopics')}</span>
            ) : (
              topicNames.map((tag) => {
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
              })
            )}
          </div>

          {selectedTags.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary">{t('projects.selected', { count: selectedTags.length })}</Badge>
              <Button
                variant="outline"
                onClick={() => setFilters((prev) => ({ ...prev, tags: undefined, page: 1 }))}
              >
                {t('common.clear')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {(filters.search || (filters.tags && filters.tags.length > 0) || filters.status) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && (
            <Badge variant="outline">{t('projects.filterSearch', { term: filters.search })}</Badge>
          )}
          {filters.status && (
            <Badge variant="outline">
              {t('projects.filterStatus', {
                status: filters.status === 'OPEN' ? t('projects.statusOpen') : t('projects.statusClosed'),
              })}
            </Badge>
          )}
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
                {t('common.previous')}
              </Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground">
                {t('common.pageOf', {
                  page: data.page,
                  total: Math.ceil(data.total / data.limit),
                })}
              </span>
              <Button
                variant="outline"
                disabled={data.page >= Math.ceil(data.total / data.limit)}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{t('projects.none')}</p>
        </div>
      )}
    </div>
  )
}
