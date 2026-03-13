import { apiClient } from '@/lib/api'
import { UserSchema, type User } from '@/core/domain'
import { z } from 'zod'

const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

type LoginResponse = z.infer<typeof LoginResponseSchema>

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  role: 'STUDENT' | 'PROFESSOR'
  universityId?: string
}

export type RegisterProfessorInput = {
  name: string
  email: string
  password: string
  fieldOfStudy?: string
  universityId?: string
  cvFile: File
}

export async function registerProfessor(input: RegisterProfessorInput): Promise<LoginResponse> {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('email', input.email)
  formData.append('password', input.password)
  formData.append('fieldOfStudy', input.fieldOfStudy ?? 'General')
  if (input.universityId) formData.append('universityId', input.universityId)
  formData.append('cv', input.cvFile)
  const response = await apiClient.post('/auth/register-professor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return LoginResponseSchema.parse(response.data)
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/login', input)
  return LoginResponseSchema.parse(response.data)
}

export async function register(input: RegisterInput): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/register', {
    email: input.email,
    password: input.password,
    role: input.role,
    name: input.name,
  })
  return LoginResponseSchema.parse(response.data)
}

export async function registerProfessor(input: RegisterProfessorInput): Promise<LoginResponse> {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('email', input.email)
  formData.append('password', input.password)
  formData.append('fieldOfStudy', input.fieldOfStudy ?? 'General')
  if (input.universityId) formData.append('universityId', input.universityId)
  formData.append('cv', input.cv)
  const response = await apiClient.post('/auth/register-professor', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return LoginResponseSchema.parse(response.data)
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/auth/me')
  return UserSchema.parse(response.data)
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const response = await apiClient.post('/auth/refresh', { refreshToken })
  return z.object({ accessToken: z.string() }).parse(response.data)
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function checkBootstrapAvailable(): Promise<{ available: boolean }> {
  const response = await apiClient.get('/auth/bootstrap-available')
  return z.object({ available: z.boolean() }).parse(response.data)
}

export async function bootstrap(input: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/bootstrap', input)
  const data = response.data as { success: boolean; message?: string; accessToken?: string; refreshToken?: string; user?: unknown }
  if (!data.success || !data.accessToken || !data.refreshToken || !data.user) {
    throw new Error(data.message ?? 'Bootstrap failed')
  }
  return LoginResponseSchema.parse({
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  })
}
