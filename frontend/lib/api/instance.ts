import { createApiClient } from './client'
import { postAuthRefresh } from './refresh'
import { env } from '@/lib/env'
import { useAuthStore } from '@/lib/auth'

let refreshInFlight: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const tokens = await postAuthRefresh()
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
        return true
      } catch {
        return false
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export const apiClient = createApiClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getToken: () => useAuthStore.getState().accessToken,
  refreshSession,
  onUnauthorized: () => {
    if (typeof window === 'undefined') return
    useAuthStore.getState().clearAuth()
    const path = window.location.pathname
    if (path === '/login' || path === '/register') return
    window.location.href = '/login'
  },
})
