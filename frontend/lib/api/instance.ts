import { createApiClient } from './client'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth'

export const apiClient = createApiClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getToken: () => {
    if (typeof window === 'undefined') return null
    return useAuthStore.getState().accessToken
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
  },
})
