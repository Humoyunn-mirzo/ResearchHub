'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  adminCloseProject,
  adminDeleteProject,
  adminModerateProject,
  fetchProjects,
  fetchResearchTopics,
} from '@/core/services'
import { type Project } from '@/core/domain'
import { ResearchTopicsPanel } from '@/components/admin/research-topics-panel'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import {
  ArrowLeft,
  Search,
  Trash2,
  ExternalLink,
  Ban,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function truncate(s: string, max: number) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

export default function AdminContentPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null)
  const [moderateProject, setModerateProject] = useState<Project | null>(null)
  const [moderateTags, setModerateTags] = useState<string[]>([])
  const [moderateStatus, setModerateStatus] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const debouncedSearch = useDebounce(searchInput, 300)

  const isAdmin =
    isAuthenticated &&
    (user?.role === 'UNIVERSITY_ADMIN' || user?.role === 'DEVELOPER' || user?.role === 'PLATFORM_ADMIN')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, isAdmin, router])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', 'admin', page, debouncedSearch],
    queryFn: () =>
      fetchProjects({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
      }),
    enabled: !!isAdmin,
  })

  const { data: topicList = [] } = useQuery({
    queryKey: ['research-topics'],
    queryFn: fetchResearchTopics,
    enabled: !!isAdmin,
  })

  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'admin'] })
      invalidateProjects()
      setDeleteConfirm(null)
    },
    onError: (err: Error) => alert(err.message || 'Failed to delete project'),
  })

  const closeMutation = useMutation({
    mutationFn: adminCloseProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'admin'] })
      invalidateProjects()
    },
    onError: (err: Error) => alert(err.message || 'Failed to close project'),
  })

  const moderateMutation = useMutation({
    mutationFn: ({ id, tags, status }: { id: string; tags: string[]; status: 'OPEN' | 'CLOSED' }) =>
      adminModerateProject(id, { tags, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'admin'] })
      invalidateProjects()
      setModerateProject(null)
    },
    onError: (err: Error) => alert(err.message || 'Failed to update project'),
  })

  const openModerate = (p: Project) => {
    setModerateProject(p)
    setModerateTags([...(p.tags ?? [])])
    setModerateStatus(p.status)
  }

  const toggleModerateTag = (name: string) => {
    setModerateTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    )
  }

  if (!isAdmin) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/admin"
          className="rounded-lg border p-2 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content moderation</h1>
          <p className="text-muted-foreground">
            Review projects, close or remove listings, and fix topic tags.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects…"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-4">
                <p className="text-sm text-destructive">
                  Failed to load projects. {error instanceof Error ? error.message : 'Please try again.'}
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              {data && (
                <p className="text-sm font-normal text-muted-foreground">{data.total} total</p>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm text-muted-foreground">Loading projects…</p>
                </div>
              ) : data && data.data.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-3 text-left font-medium">Title</th>
                          <th className="hidden pb-3 text-left font-medium md:table-cell">Summary</th>
                          <th className="pb-3 text-left font-medium">Topics</th>
                          <th className="pb-3 text-left font-medium">Status</th>
                          <th className="hidden pb-3 text-left font-medium lg:table-cell">Professor</th>
                          <th className="pb-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.data.map((p) => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="max-w-[200px] py-3 align-top">
                              <Link
                                href={`/projects/${p.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {p.title}
                              </Link>
                            </td>
                            <td className="hidden max-w-xs py-3 align-top text-muted-foreground md:table-cell">
                              {truncate(p.description, 100)}
                            </td>
                            <td className="py-3 align-top">
                              <div className="flex max-w-[180px] flex-wrap gap-1">
                                {(p.tags ?? []).slice(0, 4).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                    {tag}
                                  </Badge>
                                ))}
                                {(p.tags?.length ?? 0) > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(p.tags?.length ?? 0) - 4}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 align-top">
                              <Badge variant={p.status === 'OPEN' ? 'default' : 'secondary'}>
                                {p.status}
                              </Badge>
                            </td>
                            <td className="hidden py-3 align-top lg:table-cell">
                              <span className="text-muted-foreground">{p.professor?.name ?? '—'}</span>
                              {p.professorId && (
                                <Link
                                  href={`/professors/${p.professorId}`}
                                  className="ml-1 inline-flex text-muted-foreground hover:text-primary"
                                  title="View professor"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </td>
                            <td className="py-3 text-right align-top">
                              <div className="flex flex-wrap justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  title="Edit topics & status"
                                  onClick={() => openModerate(p)}
                                >
                                  <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                                {p.status === 'OPEN' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    title="Close project"
                                    disabled={closeMutation.isPending}
                                    onClick={() => closeMutation.mutate(p.id)}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                                {p.status === 'CLOSED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    title="Reopen project"
                                    disabled={moderateMutation.isPending}
                                    onClick={() =>
                                      moderateMutation.mutate({
                                        id: p.id,
                                        tags: p.tags ?? [],
                                        status: 'OPEN',
                                      })
                                    }
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-destructive hover:text-destructive"
                                  title="Delete project"
                                  onClick={() => setDeleteConfirm(p)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {data.total > data.limit && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {page} of {Math.ceil(data.total / data.limit)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setPage((n) => n - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= Math.ceil(data.total / data.limit)}
                          onClick={() => setPage((n) => n + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4">
          <ResearchTopicsPanel />
        </aside>
      </div>

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="mx-4 max-w-md rounded-lg border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold">Delete project</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Remove &quot;{deleteConfirm.title}&quot; from the platform? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {moderateProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModerateProject(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold">Moderate project</h2>
            <p className="mt-1 text-sm text-muted-foreground">{moderateProject.title}</p>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Listing status</p>
              <select
                value={moderateStatus}
                onChange={(e) => setModerateStatus(e.target.value as 'OPEN' | 'CLOSED')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Research topics</p>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {topicList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topics defined.</p>
                ) : (
                  topicList.map((t) => (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={moderateTags.includes(t.name)}
                        onChange={() => toggleModerateTag(t.name)}
                      />
                      {t.name}
                    </label>
                  ))
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">At least one topic is required.</p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModerateProject(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (moderateTags.length === 0) {
                    alert('Select at least one research topic.')
                    return
                  }
                  moderateMutation.mutate({
                    id: moderateProject.id,
                    tags: moderateTags,
                    status: moderateStatus,
                  })
                }}
                disabled={moderateMutation.isPending}
              >
                {moderateMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
