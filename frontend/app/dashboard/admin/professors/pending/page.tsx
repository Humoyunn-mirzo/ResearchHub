'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchPendingProfessors, approveProfessor, getProfessorCvUrl } from '@/core/services'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { ArrowLeft, Users, Check, FileDown } from 'lucide-react'

export default function AdminPendingProfessorsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(1)

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
    queryKey: ['admin', 'professors', 'pending', page],
    queryFn: () => fetchPendingProfessors({ page, limit: 20 }),
    enabled: !!isAdmin,
  })

  const approveMutation = useMutation({
    mutationFn: approveProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'professors', 'pending'] })
    },
    onError: (err: Error) => alert(err.message || 'Failed to approve professor'),
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
          <h1 className="text-3xl font-bold tracking-tight">Pending Professors</h1>
          <p className="text-muted-foreground">
            Review professor registrations and approve access to create projects.
          </p>
        </div>
      </div>

      {error && (
        <Card className="mb-4 border-destructive/50 bg-destructive/10">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">
              Failed to load. {error instanceof Error ? error.message : 'Please try again.'}
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professors awaiting approval
            {data && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-medium">Name</th>
                      <th className="pb-3 text-left font-medium">Email</th>
                      <th className="pb-3 text-left font-medium">Field</th>
                      <th className="pb-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3">{p.name}</td>
                        <td className="py-3">{p.email}</td>
                        <td className="py-3">
                          <Badge variant="outline">{p.fieldOfStudy}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={getProfessorCvUrl(p.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Button variant="outline" size="sm" title="Download CV">
                                <FileDown className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(p.id)}
                              disabled={approveMutation.isPending}
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
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
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No pending professors</p>
              <p className="mt-2 text-sm text-muted-foreground">
                New professor registrations will appear here for approval.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
