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

export type PendingProfessor = {
  id: string
  name: string
  email: string
  universityId?: string | null
  fieldOfStudy: string
  professorStatus: string
}

export type PendingProfessorsResponse = {
  data: PendingProfessor[]
  total: number
  page: number
  limit: number
}

function mapPendingProfessorsResponse(body: {
  data?: unknown[]
  pagination?: { number: number; size: number; totalElements: number }
}): PendingProfessorsResponse {
  const items = Array.isArray(body.data) ? body.data : []
  const pagination = body.pagination ?? { number: 0, size: 20, totalElements: items.length }
  return {
    data: items.map((p) => {
      const x = p as Record<string, unknown>
      return {
        id: String(x.id ?? ''),
        name: String(x.name ?? ''),
        email: String(x.email ?? ''),
        universityId: x.universityId != null ? String(x.universityId) : null,
        fieldOfStudy: String(x.fieldOfStudy ?? ''),
        professorStatus: String(x.professorStatus ?? 'PENDING'),
      }
    }),
    total: Number(pagination.totalElements),
    page: Number(pagination.number) + 1,
    limit: Number(pagination.size),
  }
}

export async function fetchPendingProfessors(options?: {
  page?: number
  limit?: number
}): Promise<PendingProfessorsResponse> {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const response = await apiClient.get('/admin/professors/pending', {
    params: { page: page - 1, size: limit },
  })
  return mapPendingProfessorsResponse(response.data as Parameters<typeof mapPendingProfessorsResponse>[0])
}

export async function approveProfessor(id: string): Promise<PendingProfessor> {
  const response = await apiClient.patch(`/admin/professors/${id}/approve`)
  const body = response.data as { data?: Record<string, unknown> }
  const p = (body.data ?? response.data) as Record<string, unknown>
  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    email: String(p.email ?? ''),
    universityId: p.universityId != null ? String(p.universityId) : null,
    fieldOfStudy: String(p.fieldOfStudy ?? ''),
    professorStatus: String(p.professorStatus ?? 'CONFIRMED'),
  }
}

export function getProfessorCvUrl(id: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const url = apiUrl.startsWith('http') ? apiUrl : (typeof window !== 'undefined' ? window.location.origin : '') + apiUrl
  return `${url}/admin/professors/${id}/cv`
}
