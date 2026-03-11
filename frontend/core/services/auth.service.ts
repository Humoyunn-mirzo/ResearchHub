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

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/login', input)
  return LoginResponseSchema.parse(response.data)
}

export async function register(input: RegisterInput): Promise<LoginResponse> {
  // Backend currently supports only {email,password,role} for registration.
  const response = await apiClient.post('/auth/register', {
    email: input.email,
    password: input.password,
    role: input.role,
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
