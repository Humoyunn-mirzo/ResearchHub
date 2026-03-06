import { apiClient } from '@/lib/api'

export type AdminUser = {
  id: string
  email: string
  name: string
  role: string
  universityId?: string | null
}

export type UserFilters = {
  page?: number
  limit?: number
  search?: string
  role?: string
}

export type UsersResponse = {
  data: AdminUser[]
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

function mapUser(item: Record<string, unknown>): AdminUser {
  return {
    id: String(item.id ?? ''),
    email: String(item.email ?? ''),
    name: String(item.name ?? ''),
    role: String(item.role ?? 'STUDENT'),
    universityId: item.universityId != null ? String(item.universityId) : null,
  }
}

function mapBackendResponse(body: {
  data?: unknown[]
  pagination?: { number: number; size: number; totalElements: number }
}): UsersResponse {
  const items = Array.isArray(body.data) ? body.data : []
  const pagination = body.pagination ?? { number: 0, size: 20, totalElements: items.length }
  return {
    data: items.map((u) => mapUser(u as Record<string, unknown>)),
    total: Number(pagination.totalElements),
    page: Number(pagination.number) + 1,
    limit: Number(pagination.size),
  }
}

export async function fetchUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const response = await apiClient.get('/users', {
    params: cleanParams({
      page: page - 1,
      size: limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.role && { role: filters.role }),
    }),
  })
  return mapBackendResponse(response.data as Parameters<typeof mapBackendResponse>[0])
}

export async function fetchUserById(id: string): Promise<AdminUser> {
  const response = await apiClient.get(`/users/${id}`)
  const body = response.data as { data?: Record<string, unknown> }
  const user = (body.data ?? response.data) as Record<string, unknown>
  return mapUser(user)
}

export type CreateUserInput = {
  email: string
  password: string
  name?: string
  role: string
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const response = await apiClient.post('/users', {
    email: input.email,
    password: input.password,
    name: input.name ?? input.email,
    role: input.role,
  })
  const body = response.data as { data?: Record<string, unknown> }
  const user = (body.data ?? response.data) as Record<string, unknown>
  return mapUser(user)
}

export type UpdateUserInput = {
  name?: string
  role?: string
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const response = await apiClient.patch(`/users/${id}`, input)
  const body = response.data as { data?: Record<string, unknown> }
  const user = (body.data ?? response.data) as Record<string, unknown>
  return mapUser(user)
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.post(`/users/${id}/reset-password`, { newPassword })
}
