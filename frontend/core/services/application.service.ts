import { apiClient } from '@/lib/api'
import {
  type Application,
  type CreateApplicationInput,
  type ApplicationStatus,
} from '@/core/domain'
type ApplicationsResponse = {
  data: Application[]
  total: number
  page: number
  limit: number
}


export type ApplicationFilters = {
  projectId?: string
  studentId?: string
  myProjects?: boolean
  status?: ApplicationStatus
  page?: number
  limit?: number
}

function cleanParams<T extends Record<string, unknown>>(params: T): T {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  ) as T
}

function mapBackendResponseToFrontend(body: {
  data?: unknown[]
  pagination?: { number: number; size: number; totalElements: number }
}): ApplicationsResponse {
  const items = Array.isArray(body.data) ? body.data : []
  const pagination = body.pagination ?? { number: 0, size: 20, totalElements: items.length }
  return {
    data: items.map((a: unknown) => {
      const app = a as Record<string, unknown>
      return {
        id: String(app.id),
        projectId: String(app.projectId ?? ''),
        studentId: String(app.studentId ?? ''),
        status: ((app.status as string) ?? 'PENDING') as Application['status'],
        cvFile: app.cvFile as string | undefined,
        screeningAnswers: Array.isArray(app.screeningAnswers) ? (app.screeningAnswers as string[]) : undefined,
        createdAt: app.appliedAt ? new Date(app.appliedAt as string) : new Date(),
        updatedAt: app.updatedAt ? new Date(app.updatedAt as string) : new Date(),
        student: app.student as Application['student'],
        project: app.project as Application['project'],
      }
    }),
    total: Number(pagination.totalElements),
    page: Number(pagination.number) + 1,
    limit: Number(pagination.size),
  }
}

export async function fetchApplications(
  filters: ApplicationFilters = {}
): Promise<ApplicationsResponse> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const params = cleanParams({
    page: page - 1,
    size: limit,
    ...(filters.status && { status: filters.status }),
  })
  const url =
    filters.studentId != null
      ? `/applications/students/${filters.studentId}`
      : filters.projectId != null
        ? `/applications/projects/${filters.projectId}`
        : filters.myProjects === true
          ? '/applications/my-projects'
          : '/applications'
  const response = await apiClient.get(url, { params })
  return mapBackendResponseToFrontend(response.data as Parameters<typeof mapBackendResponseToFrontend>[0])
}

export async function fetchApplicationById(id: string): Promise<Application> {
  const response = await apiClient.get(`/applications/${id}`)
  const body = response.data as { data?: Record<string, unknown> }
  const app = (body.data ?? response.data) as Record<string, unknown>
  return {
    id: String(app.id),
    projectId: String(app.projectId ?? ''),
    studentId: String(app.studentId ?? ''),
    status: (app.status as Application['status']) ?? 'PENDING',
    cvFile: app.cvFile as string | undefined,
    screeningAnswers: Array.isArray(app.screeningAnswers) ? app.screeningAnswers : undefined,
    createdAt: app.appliedAt ? new Date(app.appliedAt as string) : new Date(),
    updatedAt: app.updatedAt ? new Date(app.updatedAt as string) : new Date(),
    student: app.student as Application['student'],
    project: app.project as Application['project'],
  }
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const response = await apiClient.post('/applications', input)
  const body = response.data as { data?: Record<string, unknown> }
  const app = (body.data ?? response.data) as Record<string, unknown>
  return {
    id: String(app.id),
    projectId: String(app.projectId ?? ''),
    studentId: String(app.studentId ?? ''),
    status: (app.status as Application['status']) ?? 'PENDING',
    cvFile: app.cvFile as string | undefined,
    screeningAnswers: Array.isArray(app.screeningAnswers) ? app.screeningAnswers : undefined,
    createdAt: app.appliedAt ? new Date(app.appliedAt as string) : new Date(),
    updatedAt: app.updatedAt ? new Date(app.updatedAt as string) : new Date(),
    student: app.student as Application['student'],
    project: app.project as Application['project'],
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  const response = await apiClient.patch(`/applications/${id}`, { status })
  const body = response.data as { data?: Record<string, unknown> }
  const app = (body.data ?? response.data) as Record<string, unknown>
  return {
    id: String(app.id),
    projectId: String(app.projectId ?? ''),
    studentId: String(app.studentId ?? ''),
    status: (app.status as Application['status']) ?? 'PENDING',
    cvFile: app.cvFile as string | undefined,
    screeningAnswers: Array.isArray(app.screeningAnswers) ? app.screeningAnswers : undefined,
    createdAt: app.appliedAt ? new Date(app.appliedAt as string) : new Date(),
    updatedAt: app.updatedAt ? new Date(app.updatedAt as string) : new Date(),
    student: app.student as Application['student'],
    project: app.project as Application['project'],
  }
}

export async function withdrawApplication(id: string): Promise<void> {
  await apiClient.delete(`/applications/${id}`)
}
