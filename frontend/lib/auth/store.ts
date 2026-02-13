'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/core/domain'

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
}

function setCookie(name: string, value: string, options: { maxAgeSeconds?: number } = {}) {
  if (typeof document === 'undefined') return
  const maxAge = options.maxAgeSeconds != null ? `; Max-Age=${options.maxAgeSeconds}` : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set(() => {
          // Cookie is used by Next.js middleware for route protection.
          setCookie('access_token', accessToken)
          return {
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          }
        }),
      clearAuth: () =>
        set(() => {
          setCookie('access_token', '', { maxAgeSeconds: 0 })
          return {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          }
        }),
      updateUser: (userUpdate) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdate } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
