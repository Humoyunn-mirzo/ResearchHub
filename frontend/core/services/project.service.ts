import { apiClient } from '@/lib/api'
import { ProjectSchema, type Project, type CreateProjectInput, type UpdateProjectInput } from '@/core/domain'
import { z } from 'zod'

export type ProjectFilters = {
  search?: string
  tags?: string[]
  status?: 'OPEN' | 'CLOSED'
  professorId?: string
  page?: number
  limit?: number
}

type ProjectsResponse = {
  data: Project[]
  total: number
  page: number
  limit: number
}

const ProjectsResponseSchema = z.object({
  data: z.array(ProjectSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export async function fetchProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
  const response = await apiClient.get('/projects', { params: filters })
  return ProjectsResponseSchema.parse(response.data)
}

export async function fetchProjectById(id: string): Promise<Project> {
  const response = await apiClient.get(`/projects/${id}`)
  return ProjectSchema.parse(response.data)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await apiClient.post('/projects', input)
  return ProjectSchema.parse(response.data)
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const response = await apiClient.patch(`/projects/${id}`, input)
  return ProjectSchema.parse(response.data)
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`)
}

export async function closeProject(id: string): Promise<Project> {
  const response = await apiClient.post(`/projects/${id}/close`)
  return ProjectSchema.parse(response.data)
}
