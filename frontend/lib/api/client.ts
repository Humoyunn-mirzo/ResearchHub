import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios'
import { DomainError, UnauthorizedError, NotFoundError, ValidationError } from '@/core/domain'

type ApiClientConfig = {
  baseUrl: string
  getToken?: () => string | null
  /** Return true if a new access token was obtained (cookies + store updated elsewhere). */
  refreshSession?: () => Promise<boolean>
  onUnauthorized?: () => void
}

function shouldAttemptRefreshForUrl(url: string | undefined): boolean {
  if (!url) return true
  let path = url
  try {
    if (url.includes('://')) path = new URL(url).pathname
  } catch {
    /* relative axios url */
  }
  const norm = path.startsWith('/') ? path : `/${path}`
  const blocked = [
    '/auth/login',
    '/auth/register',
    '/auth/register-professor',
    '/auth/bootstrap',
    '/auth/refresh',
  ]
  return !blocked.some((b) => norm === b || norm.startsWith(`${b}/`) || norm.startsWith(`${b}?`))
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: 30000,
    // Needed so refresh-token cookies (if any) can be sent/received.
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - attach token, fix Content-Type for FormData
  client.interceptors.request.use(
    (requestConfig) => {
      const token = config.getToken?.()
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`
      }
      // FormData must not have Content-Type set; browser/axios sets multipart boundary
      if (requestConfig.data instanceof FormData && requestConfig.headers) {
        delete requestConfig.headers['Content-Type']
      }
      return requestConfig
    },
    (error: unknown) => Promise.reject(error)
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string; code?: string }>) => {
      if (error.response) {
        const { status, data } = error.response
        const message = data.message || 'An error occurred'

        switch (status) {
          case 401: {
            const original = error.config as (InternalAxiosRequestConfig & { _authRetried?: boolean }) | undefined
            const url = original?.url
            if (
              original &&
              !original._authRetried &&
              shouldAttemptRefreshForUrl(url) &&
              config.refreshSession
            ) {
              original._authRetried = true
              const ok = await config.refreshSession()
              if (ok) {
                return client.request(original)
              }
            }
            config.onUnauthorized?.()
            return Promise.reject(new UnauthorizedError(message))
          }
          case 403:
            return Promise.reject(new DomainError(message, 'FORBIDDEN', 403))
          case 404:
            return Promise.reject(new NotFoundError('Resource', 'unknown'))
          case 422:
            return Promise.reject(new ValidationError(message))
          default:
            return Promise.reject(new DomainError(message, data.code || 'UNKNOWN', status))
        }
      }

      if (error.request) {
        return Promise.reject(new DomainError('Network error', 'NETWORK_ERROR', 0))
      }

      return Promise.reject(new DomainError('Request setup error', 'REQUEST_ERROR', 0))
    }
  )

  return client
}

export type { AxiosRequestConfig as RequestConfig }
