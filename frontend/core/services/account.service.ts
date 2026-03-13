import { apiClient } from '@/lib/api'

export type UpdateProfileInput = {
  name?: string
}

export async function updateAccountProfile(
  userId: string,
  role: string,
  input: UpdateProfileInput
): Promise<void> {
  if (role === 'STUDENT') {
    await apiClient.patch(`/students/${userId}`, { name: input.name })
  } else if (role === 'PROFESSOR') {
    await apiClient.patch(`/professors/${userId}`, { name: input.name })
  } else {
    await apiClient.patch(`/users/${userId}`, { name: input.name })
  }
}
