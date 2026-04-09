import axios from 'axios'
import { z } from 'zod'
import { env } from '@/lib/env'

const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

/** Resolves API base for browser requests (absolute URL or same-origin path). */
export function resolveApiBaseUrl(): string {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  if (base.startsWith('http')) return base
  if (typeof window === 'undefined') return base
  return `${window.location.origin}${base.startsWith('/') ? '' : '/'}${base}`
}

/**
 * Refresh session using the HttpOnly refresh cookie (path /api/auth/refresh).
 * Does not use apiClient to avoid circular dependency with auth interceptors.
 */
export async function postAuthRefresh(): Promise<{ accessToken: string; refreshToken: string }> {
  const url = `${resolveApiBaseUrl()}/auth/refresh`
  const res = await axios.post(url, {}, { withCredentials: true })
  return RefreshResponseSchema.parse(res.data)
}
