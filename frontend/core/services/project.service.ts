import { apiClient } from '@/lib/api'
import { ProjectSchema, type Project, type CreateProjectInput, type UpdateProjectInput } from '@/core/domain'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth'
import {
  mockCloseProject,
  mockCreateProject,
  mockFetchProjectById,
  mockFetchProjects,
  mockProjects,
} from './mock-db'
import { z } from 'zod'

export type ProjectFilters = {
  search?: string
  tags?: string[]
  status?: 'OPEN' | 'CLOSED'
  professorId?: string
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest'
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
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    return mockFetchProjects(filters)
  }
  const response = await apiClient.get('/projects', { params: filters })
  return ProjectsResponseSchema.parse(response.data)
}

export async function fetchProjectById(id: string): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const project = mockFetchProjectById(id)
    if (!project) throw new Error('Project not found')
    return project
  }
  const response = await apiClient.get(`/projects/${id}`)
  return ProjectSchema.parse(response.data)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('You must be signed in to create a project')
    if (user.role !== 'PROFESSOR') throw new Error('Only professors can create projects')

    const professor = { id: user.id, name: user.name, email: user.email }
    return mockCreateProject({ ...input, professorId: user.id, professor })
  }
  const response = await apiClient.post('/projects', input)
  return ProjectSchema.parse(response.data)
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const project = mockProjects.find((p) => p.id === id)
    if (!project) throw new Error('Project not found')
    Object.assign(project, input)
    return ProjectSchema.parse(project)
  }
  const response = await apiClient.patch(`/projects/${id}`, input)
  return ProjectSchema.parse(response.data)
}

export async function deleteProject(id: string): Promise<void> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const idx = mockProjects.findIndex((p) => p.id === id)
    if (idx >= 0) mockProjects.splice(idx, 1)
    return
  }
  await apiClient.delete(`/projects/${id}`)
}

export async function closeProject(id: string): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const project = mockCloseProject(id)
    if (!project) throw new Error('Project not found')
    return ProjectSchema.parse(project)
  }
  const response = await apiClient.post(`/projects/${id}/close`)
  return ProjectSchema.parse(response.data)
}
