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
