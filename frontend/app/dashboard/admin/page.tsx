'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Users, BookOpen, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { fetchAdminAnalytics } from '@/core/services'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const isAdmin = isAuthenticated && (user?.role === 'UNIVERSITY_ADMIN' || user?.role === 'DEVELOPER' || user?.role === 'PLATFORM_ADMIN')

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

  const { data: analytics } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAdminAnalytics,
    enabled: !!isAdmin,
  })

  const totalUsers = analytics?.totalUsers ?? 0
  const openProjects = analytics?.openProjects ?? 0
  const totalUniversities = analytics?.totalUniversities ?? 0
  const successRate = analytics && analytics.totalApplications > 0
    ? Math.round((analytics.acceptedApplications / analytics.totalApplications) * 100)
    : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openProjects}</div>
            <p className="text-xs text-muted-foreground">Open for applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniversities}</div>
            <p className="text-xs text-muted-foreground">On the platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Applications accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/admin/users">
          <Card className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage user accounts, roles, and permissions across the platform.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/content">
          <Card className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review and moderate project submissions and user content.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/analytics">
          <Card className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View platform analytics, usage statistics, and performance metrics.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/professors/pending">
          <Card className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Pending Professors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review and approve professor registrations with CV submissions.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure platform settings, integrations, and system preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
