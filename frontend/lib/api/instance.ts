import { createApiClient } from './client'
import { env } from '@/lib/env'

export const apiClient = createApiClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
  },
})
