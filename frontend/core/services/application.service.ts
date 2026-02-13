import { apiClient } from '@/lib/api'
import {
  ApplicationSchema,
  type Application,
  type CreateApplicationInput,
  type ApplicationStatus,
} from '@/core/domain'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth'
import { mockCreateApplication, mockFetchApplications, mockApplications } from './mock-db'
import { z } from 'zod'

type ApplicationsResponse = {
  data: Application[]
  total: number
  page: number
  limit: number
}

const ApplicationsResponseSchema = z.object({
  data: z.array(ApplicationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type ApplicationFilters = {
  projectId?: string
  studentId?: string
  status?: ApplicationStatus
  page?: number
  limit?: number
}

export async function fetchApplications(
  filters: ApplicationFilters = {}
): Promise<ApplicationsResponse> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    return mockFetchApplications(filters)
  }
  const response = await apiClient.get('/applications', { params: filters })
  return ApplicationsResponseSchema.parse(response.data)
}

export async function fetchApplicationById(id: string): Promise<Application> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const app = mockApplications.find((a) => a.id === id)
    if (!app) throw new Error('Application not found')
    return ApplicationSchema.parse(app)
  }
  const response = await apiClient.get(`/applications/${id}`)
  return ApplicationSchema.parse(response.data)
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('You must be signed in to apply')
    if (user.role !== 'STUDENT') throw new Error('Only students can apply to projects')
    return ApplicationSchema.parse(
      mockCreateApplication({
        projectId: input.projectId,
        motivation: input.motivation,
        studentId: user.id,
        student: { id: user.id, name: user.name, email: user.email },
      })
    )
  }
  const response = await apiClient.post('/applications', input)
  return ApplicationSchema.parse(response.data)
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
    return ApplicationSchema.parse(app)
  }
  const response = await apiClient.patch(`/applications/${id}/status`, { status })
  return ApplicationSchema.parse(response.data)
}

export async function withdrawApplication(id: string): Promise<void> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const idx = mockApplications.findIndex((a) => a.id === id)
    if (idx >= 0) mockApplications.splice(idx, 1)
    return
  }
  await apiClient.delete(`/applications/${id}`)
}
