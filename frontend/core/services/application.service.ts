import { apiClient } from '@/lib/api'
import {
  type Application,
  type CreateApplicationInput,
  type ApplicationStatus,
} from '@/core/domain'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth'
import { mockCreateApplication, mockFetchApplications, mockApplications } from './mock-db'
type ApplicationsResponse = {
  data: Application[]
  total: number
  page: number
  limit: number
}


export type ApplicationFilters = {
  projectId?: string
  studentId?: string
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
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    return mockFetchApplications(filters)
  }
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
        : '/applications'
  const response = await apiClient.get(url, { params })
  return mapBackendResponseToFrontend(response.data as Parameters<typeof mapBackendResponseToFrontend>[0])
}

export async function fetchApplicationById(id: string): Promise<Application> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const app = mockApplications.find((a) => a.id === id)
    if (!app) throw new Error('Application not found')
    return app
  }
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
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('You must be signed in to apply')
    if (user.role !== 'STUDENT') throw new Error('Only students can apply to projects')
    return mockCreateApplication({
      projectId: input.projectId,
      studentId: user.id,
      student: { id: user.id, name: user.name, email: user.email },
      screeningAnswers: input.screeningAnswers,
    })
  }
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
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const app = mockApplications.find((a) => a.id === id)
    if (!app) throw new Error('Application not found')
    app.status = status
    app.updatedAt = new Date()
    return app
  }
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
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const idx = mockApplications.findIndex((a) => a.id === id)
    if (idx >= 0) mockApplications.splice(idx, 1)
    return
  }
  await apiClient.delete(`/applications/${id}`)
}
