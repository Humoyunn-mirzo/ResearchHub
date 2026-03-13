'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchProjects, deleteProject } from '@/core/services'
import { type Project } from '@/core/domain'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { ArrowLeft, Search, Trash2, ExternalLink } from 'lucide-react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function AdminContentPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null)
  const debouncedSearch = useDebounce(searchInput, 300)

  const isDeveloper =
    isAuthenticated && (user?.role === 'DEVELOPER' || user?.role === 'PLATFORM_ADMIN')
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

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'admin'] })
      setDeleteConfirm(null)
    },
    onError: (err: Error) => alert(err.message || 'Failed to delete project'),
  })

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
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground">Review and manage projects on the platform</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
        <Card className="mb-4 border-destructive/50 bg-destructive/10">
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
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Professor</th>
                      <th className="pb-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3">
                          <Link
                            href={`/projects/${p.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-3">
                          <Badge variant={p.status === 'OPEN' ? 'default' : 'secondary'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {p.professor?.name ?? '—'}
                          {p.professorId && (
                            <Link
                              href={`/professors/${p.professorId}`}
                              className="ml-2 inline-flex text-muted-foreground hover:text-primary"
                              title="View professor"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {isDeveloper && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(p)}
                              title="Delete project"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= Math.ceil(data.total / data.limit)}
                      onClick={() => setPage((p) => p + 1)}
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
              Are you sure you want to delete &quot;{deleteConfirm.title}&quot;? This action cannot
              be undone.
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
    </div>
  )
}
