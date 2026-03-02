import { apiClient } from '@/lib/api'
import { type Project, type CreateProjectInput, type UpdateProjectInput } from '@/core/domain'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth'
import {
  mockCloseProject,
  mockCreateProject,
  mockFetchProjectById,
  mockFetchProjects,
  mockProjects,
} from './mock-db'

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


function cleanParams<T extends Record<string, unknown>>(params: T): T {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  ) as T
}

function mapBackendProjectToFrontend(p: Record<string, unknown>): Project {
  return {
    id: String(p.id),
    title: String(p.title ?? ''),
    description: String(p.description ?? ''),
    professorId: p.professorId != null ? String(p.professorId) : '',
    status: (p.status as 'OPEN' | 'CLOSED') ?? 'OPEN',
    maxStudents: typeof p.maxStudents === 'number' ? p.maxStudents : null,
    currentStudents: typeof p.currentStudents === 'number' ? p.currentStudents : 0,
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [p.field, p.regionFocus].filter(Boolean).map(String),
    interviewQuestions: Array.isArray(p.interviewQuestions) ? p.interviewQuestions : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt as string) : new Date(),
    professor: p.professor as Project['professor'],
  }
}

export async function fetchProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    return mockFetchProjects(filters)
  }
  const page = filters.page ?? 1
  const limit = filters.limit ?? 12
  const response = await apiClient.get('/projects', {
    params: cleanParams({
      page: page - 1,
      size: limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
    }),
  })
  const body = response.data as {
    data?: unknown[]
    pagination?: { number: number; size: number; totalElements: number }
  }
  const items = Array.isArray(body.data) ? body.data : []
  const pagination = body.pagination ?? { number: 0, size: limit, totalElements: items.length }
  return {
    data: items.map((p) => mapBackendProjectToFrontend(p as Record<string, unknown>)),
    total: Number(pagination.totalElements),
    page: Number(pagination.number) + 1,
    limit: Number(pagination.size),
  }
}

export async function fetchProjectById(id: string): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const project = mockFetchProjectById(id)
    if (!project) throw new Error('Project not found')
    return project
  }
  const response = await apiClient.get(`/projects/${id}`)
  const body = response.data as { data?: Record<string, unknown> }
  const raw = body.data ?? response.data
  return mapBackendProjectToFrontend(raw as Record<string, unknown>)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('You must be signed in to create a project')
    if (user.role !== 'PROFESSOR') throw new Error('Only professors can create projects')

    const professor = { id: user.id, name: user.name, email: user.email }
    return mockCreateProject({
      ...input,
      professorId: user.id,
      professor,
      interviewQuestions: input.interviewQuestions,
    })
  }
  const response = await apiClient.post('/projects', input)
  const body = response.data as { data?: Record<string, unknown> }
  const raw = body.data ?? response.data
  return mapBackendProjectToFrontend(raw as Record<string, unknown>)
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  if (env.NEXT_PUBLIC_DATA_MODE === 'mock') {
    const project = mockProjects.find((p) => p.id === id)
    if (!project) throw new Error('Project not found')
    Object.assign(project, input)
    return project
  }
  const response = await apiClient.patch(`/projects/${id}`, input)
  const body = response.data as { data?: Record<string, unknown> }
  const raw = body.data ?? response.data
  return mapBackendProjectToFrontend(raw as Record<string, unknown>)
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
    return project
  }
  const response = await apiClient.post(`/projects/${id}/close`)
  const body = response.data as { data?: Record<string, unknown> }
  const raw = body.data ?? response.data
  return mapBackendProjectToFrontend(raw as Record<string, unknown>)
}
