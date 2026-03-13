'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ArrowLeft, BarChart3, Users, BookOpen, FileCheck } from 'lucide-react'
import { fetchAdminAnalytics } from '@/core/services'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
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

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAdminAnalytics,
    enabled: !!isAdmin,
  })

  const usersByRoleData =
    analytics?.usersByRole &&
    Object.entries(analytics.usersByRole).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value: Number(value),
    }))

  const applicationsData = analytics
    ? [
        { name: 'Pending', value: analytics.pendingApplications, color: '#f59e0b' },
        { name: 'Accepted', value: analytics.acceptedApplications, color: '#10b981' },
        { name: 'Rejected', value: analytics.rejectedApplications, color: '#ef4444' },
      ].filter((d) => d.value > 0)
    : []

  const projectsBarData = analytics
    ? [
        { name: 'Open', count: analytics.openProjects },
        { name: 'Closed', count: analytics.closedProjects },
      ]
    : []

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
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform usage statistics and charts</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading analytics…</p>
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.openProjects} open / {analytics.closedProjects} closed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Universities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUniversities}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.acceptedApplications} accepted / {analytics.rejectedApplications} rejected
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Users by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersByRoleData && usersByRoleData.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usersByRoleData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No user data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Projects by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsBarData.some((d) => d.count > 0) ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectsBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Projects" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No project data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {analytics.totalApplications > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Applications by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsData.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationsData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {applicationsData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No application data</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load analytics
          </CardContent>
        </Card>
      )}
    </div>
  )
}
