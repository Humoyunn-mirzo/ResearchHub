import { apiClient } from '@/lib/api'

export type AdminAnalytics = {
  totalUsers: number
  usersByRole: Record<string, number>
  totalProjects: number
  openProjects: number
  closedProjects: number
  totalUniversities: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
}

function mapAnalytics(body: Record<string, unknown>): AdminAnalytics {
  const data = (body.data ?? body) as Record<string, unknown>
  const usersByRole = (data.usersByRole as Record<string, number>) ?? {}
  return {
    totalUsers: Number(data.totalUsers ?? 0),
    usersByRole: typeof usersByRole === 'object' ? usersByRole : {},
    totalProjects: Number(data.totalProjects ?? 0),
    openProjects: Number(data.openProjects ?? 0),
    closedProjects: Number(data.closedProjects ?? 0),
    totalUniversities: Number(data.totalUniversities ?? 0),
    totalApplications: Number(data.totalApplications ?? 0),
    pendingApplications: Number(data.pendingApplications ?? 0),
    acceptedApplications: Number(data.acceptedApplications ?? 0),
    rejectedApplications: Number(data.rejectedApplications ?? 0),
  }
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const response = await apiClient.get('/admin/analytics')
  const body = response.data as Record<string, unknown>
  return mapAnalytics(body)
}
