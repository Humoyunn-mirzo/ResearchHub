import { apiClient } from '@/lib/api'
import {
  ApplicationSchema,
  type Application,
  type CreateApplicationInput,
  type ApplicationStatus,
} from '@/core/domain'
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
  const response = await apiClient.get('/applications', { params: filters })
  return ApplicationsResponseSchema.parse(response.data)
}

export async function fetchApplicationById(id: string): Promise<Application> {
  const response = await apiClient.get(`/applications/${id}`)
  return ApplicationSchema.parse(response.data)
}

export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const response = await apiClient.post('/applications', input)
  return ApplicationSchema.parse(response.data)
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  const response = await apiClient.patch(`/applications/${id}/status`, { status })
  return ApplicationSchema.parse(response.data)
}

export async function withdrawApplication(id: string): Promise<void> {
  await apiClient.delete(`/applications/${id}`)
}
