import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { DomainError, UnauthorizedError, NotFoundError, ValidationError } from '@/core/domain'

type ApiClientConfig = {
  baseUrl: string
  getToken?: () => string | null
  onUnauthorized?: () => void
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

  // Request interceptor - attach token
  client.interceptors.request.use(
    (requestConfig) => {
      const token = config.getToken?.()
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`
      }
      return requestConfig
    },
    (error: unknown) => Promise.reject(error)
  )

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; code?: string }>) => {
      if (error.response) {
        const { status, data } = error.response
        const message = data.message || 'An error occurred'

        switch (status) {
          case 401:
            config.onUnauthorized?.()
            return Promise.reject(new UnauthorizedError(message))
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
